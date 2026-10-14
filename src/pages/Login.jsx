import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function Login() {
  const {
    login,
    user,
    loading: authLoading,
  } = useAuth();

  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (authLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#f8f9fb]">
        <div className="text-sm text-slate-500">
          Checking authentication...
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const email = form.email.trim();
    const password = form.password;

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setBusy(true);

      await login(email, password);

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to sign in. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen grid place-items-center bg-[#f8f9fb] p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"
      >
        <div className="mb-7 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#C9004F] text-2xl font-bold text-white">
            T
          </div>

          <h1 className="mt-3 text-2xl font-bold text-slate-900">
            TWINTO
          </h1>

          <p className="text-sm text-slate-500">
            Admin Dashboard
          </p>
        </div>

        <label
          htmlFor="email"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Admin email
        </label>

        <div className="relative mb-4">
          <Mail
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            placeholder="admin@twinto.com"
            value={form.email}
            onChange={handleChange}
            required
            disabled={busy}
            className="h-11 w-full rounded-xl border border-slate-300 pl-10 pr-3 outline-none transition focus:border-[#C9004F] focus:ring-2 focus:ring-[#C9004F]/10 disabled:bg-slate-50"
          />
        </div>

        <label
          htmlFor="password"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Password
        </label>

        <div className="relative mb-4">
          <LockKeyhole
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            required
            disabled={busy}
            className="h-11 w-full rounded-xl border border-slate-300 pl-10 pr-11 outline-none transition focus:border-[#C9004F] focus:ring-2 focus:ring-[#C9004F]/10 disabled:bg-slate-50"
          />

          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={
              showPassword ? "Hide password" : "Show password"
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800"
          >
            {showPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="h-11 w-full rounded-xl bg-[#C9004F] font-semibold text-white transition hover:bg-[#A80040] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Signing in..." : "Sign In"}
        </button>

        <p className="mt-5 text-center text-xs text-slate-400">
          Authorized TWINTO administrators only
        </p>
      </form>
    </main>
  );
}