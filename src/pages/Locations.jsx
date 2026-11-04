
import { useEffect, useState } from "react";

import {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation,
} from "../services/locationService";

import Modal from "../components/common/Modal";
import Loader from "../components/common/Loader";

const blank = {
  name: "",
  city: "",
  state: "",
  pincode: "",
  deliveryTime: "30-45 minutes",
  platformFee: 5,
  minimumOrder: 5,
  deliveryCharge: 30,
  freeDeliveryEnabled: true,
  freeDeliveryMaxItems: 3,
  isAvailable: true,
  isActive: true,
};

const inputClass =
  "mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[#C9004F] focus:ring-2 focus:ring-pink-100 disabled:bg-slate-50";

function FeeField({
  label,
  name,
  value,
  onChange,
  disabled,
  min = "0",
  step = "0.01",
  help,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-slate-700"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type="number"
        min={min}
        step={step}
        required
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(name, event.target.value)}
        className={inputClass}
      />

      {help && (
        <p className="mt-1.5 text-xs text-slate-500">
          {help}
        </p>
      )}
    </div>
  );
}

export default function Locations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...blank });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadLocations() {
    setLoading(true);
    setError("");

    try {
      const response = await getLocations();
      const data = response.data?.data ?? response.data;

      setLocations(
        Array.isArray(data) ? data : data?.locations ?? []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to load locations."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLocations();
  }, []);

  function openForm(location = null) {
    setError("");
    setEditing(location);

    setForm(
      location
        ? {
            name: location.name ?? "",
            city: location.city ?? "",
            state: location.state ?? "",
            pincode: location.pincode ?? "",
            deliveryTime:
              location.deliveryTime ?? "30-45 minutes",
            platformFee: location.platformFee ?? 5,
            minimumOrder: location.minimumOrder ?? 5,
            deliveryCharge: location.deliveryCharge ?? 30,
            freeDeliveryEnabled:
              location.freeDeliveryEnabled ?? true,
            freeDeliveryMaxItems:
              location.freeDeliveryMaxItems ?? 3,
            isAvailable: Boolean(location.isAvailable),
            isActive: Boolean(location.isActive),
          }
        : { ...blank }
    );

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

    const payload = {
      ...form,
      name: form.name.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: form.pincode.trim(),
      deliveryTime: String(form.deliveryTime).trim(),
      platformFee: Number(form.platformFee),
      minimumOrder: Number(form.minimumOrder),
      deliveryCharge: Number(form.deliveryCharge),
      freeDeliveryEnabled: Boolean(form.freeDeliveryEnabled),
      freeDeliveryMaxItems: Number(form.freeDeliveryMaxItems),
    };

    if (
      !payload.name ||
      !payload.city ||
      !payload.state ||
      !payload.pincode ||
      !payload.deliveryTime
    ) {
      setError(
        "Please fill in all required location fields."
      );
      return;
    }

    for (const [label, value] of [
      ["Platform fee", payload.platformFee],
      ["Minimum order", payload.minimumOrder],
      ["Delivery charge", payload.deliveryCharge],
    ]) {
      if (!Number.isFinite(value) || value < 0) {
        setError(
          `${label} must be a valid non-negative amount.`
        );
        return;
      }
    }

    if (
      !Number.isInteger(payload.freeDeliveryMaxItems) ||
      payload.freeDeliveryMaxItems < 0 ||
      payload.freeDeliveryMaxItems > 100
    ) {
      setError(
        "Free delivery item limit must be a whole number between 0 and 100."
      );
      return;
    }

    setSaving(true);

    try {
      if (editing) {
        await updateLocation(editing.id, payload);
      } else {
        await createLocation(payload);
      }

      setOpen(false);
      setEditing(null);
      setForm({ ...blank });

      await loadLocations();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to save location."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (
      !window.confirm(
        "Are you sure you want to delete this location?"
      )
    ) {
      return;
    }

    setError("");

    try {
      await deleteLocation(id);
      await loadLocations();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to delete location."
      );
    }
  }

  const currency = (value) =>
    `₹${Number(value ?? 0).toLocaleString("en-IN")}`;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Locations
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage delivery areas and configure fees separately
            for each location.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openForm()}
          className="rounded-xl bg-[#C9004F] px-4 py-2.5 font-semibold text-white transition hover:bg-[#A90042]"
        >
          + Add Location
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          <p>{error}</p>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
            className="font-bold"
          >
            ×
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8">
            <Loader />
          </div>
        ) : locations.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-pink-50 text-2xl text-[#C9004F]">
              ⌖
            </div>

            <h2 className="font-semibold text-slate-900">
              No locations found
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Add your first delivery area to get started.
            </p>

            <button
              type="button"
              onClick={() => openForm()}
              className="mt-4 rounded-xl bg-[#C9004F] px-4 py-2 text-sm font-semibold text-white hover:bg-[#A90042]"
            >
              Add Location
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-4 text-left">Location</th>
                  <th className="p-4 text-left">City / State</th>
                  <th className="p-4 text-left">Pincode</th>
                  <th className="p-4 text-left">Platform Fee</th>
                  <th className="p-4 text-left">Minimum Order</th>
                  <th className="p-4 text-left">Delivery Charge</th>
                  <th className="p-4 text-left">Free Delivery</th>
                  <th className="p-4 text-left">Availability</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {locations.map((location) => (
                  <tr
                    key={location.id}
                    className="border-t border-slate-100 transition hover:bg-slate-50"
                  >
                    <td className="p-4 font-semibold text-slate-900">
                      {location.name}

                      <p className="mt-1 text-xs font-normal text-slate-500">
                        {location.deliveryTime || "-"}
                      </p>
                    </td>

                    <td className="p-4">
                      {location.city}, {location.state}
                    </td>

                    <td className="p-4">
                      {location.pincode}
                    </td>

                    <td className="p-4">
                      {currency(location.platformFee)}
                    </td>

                    <td className="p-4">
                      {currency(location.minimumOrder)}
                    </td>

                    <td className="p-4">
                      {currency(location.deliveryCharge)}
                    </td>

                    <td className="p-4">
                      {location.freeDeliveryEnabled
                        ? `Up to ${location.freeDeliveryMaxItems ?? 0} items`
                        : "Disabled"}
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          location.isAvailable && location.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {location.isAvailable && location.isActive
                          ? "Available"
                          : "Unavailable"}
                      </span>
                    </td>

                    <td className="whitespace-nowrap p-4 text-right">
                      <button
                        type="button"
                        onClick={() => openForm(location)}
                        className="mr-3 font-medium text-[#C9004F] hover:underline"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(location.id)}
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

      <Modal
        open={open}
        onClose={() => {
          if (!saving) setOpen(false);
        }}
        title={editing ? "Edit Location" : "Add Location"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <section className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
              Location Details
            </h3>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { key: "name", label: "Location Name" },
                { key: "city", label: "City" },
                { key: "state", label: "State" },
                { key: "pincode", label: "Pincode" },
                { key: "deliveryTime", label: "Delivery Time" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label
                    htmlFor={key}
                    className="block text-sm font-medium text-slate-700"
                  >
                    {label} *
                  </label>

                  <input
                    id={key}
                    required
                    value={form[key]}
                    disabled={saving}
                    onChange={(event) =>
                      updateField(key, event.target.value)
                    }
                    placeholder={`Enter ${label.toLowerCase()}`}
                    className={inputClass}
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3 border-t border-slate-100 pt-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                Location Fee Settings
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                These charges apply to orders delivered in this location.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FeeField
                label="Platform Fee (₹)"
                name="platformFee"
                value={form.platformFee}
                onChange={updateField}
                disabled={saving}
                help="Example: 5 means ₹5 platform fee."
              />

              <FeeField
                label="Minimum Order (₹)"
                name="minimumOrder"
                value={form.minimumOrder}
                onChange={updateField}
                disabled={saving}
                help="Checked against product subtotal only."
              />

              <FeeField
                label="Delivery Charge (₹)"
                name="deliveryCharge"
                value={form.deliveryCharge}
                onChange={updateField}
                disabled={saving}
                help="Normal delivery fee when free delivery does not apply."
              />

              <FeeField
                label="Free Delivery Item Limit"
                name="freeDeliveryMaxItems"
                value={form.freeDeliveryMaxItems}
                onChange={updateField}
                disabled={saving || !form.freeDeliveryEnabled}
                min="0"
                step="1"
                help="Free delivery applies up to this total item quantity."
              />
            </div>

            <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span>
                <span className="block text-sm font-semibold text-slate-800">
                  Enable Free Delivery
                </span>

                <span className="mt-1 block text-xs text-slate-500">
                  Apply free delivery when total cart quantity is within the limit.
                </span>
              </span>

              <input
                type="checkbox"
                checked={Boolean(form.freeDeliveryEnabled)}
                disabled={saving}
                onChange={(event) =>
                  updateField("freeDeliveryEnabled", event.target.checked)
                }
                className="h-5 w-5 accent-[#C9004F]"
              />
            </label>
          </section>

          <section className="space-y-3 border-t border-slate-100 pt-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
              Status
            </h3>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={Boolean(form.isAvailable)}
                disabled={saving}
                onChange={(event) =>
                  updateField("isAvailable", event.target.checked)
                }
                className="h-4 w-4 accent-[#C9004F]"
              />
              Available for delivery
            </label>

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
              Active location
            </label>
          </section>

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
                  ? "Update Location"
                  : "Save Location"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
