
import { useEffect, useState } from "react";

import {
  ShoppingBag,
  Users,
  CreditCard,
  RefreshCw,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

import { getDashboardStats } from "../services/dashboardService";
import Loader from "../components/common/Loader";

// ==========================================
// ORDER STATUSES
// ==========================================

const statuses = [
  "PLACED",
  "CONFIRMED",
  "PACKING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

// ==========================================
// HELPERS
// ==========================================

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("en-IN");
}

// ==========================================
// STAT CARD
// ==========================================

function StatCard({ title, value, Icon, subtitle }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        <p className="mt-2 break-words text-2xl font-bold text-slate-900">
          {value ?? 0}
        </p>

        {subtitle && (
          <p className="mt-2 text-xs text-slate-500">
            {subtitle}
          </p>
        )}
      </div>

      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#C9004F] text-white">
        <Icon size={21} />
      </div>
    </div>
  );
}

// ==========================================
// DASHBOARD
// ==========================================

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ========================================
  // LOAD DASHBOARD
  // ========================================

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const response = await getDashboardStats();

      const result =
        response.data?.data ?? response.data;

      setData(result);
    } catch (err) {
      console.error("[DASHBOARD ERROR]", err);

      setError(
        err.response?.data?.message ||
          "Failed to load dashboard statistics."
      );
    } finally {
      setLoading(false);
    }
  }

  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {
    loadDashboard();
  }, []);

  // ========================================
  // INITIAL LOADING
  // ========================================

  if (loading && !data) {
    return (
      <div className="grid min-h-64 place-items-center">
        <Loader />
      </div>
    );
  }

  // ========================================
  // INITIAL ERROR
  // ========================================

  if (error && !data) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            TWINTO administration overview.
          </p>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={loadDashboard}
            className="mt-3 rounded-lg bg-[#C9004F] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#A90042]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ========================================
  // DASHBOARD DATA
  // ========================================

  const dashboard = data || {};

  const totalOrders = formatNumber(
    dashboard.totalOrders
  );

  const paidSales = formatCurrency(
    dashboard.paidSales
  );

  const totalCustomers = formatNumber(
    dashboard.totalCustomers
  );

  const statusCounts =
    dashboard.statusCounts || {};

  // ========================================
  // SUMMARY CARDS
  // ========================================

  const cards = [
    {
      title: "Total Orders",
      value: totalOrders,
      Icon: ShoppingBag,
      subtitle: "Paid online and COD orders",
    },
    {
      title: "Paid Sales",
      value: paidSales,
      Icon: CreditCard,
      subtitle: "Payments marked as paid",
    },
    {
      title: "Customers",
      value: totalCustomers,
      Icon: Users,
      subtitle: "Registered customer accounts",
    },
  ];

  // ========================================
  // SCREEN
  // ========================================

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Monitor TWINTO orders, paid sales,
            and customers.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboard}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={
              loading ? "animate-spin" : ""
            }
          />

          {loading
            ? "Refreshing..."
            : "Refresh Data"}
        </button>
      </div>

      {/* REFRESH ERROR */}

      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
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

      {/* SUMMARY CARDS */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            Icon={card.Icon}
            subtitle={card.subtitle}
          />
        ))}
      </div>

      {/* ORDER STATUS OVERVIEW */}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-pink-50 text-[#C9004F]">
            <TrendingUp size={20} />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">
              Order Status Overview
            </h2>

            <p className="text-sm text-slate-500">
              Current order counts by status.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {statuses.map((status) => (
            <div
              key={status}
              className="rounded-lg border border-slate-200 p-4 transition hover:border-pink-200 hover:bg-pink-50/30"
            >
              <p className="min-h-8 text-xs font-medium leading-4 text-slate-500">
                {status.replaceAll("_", " ")}
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {formatNumber(
                  statusCounts[status]
                )}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* PAYMENT SUMMARY */}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-pink-50 text-[#C9004F]">
            <CheckCircle2 size={20} />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">
              Payment Summary
            </h2>

            <p className="text-sm text-slate-500">
              Overview of payments marked as paid.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-pink-100 bg-pink-50/60 p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-white text-[#C9004F]">
              <CreditCard size={21} />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-600">
                Paid Sales
              </p>

              <p className="mt-1 text-2xl font-bold text-[#C9004F]">
                {paidSales}
              </p>
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-500">
            This amount is based on payments
            recorded as paid by the backend.
          </p>
        </div>
      </section>
    </div>
  );
}
