
import React, { useState } from "react";

import {
  Settings as SettingsIcon,
  UserRound,
  LogOut,
  LockKeyhole,
  Eye,
  EyeOff,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

import {
  changeAdminPassword,
} from "../services/authService";

// ==========================================
// TWINTO ADMIN SETTINGS
// ==========================================

export default function Settings() {
  const { user, logout } = useAuth();

  // ==========================================
  // PASSWORD FORM STATE
  // ==========================================

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] =
    useState({
      currentPassword: false,
      newPassword: false,
      confirmPassword: false,
    });

  const [loading, setLoading] = useState(false);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // ==========================================
  // ADMIN PROFILE FIELDS
  // ==========================================

  const profileFields = [
    ["Name", user?.name],
    ["Email", user?.email],
    ["Mobile", user?.mobile],
    ["Role", user?.role],
  ];

  // ==========================================
  // UPDATE FORM FIELD
  // ==========================================

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setError("");
    setSuccess("");
  };

  // ==========================================
  // TOGGLE PASSWORD VISIBILITY
  // ==========================================

  const togglePassword = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // ==========================================
  // CHANGE ADMIN PASSWORD
  // ==========================================

  const handleChangePassword = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = form;

    // Required fields
    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setError("Please fill in all password fields.");
      return;
    }

    // Minimum password length
    if (newPassword.length < 8) {
      setError(
        "New password must contain at least 8 characters."
      );
      return;
    }

    // Maximum bcrypt-compatible password length
    if (new TextEncoder().encode(newPassword).length > 72) {
      setError(
        "New password must not exceed 72 UTF-8 bytes."
      );
      return;
    }

    // Check old and new password
    if (currentPassword === newPassword) {
      setError(
        "New password must be different from your current password."
      );
      return;
    }

    // Confirm password matching
    if (newPassword !== confirmPassword) {
      setError(
        "New password and confirm password do not match."
      );
      return;
    }

    try {
      setLoading(true);

      // Call backend API
      const response = await changeAdminPassword(
        currentPassword,
        newPassword
      );

      // Clear password fields
      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Hide all passwords
      setShowPassword({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
      });

      setSuccess(
        response?.data?.message ||
          "Admin password changed successfully."
      );
    } catch (err) {
      console.error(
        "Admin password change failed:",
        err?.response?.status || err?.message
      );

      setError(
        err?.response?.data?.message ||
          "Unable to change password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // PASSWORD INPUT COMPONENT
  // ==========================================

  const renderPasswordInput = (
    label,
    field,
    placeholder
  ) => {
    return (
      <div className="space-y-2">
        <label
          htmlFor={field}
          className="block text-sm font-semibold text-slate-700"
        >
          {label}
        </label>

        <div className="relative">
          <input
            id={field}
            type={
              showPassword[field]
                ? "text"
                : "password"
            }
            value={form[field]}
            onChange={(e) =>
              handleChange(field, e.target.value)
            }
            placeholder={placeholder}
            autoComplete={
              field === "currentPassword"
                ? "current-password"
                : "new-password"
            }
            disabled={loading}
            className="
              w-full
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-3
              pr-12
              text-sm
              text-slate-900
              outline-none
              transition
              placeholder:text-slate-400
              focus:border-[#C9004F]
              focus:ring-2
              focus:ring-[#C9004F]/10
              disabled:cursor-not-allowed
              disabled:bg-slate-50
            "
          />

          <button
            type="button"
            onClick={() => togglePassword(field)}
            disabled={loading}
            aria-label={
              showPassword[field]
                ? `Hide ${label}`
                : `Show ${label}`
            }
            className="
              absolute
              right-3
              top-1/2
              -translate-y-1/2
              rounded-lg
              p-1.5
              text-slate-400
              transition
              hover:bg-slate-100
              hover:text-[#C9004F]
              disabled:cursor-not-allowed
            "
          >
            {showPassword[field] ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        </div>
      </div>
    );
  };

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-8">

      {/* =====================================
          PAGE HEADING
      ===================================== */}

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
              Manage your administrator account.
            </p>
          </div>

        </div>

        {/* LOGOUT */}

        <button
          type="button"
          onClick={logout}
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            self-start
            rounded-xl
            border
            border-slate-200
            bg-white
            px-4
            py-2.5
            text-sm
            font-semibold
            text-slate-700
            transition
            hover:border-red-200
            hover:bg-red-50
            hover:text-red-600
          "
        >
          <LogOut size={17} />
          Logout
        </button>

      </div>

      {/* =====================================
          ADMIN PROFILE
      ===================================== */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex items-center gap-3 border-b border-slate-100 p-5 sm:p-6">

          <div className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-700">
            <UserRound size={21} />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              Admin Profile
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your administrator account information.
            </p>
          </div>

        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">

          {profileFields.map(([label, value]) => (
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

      {/* =====================================
          CHANGE PASSWORD - NEW
      ===================================== */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* SECTION HEADER */}

        <div className="flex items-center gap-3 border-b border-slate-100 p-5 sm:p-6">

          <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#C9004F]/10 text-[#C9004F]">
            <LockKeyhole size={21} />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              Change Password
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Securely update your administrator login password.
            </p>
          </div>

        </div>

        {/* PASSWORD FORM */}

        <form
          onSubmit={handleChangePassword}
          className="space-y-5 p-5 sm:p-6"
        >

          {/* SUCCESS MESSAGE */}

          {success && (
            <div
              role="status"
              className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4"
            >
              <CheckCircle2
                size={19}
                className="mt-0.5 shrink-0 text-green-600"
              />

              <p className="text-sm font-medium text-green-700">
                {success}
              </p>
            </div>
          )}

          {/* ERROR MESSAGE */}

          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
            >
              <AlertCircle
                size={19}
                className="mt-0.5 shrink-0 text-red-600"
              />

              <p className="text-sm font-medium text-red-700">
                {error}
              </p>
            </div>
          )}

          {/* CURRENT PASSWORD */}

          {renderPasswordInput(
            "Current Password",
            "currentPassword",
            "Enter your current password"
          )}

          {/* NEW PASSWORD + CONFIRM */}

          <div className="grid gap-5 sm:grid-cols-2">

            {renderPasswordInput(
              "New Password",
              "newPassword",
              "Enter new password"
            )}

            {renderPasswordInput(
              "Confirm New Password",
              "confirmPassword",
              "Re-enter new password"
            )}

          </div>

          {/* PASSWORD SECURITY INFO */}

          <div className="flex items-start gap-3 rounded-xl border border-[#FDE3EC] bg-[#FFF9FB] p-4">

            <ShieldCheck
              size={20}
              className="mt-0.5 shrink-0 text-[#C9004F]"
            />

            <div>
              <p className="text-sm font-semibold text-slate-800">
                Password Security
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Use at least 8 characters. For better
                security, combine uppercase and lowercase
                letters, numbers, and symbols. Choose a
                password you have not used before.
              </p>
            </div>

          </div>

          {/* SUBMIT BUTTON */}

          <div className="flex justify-end border-t border-slate-100 pt-5">

            <button
              type="submit"
              disabled={loading}
              className="
                inline-flex
                min-w-[190px]
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-[#C9004F]
                px-6
                py-3
                text-sm
                font-bold
                text-white
                shadow-sm
                transition
                hover:bg-[#A90042]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >

              {loading ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Updating...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Update Password
                </>
              )}

            </button>

          </div>

        </form>

      </section>

      {/* =====================================
          ACCOUNT INFORMATION
      ===================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

        <h2 className="font-bold text-slate-900">
          Account Information
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Your administrator account is used to access
          and manage the TWINTO administration dashboard.
        </p>

        <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">

          <div className="grid h-10 w-10 place-items-center rounded-full bg-[#C9004F]/10 text-[#C9004F]">
            <UserRound size={19} />
          </div>

          <div className="min-w-0">

            <p className="truncate text-sm font-semibold text-slate-900">
              {user?.name || "TWINTO Admin"}
            </p>

            <p className="truncate text-xs text-slate-500">
              {user?.email || "Administrator"}
            </p>

          </div>

          <span className="ml-auto rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Active
          </span>

        </div>

      </section>

    </div>
  );
}
