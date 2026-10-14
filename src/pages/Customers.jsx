
import { useEffect, useState } from "react";

import {
  getCustomers,
  updateCustomerStatus,
} from "../services/customerService";

import Loader from "../components/common/Loader";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  async function loadCustomers() {
    setLoading(true);
    setError("");

    try {
      const response = await getCustomers();
      const data = response.data?.data ?? response.data;

      setCustomers(
        Array.isArray(data)
          ? data
          : data?.customers ?? []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load customers."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  async function toggleCustomer(customer) {
    const nextStatus = !customer.isActive;

    const confirmed = window.confirm(
      `${nextStatus ? "Activate" : "Deactivate"} ${
        customer.name || "this customer"
      }?`
    );

    if (!confirmed) return;

    setError("");
    setUpdatingId(customer.id);

    try {
      await updateCustomerStatus(customer.id, nextStatus);

      await loadCustomers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update customer status."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Customers
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View registered customers and manage their account status.
        </p>
      </div>

      {/* Summary */}
      {!loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">
              Total Customers
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {customers.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">
              Active Customers
            </p>

            <p className="mt-2 text-2xl font-bold text-emerald-600">
              {customers.filter((customer) => customer.isActive).length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">
              Inactive Customers
            </p>

            <p className="mt-2 text-2xl font-bold text-red-500">
              {customers.filter((customer) => !customer.isActive).length}
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          <p>{error}</p>

          <button
            type="button"
            onClick={() => setError("")}
            className="font-bold"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* Customer table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <h2 className="font-semibold text-slate-900">
            Customer List
          </h2>

          <button
            type="button"
            onClick={loadCustomers}
            disabled={loading}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-8">
            <Loader />
          </div>
        ) : customers.length === 0 ? (
          <div className="p-10 text-center">
            <h3 className="font-semibold text-slate-900">
              No customers found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Registered customers will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-4 text-left">Customer</th>
                  <th className="p-4 text-left">Mobile</th>
                  <th className="p-4 text-left">Email</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-t border-slate-100 transition hover:bg-slate-50"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-pink-50 font-semibold text-[#C9004F]">
                          {(customer.name || "C")
                            .slice(0, 1)
                            .toUpperCase()}
                        </div>

                        <div>
                          <p className="font-medium text-slate-900">
                            {customer.name || "Unnamed Customer"}
                          </p>

                          <p className="text-xs text-slate-500">
                            ID: {customer.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-slate-700">
                      {customer.mobile || "-"}
                    </td>

                    <td className="p-4 text-slate-700">
                      {customer.email || "-"}
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          customer.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {customer.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        type="button"
                        disabled={updatingId === customer.id}
                        onClick={() => toggleCustomer(customer)}
                        className={`rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          customer.isActive
                            ? "border border-red-200 text-red-600 hover:bg-red-50"
                            : "bg-[#C9004F] text-white hover:bg-[#A90042]"
                        }`}
                      >
                        {updatingId === customer.id
                          ? "Updating..."
                          : customer.isActive
                            ? "Deactivate"
                            : "Activate"}
                      </button>
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
