
import {
  Settings as SettingsIcon,
  UserRound,
  LogOut,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function Settings() {
  const { user, logout } = useAuth();

  const profileFields = [
    ["Name", user?.name],
    ["Email", user?.email],
    ["Mobile", user?.mobile],
    ["Role", user?.role],
  ];

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
              Manage your administrator account.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>

      {/* Admin Profile */}
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

      {/* Account Information */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="font-bold text-slate-900">
          Account Information
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Your administrator account is used to access and manage
          the TWINTO administration dashboard.
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
