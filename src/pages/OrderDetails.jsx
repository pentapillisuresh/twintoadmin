
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getOrderById,
  updateOrderStatus,
  assignDeliveryPerson,
  getWhatsAppDetails,
} from "../services/orderService";

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

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <span className="text-slate-500">{label}</span>

      <span className="text-right font-medium text-slate-800">
        {value || "-"}
      </span>
    </div>
  );
}

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [sharing, setSharing] = useState(false);

  async function loadOrder() {
    setLoading(true);
    setError("");

    try {
      const response = await getOrderById(id);
      const data = response.data?.data ?? response.data;
      const result = data?.order ?? data;

      setOrder(result);

      setName(result?.assignedPersonName || "");
      setMobile(result?.assignedPersonMobile || "");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load order details."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrder();
  }, [id]);

  async function handleStatusChange(event) {
    const nextStatus = event.target.value;

    if (!order || nextStatus === order.status) return;

    const previousStatus = order.status;

    setError("");
    setUpdatingStatus(true);

    try {
      const response = await updateOrderStatus(id, nextStatus);
      const data = response.data?.data ?? response.data;

      setOrder((previous) => ({
        ...previous,
        ...(data?.order ?? data),
        status:
          (data?.order ?? data)?.status || nextStatus,
      }));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update order status."
      );

      setOrder((previous) => ({
        ...previous,
        status: previousStatus,
      }));
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function handleAssign(event) {
    event.preventDefault();
    setError("");

    if (!name.trim() || !mobile.trim()) {
      setError(
        "Enter both the delivery person's name and mobile number."
      );
      return;
    }

    setAssigning(true);

    try {
      const response = await assignDeliveryPerson(
        id,
        name.trim(),
        mobile.trim()
      );

      const data = response.data?.data ?? response.data;

      setOrder((previous) => ({
        ...previous,
        ...(data?.order ?? data),
        assignedPersonName:
          (data?.order ?? data)?.assignedPersonName ||
          name.trim(),
        assignedPersonMobile:
          (data?.order ?? data)?.assignedPersonMobile ||
          mobile.trim(),
      }));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to assign delivery person."
      );
    } finally {
      setAssigning(false);
    }
  }

  async function handleWhatsApp() {
    setError("");
    setSharing(true);

    try {
      const response = await getWhatsAppDetails(id);
      const data = response.data?.data ?? response.data;

      const url =
        data?.whatsappUrl ||
        data?.url;

      if (!url) {
        setError(
          "The backend did not return a WhatsApp sharing URL."
        );
        return;
      }

      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to prepare WhatsApp message."
      );
    } finally {
      setSharing(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <Loader />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm font-medium text-[#C9004F]"
        >
          ← Back to Orders
        </button>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error || "Order not found."}
        </div>
      </div>
    );
  }

  const address = order.address || {};
  const items = order.items || order.orderItems || [];

  return (
    <div className="space-y-5">
      {/* Navigation */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="text-sm font-medium text-slate-500 hover:text-[#C9004F]"
      >
        ← Back to Orders
      </button>

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
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">Order Details</p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            {order.orderNumber || `Order #${order.id}`}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {order.createdAt
              ? new Date(order.createdAt).toLocaleString("en-IN")
              : "-"}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <label className="text-xs font-medium text-slate-500">
            Update Order Status
          </label>

          <select
            value={order.status || "PLACED"}
            disabled={updatingStatus}
            onChange={handleStatusChange}
            className="h-11 rounded-xl border border-slate-200 px-3 outline-none focus:border-[#C9004F] disabled:opacity-50"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Items and totals */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Order Items
          </h2>

          {items.length === 0 ? (
            <p className="py-5 text-sm text-slate-500">
              No order items were returned by the API.
            </p>
          ) : (
            <div>
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 border-b border-slate-100 py-4 last:border-0"
                >
                  {item.productImage || item.image ? (
                    <img
                      src={item.productImage || item.image}
                      alt={item.productName || item.name || "Product"}
                      className="h-14 w-14 rounded-xl border border-slate-100 object-cover"
                    />
                  ) : (
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-pink-50 text-xs font-bold text-[#C9004F]">
                      ITEM
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900">
                      {item.productName ||
                        item.name ||
                        "Product"}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {formatCurrency(item.price)} ×{" "}
                      {item.quantity}
                    </p>
                  </div>

                  <p className="font-semibold text-slate-900">
                    {formatCurrency(
                      item.subtotal ??
                        Number(item.price || 0) *
                          Number(item.quantity || 0)
                    )}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Fee breakdown */}
          <div className="mt-5 space-y-1 border-t border-slate-200 pt-4">
            <DetailRow
              label="Item Total"
              value={formatCurrency(order.itemTotal)}
            />

            <DetailRow
              label="Platform Fee"
              value={formatCurrency(order.platformFee)}
            />

            <DetailRow
              label="Delivery Partner Fee"
              value={formatCurrency(order.deliveryPartnerFee)}
            />

            <DetailRow
              label="Discount"
              value={`−${formatCurrency(order.discount)}`}
            />

            <DetailRow
              label="Tip"
              value={formatCurrency(order.tip)}
            />

            <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-4">
              <span className="font-bold text-slate-900">
                Total Amount
              </span>

              <span className="text-xl font-bold text-[#C9004F]">
                {formatCurrency(order.total)}
              </span>
            </div>
          </div>
        </section>

        {/* Right column */}
        <div className="space-y-5">
          {/* Customer */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="mb-3 font-semibold text-slate-900">
              Customer Details
            </h2>

            <DetailRow
              label="Name"
              value={order.user?.name}
            />

            <DetailRow
              label="Mobile"
              value={order.user?.mobile}
            />

            <DetailRow
              label="Email"
              value={order.user?.email}
            />

            <DetailRow
              label="Payment Method"
              value={order.paymentMethod}
            />

            <DetailRow
              label="Payment Status"
              value={order.paymentStatus}
            />
          </section>

          {/* Delivery address */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="mb-3 font-semibold text-slate-900">
              Delivery Address
            </h2>

            <p className="font-medium text-slate-900">
              {address.name || "-"}
            </p>

            <div className="mt-2 space-y-1 text-sm text-slate-600">
              {address.addressLine1 && (
                <p>{address.addressLine1}</p>
              )}

              {address.addressLine2 && (
                <p>{address.addressLine2}</p>
              )}

              {address.landmark && (
                <p>Landmark: {address.landmark}</p>
              )}

              <p>
                {[address.city, address.state]
                  .filter(Boolean)
                  .join(", ") || "-"}
              </p>

              <p>
                {address.pincode
                  ? `Pincode: ${address.pincode}`
                  : ""}
              </p>

              <p>
                {address.mobile
                  ? `Mobile: ${address.mobile}`
                  : ""}
              </p>
            </div>
          </section>

          {/* Delivery person */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="mb-1 font-semibold text-slate-900">
              Assign Delivery Person
            </h2>

            <p className="mb-4 text-xs text-slate-500">
              Enter the person's name and mobile number.
            </p>

            <form
              onSubmit={handleAssign}
              className="space-y-3"
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Name
                </label>

                <input
                  required
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Delivery person's name"
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-[#C9004F]"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Mobile Number
                </label>

                <input
                  required
                  type="tel"
                  value={mobile}
                  onChange={(event) =>
                    setMobile(event.target.value)
                  }
                  placeholder="Mobile number"
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-[#C9004F]"
                />
              </div>

              <button
                type="submit"
                disabled={assigning}
                className="h-11 w-full rounded-xl bg-[#C9004F] font-semibold text-white hover:bg-[#A90042] disabled:opacity-50"
              >
                {assigning ? "Assigning..." : "Assign Person"}
              </button>
            </form>

            {order.assignedPersonName && (
              <div className="mt-4 rounded-xl bg-pink-50 p-3 text-sm">
                <p className="font-semibold text-slate-900">
                  Currently Assigned
                </p>

                <p className="mt-1 text-slate-700">
                  {order.assignedPersonName}
                </p>

                <p className="text-slate-500">
                  {order.assignedPersonMobile}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handleWhatsApp}
              disabled={sharing}
              className="mt-3 h-11 w-full rounded-xl border border-slate-200 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              {sharing
                ? "Preparing WhatsApp..."
                : "Share Order on WhatsApp"}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
