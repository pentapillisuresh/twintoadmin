
import { useEffect, useState } from "react";

import {
  ShoppingBag,
  IndianRupee,
  Users,
  CreditCard,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

import { getDashboardStats } from "../services/dashboardService";
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
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function StatCard({ title, value, Icon, subtitle }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
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

      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#C9004F] text-white">
        <Icon size={22} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const response = await getDashboardStats();
      const result = response.data?.data ?? response.data;

      setData(result);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load dashboard statistics."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading && !data) {
    return (
      <div className="grid min-h-64 place-items-center">
        <Loader />
      </div>
    );
  }

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

        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm text-red-700">{error}</p>

          <button
            type="button"
            onClick={loadDashboard}
            className="mt-3 rounded-lg bg-[#C9004F] px-4 py-2 text-sm font-semibold text-white hover:bg-[#A90042]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const dashboard = data || {};

  const cards = [
    {
      title: "Total Orders",
      value: Number(dashboard.totalOrders || 0).toLocaleString(
        "en-IN"
      ),
      Icon: ShoppingBag,
      subtitle: "All recorded orders",
    },
    {
      title: "Total Sales",
      value: formatCurrency(dashboard.totalSales),
      Icon: IndianRupee,
      subtitle: "Sales reported by backend",
    },
    {
      title: "Paid Sales",
      value: formatCurrency(dashboard.paidSales),
      Icon: CreditCard,
      subtitle: "Payments marked as paid",
    },
    {
      title: "Customers",
      value: Number(
        dashboard.totalCustomers || 0
      ).toLocaleString("en-IN"),
      Icon: Users,
      subtitle: "Registered customer accounts",
    },
  ];

  const statusCounts = dashboard.statusCounts || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Monitor TWINTO orders, sales, and customers.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboard}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />

          Refresh Data
        </button>
      </div>

      {/* Refresh error */}
      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
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

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

      {/* Order status */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-pink-50 text-[#C9004F]">
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
              className="rounded-xl border border-slate-200 p-4 transition hover:border-pink-200 hover:bg-pink-50/30"
            >
              <p className="min-h-8 text-xs font-medium leading-4 text-slate-500">
                {status.replaceAll("_", " ")}
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {Number(statusCounts[status] || 0).toLocaleString(
                  "en-IN"
                )}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Sales information */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-slate-900">
          Sales Summary
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Financial totals returned by your backend.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">
              Total Sales
            </p>

            <p className="mt-2 text-xl font-bold text-slate-900">
              {formatCurrency(dashboard.totalSales)}
            </p>
          </div>

          <div className="rounded-xl bg-pink-50 p-4">
            <p className="text-sm text-slate-500">
              Paid Sales
            </p>

            <p className="mt-2 text-xl font-bold text-[#C9004F]">
              {formatCurrency(dashboard.paidSales)}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
