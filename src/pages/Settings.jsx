import { useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  UserRound,
  Truck,
  Wallet,
  Save,
  RotateCcw,
  LogOut,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
  Gift,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const DEFAULT_SETTINGS = {
  platformFee: 5,
  deliveryPartnerFee: 30,
  freeDeliveryEnabled: true,
  freeDeliveryMaxItems: 3,
};

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#C9004F] focus:ring-2 focus:ring-[#C9004F]/10";

export default function Settings() {
  const { user, logout } = useAuth();

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [initialSettings, setInitialSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function loadSettings() {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/settings/fees");

        // Backend response: { success, message, data }
        const result = response.data?.data ?? response.data;

        const values = {
          platformFee: Number(
            result?.platformFee ?? DEFAULT_SETTINGS.platformFee
          ),
          deliveryPartnerFee: Number(
            result?.deliveryPartnerFee ??
              DEFAULT_SETTINGS.deliveryPartnerFee
          ),
          freeDeliveryEnabled:
            result?.freeDeliveryEnabled ??
            DEFAULT_SETTINGS.freeDeliveryEnabled,
          freeDeliveryMaxItems: Number(
            result?.freeDeliveryMaxItems ??
              DEFAULT_SETTINGS.freeDeliveryMaxItems
          ),
        };

        if (active) {
          setSettings(values);
          setInitialSettings(values);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Could not load fee settings. Check the backend server and API route."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadSettings();

    return () => {
      active = false;
    };
  }, []);

  function updateField(name, value) {
    setSettings((current) => ({
      ...current,
      [name]: value,
    }));

    setSuccess("");
  }

  function resetSettings() {
    setSettings({ ...initialSettings });
    setError("");
    setSuccess("");
  }

  async function saveSettings(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const platformFee = Number(settings.platformFee);
    const deliveryPartnerFee = Number(settings.deliveryPartnerFee);
    const freeDeliveryMaxItems = Number(
      settings.freeDeliveryMaxItems
    );

    if (
      !Number.isFinite(platformFee) ||
      platformFee < 0 ||
      !Number.isFinite(deliveryPartnerFee) ||
      deliveryPartnerFee < 0
    ) {
      setError("Fees must be valid non-negative numbers.");
      return;
    }

    if (
      !Number.isInteger(freeDeliveryMaxItems) ||
      freeDeliveryMaxItems < 0 ||
      freeDeliveryMaxItems > 100
    ) {
      setError("Free delivery item limit must be between 0 and 100.");
      return;
    }

    const payload = {
      platformFee,
      deliveryPartnerFee,
      freeDeliveryEnabled: Boolean(
        settings.freeDeliveryEnabled
      ),
      freeDeliveryMaxItems,
    };

    setSaving(true);

    try {
      const response = await api.put("/settings/fees", payload);

      const result = response.data?.data ?? response.data;

      const savedSettings = {
        platformFee: Number(
          result?.platformFee ?? payload.platformFee
        ),
        deliveryPartnerFee: Number(
          result?.deliveryPartnerFee ??
            payload.deliveryPartnerFee
        ),
        freeDeliveryEnabled:
          result?.freeDeliveryEnabled ??
          payload.freeDeliveryEnabled,
        freeDeliveryMaxItems: Number(
          result?.freeDeliveryMaxItems ??
            payload.freeDeliveryMaxItems
        ),
      };

      setSettings(savedSettings);
      setInitialSettings(savedSettings);
      setSuccess("Fee settings saved successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save settings. Check the backend API and permissions."
      );
    } finally {
      setSaving(false);
    }
  }

  const currency = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN")}`;

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-8">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#C9004F]/10 text-[#C9004F]">
            <SettingsIcon size={23} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Settings
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage admin profile and store charges.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>

      {/* Status messages */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={19} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
        >
          <CheckCircle2 size={19} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Admin profile */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-700">
            <UserRound size={21} />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              Admin Profile
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Your administrator account details.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["Name", user?.name],
            ["Email", user?.email],
            ["Mobile", user?.mobile],
            ["Role", user?.role],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border border-slate-100 bg-slate-50 p-4"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {label}
              </p>
              <p className="mt-2 break-words text-sm font-semibold text-slate-900">
                {value || "—"}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Fee management */}
      <form onSubmit={saveSettings} className="space-y-6">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 p-5 sm:p-6">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#C9004F]/10 text-[#C9004F]">
              <Wallet size={21} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                Platform Fee
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Service charge applied to each eligible order.
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <label
              htmlFor="platformFee"
              className="block text-sm font-semibold text-slate-700"
            >
              Platform fee (₹)
            </label>

            <input
              id="platformFee"
              type="number"
              min="0"
              step="0.01"
              className={inputClass}
              value={settings.platformFee}
              onChange={(event) =>
                updateField("platformFee", event.target.value)
              }
              disabled={loading || saving}
              required
            />

            <p className="mt-2 text-xs text-slate-500">
              Example: Enter 5 to charge ₹5 as the platform fee.
            </p>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 p-5 sm:p-6">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#C9004F]/10 text-[#C9004F]">
              <Truck size={21} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                Delivery Charges
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Manage delivery partner fees and free delivery.
              </p>
            </div>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
            <div>
              <label
                htmlFor="deliveryPartnerFee"
                className="block text-sm font-semibold text-slate-700"
              >
                Delivery partner fee (₹)
              </label>

              <input
                id="deliveryPartnerFee"
                type="number"
                min="0"
                step="0.01"
                className={inputClass}
                value={settings.deliveryPartnerFee}
                onChange={(event) =>
                  updateField(
                    "deliveryPartnerFee",
                    event.target.value
                  )
                }
                disabled={loading || saving}
                required
              />

              <p className="mt-2 text-xs text-slate-500">
                Example: Enter 30 for a ₹30 delivery fee.
              </p>
            </div>

            <div>
              <label
                htmlFor="freeDeliveryMaxItems"
                className="block text-sm font-semibold text-slate-700"
              >
                Free delivery item limit
              </label>

              <input
                id="freeDeliveryMaxItems"
                type="number"
                min="0"
                max="100"
                step="1"
                className={inputClass}
                value={settings.freeDeliveryMaxItems}
                onChange={(event) =>
                  updateField(
                    "freeDeliveryMaxItems",
                    event.target.value
                  )
                }
                disabled={
                  loading ||
                  saving ||
                  !settings.freeDeliveryEnabled
                }
                required
              />

              <p className="mt-2 text-xs text-slate-500">
                Set 3 to allow free delivery for eligible orders of up to
                3 items, according to your checkout logic.
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 sm:col-span-2">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <Gift
                    size={20}
                    className="mt-0.5 text-[#C9004F]"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Enable free delivery
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Enable or disable the free-delivery item rule.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-label="Enable free delivery"
                  aria-checked={Boolean(
                    settings.freeDeliveryEnabled
                  )}
                  onClick={() =>
                    updateField(
                      "freeDeliveryEnabled",
                      !settings.freeDeliveryEnabled
                    )
                  }
                  disabled={loading || saving}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                    settings.freeDeliveryEnabled
                      ? "bg-[#C9004F]"
                      : "bg-slate-300"
                  } disabled:opacity-50`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                      settings.freeDeliveryEnabled
                        ? "left-6"
                        : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Preview */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="font-bold text-slate-900">
            Fee Preview
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Preview of the configured fees. Actual checkout eligibility
            depends on the backend order calculation.
          </p>

          <div className="mt-4 divide-y divide-slate-100">
            <div className="flex justify-between gap-4 py-3 text-sm">
              <span className="text-slate-600">Platform fee</span>
              <strong>{currency(settings.platformFee)}</strong>
            </div>

            <div className="flex justify-between gap-4 py-3 text-sm">
              <span className="text-slate-600">
                Delivery partner fee
              </span>
              <strong>
                {currency(settings.deliveryPartnerFee)}
              </strong>
            </div>

            <div className="flex justify-between gap-4 py-3 text-sm">
              <span className="text-slate-600">
                Free delivery
              </span>
              <strong
                className={
                  settings.freeDeliveryEnabled
                    ? "text-green-700"
                    : "text-slate-500"
                }
              >
                {settings.freeDeliveryEnabled
                  ? `Enabled · up to ${settings.freeDeliveryMaxItems} items`
                  : "Disabled"}
              </strong>
            </div>

            <div className="flex justify-between gap-4 py-3 text-sm font-bold">
              <span>Fees before free-delivery eligibility</span>
              <span>
                {currency(
                  Number(settings.platformFee || 0) +
                    Number(settings.deliveryPartnerFee || 0)
                )}
              </span>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={resetSettings}
            disabled={loading || saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RotateCcw size={17} />
            Reset Changes
          </button>

          <button
            type="submit"
            disabled={loading || saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C9004F] px-5 py-3 text-sm font-semibold text-white hover:bg-[#A80040] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading || saving ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : (
              <Save size={17} />
            )}

            {loading
              ? "Loading Settings..."
              : saving
              ? "Saving..."
              : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}