
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
  deliveryTime: "",
  isAvailable: true,
  isActive: true,
};

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
        Array.isArray(data)
          ? data
          : data?.locations ?? []
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
            deliveryTime: location.deliveryTime ?? "",
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
    };

    if (
      !payload.name ||
      !payload.city ||
      !payload.state ||
      !payload.pincode ||
      !payload.deliveryTime
    ) {
      setError("Please fill in all location fields.");
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
    if (!window.confirm("Are you sure you want to delete this location?")) {
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

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Locations
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage TWINTO delivery areas.
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
            aria-label="Dismiss error"
            className="font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Locations table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8">
            <Loader />
          </div>
        ) : locations.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-pink-50 text-2xl text-[#C9004F]">
              <span aria-hidden="true">⌖</span>
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
                  <th className="p-4 text-left">City</th>
                  <th className="p-4 text-left">State</th>
                  <th className="p-4 text-left">Pincode</th>
                  <th className="p-4 text-left">Delivery Time</th>
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
                    </td>

                    <td className="p-4">{location.city}</td>
                    <td className="p-4">{location.state}</td>
                    <td className="p-4">{location.pincode}</td>

                    <td className="p-4">
                      {location.deliveryTime || "-"}
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

                    <td className="p-4 text-right whitespace-nowrap">
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

      {/* Add / edit location modal */}
      <Modal
        open={open}
        onClose={() => {
          if (!saving) setOpen(false);
        }}
        title={editing ? "Edit Location" : "Add Location"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: "name", label: "Location Name" },
            { key: "city", label: "City" },
            { key: "state", label: "State" },
            { key: "pincode", label: "Pincode" },
            { key: "deliveryTime", label: "Delivery Time" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                {label} *
              </label>

              <input
                required
                value={form[key]}
                disabled={saving}
                onChange={(event) =>
                  updateField(key, event.target.value)
                }
                placeholder={`Enter ${label.toLowerCase()}`}
                className="h-11 w-full rounded-xl border border-slate-200 px-3 outline-none transition focus:border-[#C9004F] focus:ring-2 focus:ring-pink-100 disabled:bg-slate-50"
              />
            </div>
          ))}

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
