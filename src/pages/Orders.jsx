
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getOrders } from "../services/orderService";
import Loader from "../components/common/Loader";

const statuses = [
  "PLACED",
  "CONFIRMED",
  "PACKING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function StatusBadge({ status }) {
  const styles = {
    PLACED: "bg-blue-50 text-blue-700",
    CONFIRMED: "bg-indigo-50 text-indigo-700",
    PACKING: "bg-amber-50 text-amber-700",
    OUT_FOR_DELIVERY: "bg-purple-50 text-purple-700",
    DELIVERED: "bg-emerald-50 text-emerald-700",
    CANCELLED: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {(status || "UNKNOWN").replaceAll("_", " ")}
    </span>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  async function loadOrders() {
    setLoading(true);
    setError("");

    try {
      const response = await getOrders(
        status ? { status } : {}
      );

      const data = response.data?.data ?? response.data;

      setOrders(
        Array.isArray(data)
          ? data
          : data?.orders ?? []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load orders."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, [status]);

  const filteredOrders = orders.filter((order) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return [
      order.orderNumber,
      order.user?.name,
      order.user?.mobile,
      order.user?.email,
      order.status,
    ].some((value) =>
      String(value || "").toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Orders
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage customer orders, payments, and delivery status.
          </p>
        </div>

        <button
          type="button"
          onClick={loadOrders}
          disabled={loading}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Refresh Orders
        </button>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search order number, customer or mobile..."
          className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 px-3 outline-none focus:border-[#C9004F] focus:ring-2 focus:ring-pink-100"
        />

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="h-11 rounded-xl border border-slate-200 px-3 outline-none focus:border-[#C9004F]"
        >
          <option value="">All Statuses</option>

          {statuses.map((item) => (
            <option key={item} value={item}>
              {item.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            className="font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Orders table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <h2 className="font-semibold text-slate-900">
            Order List
          </h2>

          <span className="text-sm text-slate-500">
            {filteredOrders.length} orders
          </span>
        </div>

        {loading ? (
          <div className="p-8">
            <Loader />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-10 text-center">
            <h3 className="font-semibold text-slate-900">
              No orders found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-4 text-left">Order</th>
                  <th className="p-4 text-left">Customer</th>
                  <th className="p-4 text-left">Total</th>
                  <th className="p-4 text-left">Payment</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Date</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-t border-slate-100 transition hover:bg-slate-50"
                  >
                    <td className="p-4">
                      <p className="font-semibold text-slate-900">
                        {order.orderNumber || `#${order.id}`}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        ID: {order.id}
                      </p>
                    </td>

                    <td className="p-4">
                      <p className="font-medium text-slate-800">
                        {order.user?.name ||
                          order.user?.mobile ||
                          "Customer"}
                      </p>

                      {order.user?.name && (
                        <p className="mt-1 text-xs text-slate-500">
                          {order.user?.mobile || "-"}
                        </p>
                      )}
                    </td>

                    <td className="p-4 font-semibold text-slate-900">
                      {formatCurrency(order.total)}
                    </td>

                    <td className="p-4">
                      <p>{order.paymentMethod || "-"}</p>

                      <p className="mt-1 text-xs text-slate-500">
                        {order.paymentStatus || "UNKNOWN"}
                      </p>
                    </td>

                    <td className="p-4">
                      <StatusBadge status={order.status} />
                    </td>

                    <td className="p-4 whitespace-nowrap text-slate-600">
                      {order.createdAt
                        ? new Date(
                            order.createdAt
                          ).toLocaleDateString("en-IN")
                        : "-"}
                    </td>

                    <td className="p-4 text-right">
                      <Link
                        to={`/orders/${order.id}`}
                        className="inline-flex rounded-lg bg-pink-50 px-3 py-2 font-semibold text-[#C9004F] hover:bg-pink-100"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
