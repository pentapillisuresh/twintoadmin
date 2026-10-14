
import { useEffect, useState } from "react";

import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "../services/couponService";

import Modal from "../components/common/Modal";
import Loader from "../components/common/Loader";

const blank = {
  code: "",
  description: "",
  discountType: "PERCENTAGE",
  discountValue: "",
  minimumOrderAmount: "0",
  maximumDiscount: "",
  usageLimit: "",
  startDate: "",
  endDate: "",
  isActive: true,
};

const fields = [
  {
    key: "code",
    label: "Coupon Code",
    required: true,
  },
  {
    key: "description",
    label: "Description",
  },
  {
    key: "discountValue",
    label: "Discount Value",
    type: "number",
    required: true,
    min: "0.01",
    step: "0.01",
  },
  {
    key: "minimumOrderAmount",
    label: "Minimum Order Amount (₹)",
    type: "number",
    min: "0",
    step: "0.01",
  },
  {
    key: "maximumDiscount",
    label: "Maximum Discount (₹)",
    type: "number",
    min: "0",
    step: "0.01",
  },
  {
    key: "usageLimit",
    label: "Usage Limit",
    type: "number",
    min: "1",
    step: "1",
  },
  {
    key: "startDate",
    label: "Start Date",
    type: "datetime-local",
  },
  {
    key: "endDate",
    label: "End Date",
    type: "datetime-local",
  },
];

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...blank });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadCoupons() {
    setLoading(true);
    setError("");

    try {
      const response = await getCoupons();
      const data = response.data?.data ?? response.data;

      setCoupons(
        Array.isArray(data)
          ? data
          : data?.coupons ?? []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load coupons. Please check your API."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCoupons();
  }, []);

  function openForm(coupon = null) {
    setError("");
    setEditing(coupon);

    if (coupon) {
      setForm({
        ...blank,
        ...coupon,
        discountValue: String(coupon.discountValue ?? ""),
        minimumOrderAmount: String(
          coupon.minimumOrderAmount ?? 0
        ),
        maximumDiscount:
          coupon.maximumDiscount == null
            ? ""
            : String(coupon.maximumDiscount),
        usageLimit:
          coupon.usageLimit == null
            ? ""
            : String(coupon.usageLimit),
        startDate: coupon.startDate
          ? String(coupon.startDate).slice(0, 16)
          : "",
        endDate: coupon.endDate
          ? String(coupon.endDate).slice(0, 16)
          : "",
      });
    } else {
      setForm({ ...blank });
    }

    setOpen(true);
  }

  function updateField(key, value) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const discountValue = Number(form.discountValue);
    const minimumOrderAmount = Number(
      form.minimumOrderAmount || 0
    );

    if (!form.code.trim()) {
      setError("Coupon code is required.");
      return;
    }

    if (
      !Number.isFinite(discountValue) ||
      discountValue <= 0
    ) {
      setError("Enter a valid discount value.");
      return;
    }

    if (
      form.discountType === "PERCENTAGE" &&
      discountValue > 100
    ) {
      setError("Percentage discount cannot exceed 100%.");
      return;
    }

    if (
      !Number.isFinite(minimumOrderAmount) ||
      minimumOrderAmount < 0
    ) {
      setError("Minimum order amount cannot be negative.");
      return;
    }

    const maximumDiscount =
      form.maximumDiscount === ""
        ? null
        : Number(form.maximumDiscount);

    if (
      maximumDiscount !== null &&
      (!Number.isFinite(maximumDiscount) ||
        maximumDiscount < 0)
    ) {
      setError("Maximum discount must be zero or greater.");
      return;
    }

    const usageLimit =
      form.usageLimit === ""
        ? null
        : Number(form.usageLimit);

    if (
      usageLimit !== null &&
      (!Number.isInteger(usageLimit) || usageLimit < 1)
    ) {
      setError("Usage limit must be a positive whole number.");
      return;
    }

    const startDate = form.startDate
      ? new Date(form.startDate)
      : null;

    const endDate = form.endDate
      ? new Date(form.endDate)
      : null;

    if (
      (startDate && Number.isNaN(startDate.getTime())) ||
      (endDate && Number.isNaN(endDate.getTime()))
    ) {
      setError("Enter valid coupon dates.");
      return;
    }

    if (
      startDate &&
      endDate &&
      endDate < startDate
    ) {
      setError("End date must be after the start date.");
      return;
    }

    const payload = {
      ...form,
      code: form.code.trim().toUpperCase(),
      description: form.description.trim(),
      discountValue,
      minimumOrderAmount,
      maximumDiscount,
      usageLimit,
      startDate: startDate
        ? startDate.toISOString()
        : null,
      endDate: endDate
        ? endDate.toISOString()
        : null,
      isActive: Boolean(form.isActive),
    };

    setSaving(true);

    try {
      if (editing) {
        await updateCoupon(editing.id, payload);
      } else {
        await createCoupon(payload);
      }

      setOpen(false);
      setEditing(null);
      setForm({ ...blank });

      await loadCoupons();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to save coupon."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this coupon?"
    );

    if (!confirmed) return;

    setError("");

    try {
      await deleteCoupon(id);
      await loadCoupons();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to delete coupon."
      );
    }
  }

  function formatDate(value) {
    if (!value) return "No expiry";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Coupons
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage promotional discounts and coupon validity.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openForm()}
          className="rounded-xl bg-[#C9004F] px-4 py-2.5 font-semibold text-white transition hover:bg-[#A90042]"
        >
          + Add Coupon
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          <p>{error}</p>

          <button
            type="button"
            onClick={() => setError("")}
            className="font-semibold"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* Coupons table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8">
            <Loader />
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-pink-50 text-2xl text-[#C9004F]">
              %
            </div>

            <h2 className="font-semibold text-slate-900">
              No coupons found
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Create your first coupon to offer discounts.
            </p>

            <button
              type="button"
              onClick={() => openForm()}
              className="mt-4 rounded-xl bg-[#C9004F] px-4 py-2 text-sm font-medium text-white hover:bg-[#A90042]"
            >
              Create Coupon
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-4 text-left">Coupon</th>
                  <th className="p-4 text-left">Discount</th>
                  <th className="p-4 text-left">Min. Order</th>
                  <th className="p-4 text-left">Usage Limit</th>
                  <th className="p-4 text-left">Valid Until</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {coupons.map((coupon) => (
                  <tr
                    key={coupon.id}
                    className="border-t border-slate-100 transition hover:bg-slate-50"
                  >
                    <td className="p-4">
                      <p className="font-bold text-slate-900">
                        {coupon.code}
                      </p>

                      <p className="mt-1 max-w-48 truncate text-xs text-slate-500">
                        {coupon.description || "No description"}
                      </p>
                    </td>

                    <td className="p-4 font-semibold text-[#C9004F]">
                      {coupon.discountType === "PERCENTAGE"
                        ? `${coupon.discountValue}%`
                        : `₹${coupon.discountValue}`}
                    </td>

                    <td className="p-4">
                      ₹
                      {Number(
                        coupon.minimumOrderAmount || 0
                      ).toLocaleString("en-IN")}
                    </td>

                    <td className="p-4">
                      {coupon.usageLimit ?? "Unlimited"}
                    </td>

                    <td className="p-4">
                      {formatDate(coupon.endDate)}
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          coupon.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {coupon.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="p-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openForm(coupon)}
                        className="mr-3 font-medium text-[#C9004F] hover:underline"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(coupon.id)}
                        className="font-medium text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / edit modal */}
      <Modal
        open={open}
        onClose={() => {
          if (!saving) setOpen(false);
        }}
        title={editing ? "Edit Coupon" : "Create Coupon"}
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <div
                key={field.key}
                className={
                  field.key === "description"
                    ? "sm:col-span-2"
                    : ""
                }
              >
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  {field.label}
                  {field.required ? " *" : ""}
                </label>

                <input
                  type={field.type || "text"}
                  required={Boolean(field.required)}
                  min={field.min}
                  step={field.step}
                  value={form[field.key] ?? ""}
                  disabled={saving}
                  onChange={(event) =>
                    updateField(field.key, event.target.value)
                  }
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 outline-none transition focus:border-[#C9004F] focus:ring-2 focus:ring-pink-100 disabled:bg-slate-50"
                />
              </div>
            ))}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Discount Type *
              </label>

              <select
                required
                value={form.discountType}
                disabled={saving}
                onChange={(event) =>
                  updateField("discountType", event.target.value)
                }
                className="h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-[#C9004F] focus:ring-2 focus:ring-pink-100"
              >
                <option value="PERCENTAGE">
                  Percentage (%)
                </option>

                <option value="FIXED">
                  Fixed Amount (₹)
                </option>
              </select>
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={Boolean(form.isActive)}
                  disabled={saving}
                  onChange={(event) =>
                    updateField("isActive", event.target.checked)
                  }
                  className="h-4 w-4 accent-[#C9004F]"
                />

                Coupon is active
              </label>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={saving}
              onClick={() => setOpen(false)}
              className="rounded-xl border border-slate-200 px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#C9004F] px-5 py-2.5 font-semibold text-white hover:bg-[#A90042] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : editing
                  ? "Update Coupon"
                  : "Create Coupon"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
