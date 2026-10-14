
import { useEffect, useState } from "react";

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/productService";

import { getCategories } from "../services/categoryService";

import Modal from "../components/common/Modal";
import Loader from "../components/common/Loader";

const empty = {
  name: "",
  slug: "",
  description: "",
  image: "",
  price: "",
  mrp: "",
  unit: "",
  stock: "",
  categoryId: "",
  rating: 0,
  reviewCount: 0,
  isBestseller: false,
  isFeatured: false,
  isActive: true,
};

const productFields = [
  { key: "name", label: "Product Name", required: true },
  { key: "slug", label: "Slug" },
  { key: "image", label: "Image URL" },
  {
    key: "price",
    label: "Selling Price (₹)",
    type: "number",
    required: true,
    min: "0",
    step: "0.01",
  },
  {
    key: "mrp",
    label: "MRP (₹)",
    type: "number",
    min: "0",
    step: "0.01",
  },
  { key: "unit", label: "Unit", required: true },
  {
    key: "stock",
    label: "Stock Quantity",
    type: "number",
    required: true,
    min: "0",
    step: "1",
  },
  {
    key: "rating",
    label: "Rating",
    type: "number",
    min: "0",
    max: "5",
    step: "0.1",
  },
  {
    key: "reviewCount",
    label: "Review Count",
    type: "number",
    min: "0",
    step: "1",
  },
];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...empty });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [productsResponse, categoriesResponse] =
        await Promise.all([
          getProducts({ limit: 100 }),
          getCategories(),
        ]);

      const productsData =
        productsResponse.data?.data ?? productsResponse.data;

      const categoriesData =
        categoriesResponse.data?.data ?? categoriesResponse.data;

      setProducts(
        Array.isArray(productsData)
          ? productsData
          : productsData?.products ?? []
      );

      setCategories(
        Array.isArray(categoriesData)
          ? categoriesData
          : categoriesData?.categories ?? []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load products or categories."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function openForm(product = null) {
    setError("");
    setEditing(product);

    setForm(
      product
        ? {
            ...empty,
            ...product,
            price: String(product.price ?? ""),
            mrp: String(product.mrp ?? ""),
            stock: String(product.stock ?? ""),
            categoryId: product.categoryId
              ? String(product.categoryId)
              : "",
            rating: String(product.rating ?? 0),
            reviewCount: String(product.reviewCount ?? 0),
          }
        : { ...empty }
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

    const price = Number(form.price);
    const mrp = Number(form.mrp || 0);
    const stock = Number(form.stock);
    const rating = Number(form.rating || 0);
    const reviewCount = Number(form.reviewCount || 0);
    const categoryId = Number(form.categoryId);

    if (!form.name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!form.unit.trim()) {
      setError("Product unit is required.");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setError("Enter a valid selling price.");
      return;
    }

    if (!Number.isFinite(mrp) || mrp < 0) {
      setError("Enter a valid MRP.");
      return;
    }

    if (mrp > 0 && price > mrp) {
      setError("Selling price cannot exceed MRP.");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setError("Stock must be a non-negative whole number.");
      return;
    }

    if (!categoryId) {
      setError("Please select a category.");
      return;
    }

    if (
      !Number.isFinite(rating) ||
      rating < 0 ||
      rating > 5
    ) {
      setError("Rating must be between 0 and 5.");
      return;
    }

    if (
      !Number.isInteger(reviewCount) ||
      reviewCount < 0
    ) {
      setError("Review count must be a non-negative integer.");
      return;
    }

    const payload = {
      ...form,
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim(),
      image: form.image.trim(),
      unit: form.unit.trim(),
      price,
      mrp,
      stock,
      categoryId,
      rating,
      reviewCount,
      isBestseller: Boolean(form.isBestseller),
      isFeatured: Boolean(form.isFeatured),
      isActive: Boolean(form.isActive),
    };

    setSaving(true);

    try {
      if (editing) {
        await updateProduct(editing.id, payload);
      } else {
        await createProduct(payload);
      }

      setOpen(false);
      setEditing(null);
      setForm({ ...empty });

      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to save product."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this product?")) {
      return;
    }

    setError("");

    try {
      await deleteProduct(id);
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to delete product."
      );
    }
  }

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Products
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage products, pricing, stock, and categories.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openForm()}
          className="rounded-xl bg-[#C9004F] px-4 py-2.5 font-semibold text-white transition hover:bg-[#A90042]"
        >
          + Add Product
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
            aria-label="Dismiss error"
            className="font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Products table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8">
            <Loader />
          </div>
        ) : products.length === 0 ? (
          <div className="p-10 text-center">
            <h2 className="font-semibold text-slate-900">
              No products found
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Add your first product to get started.
            </p>

            <button
              type="button"
              onClick={() => openForm()}
              className="mt-4 rounded-xl bg-[#C9004F] px-4 py-2 text-sm font-semibold text-white hover:bg-[#A90042]"
            >
              Add Product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-4 text-left">Product</th>
                  <th className="p-4 text-left">Category</th>
                  <th className="p-4 text-left">Price</th>
                  <th className="p-4 text-left">Stock</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-t border-slate-100 transition hover:bg-slate-50"
                  >
                    <td className="p-4">
                      <div className="flex min-w-48 items-center gap-3">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-12 w-12 rounded-xl border border-slate-100 object-cover"
                          />
                        ) : (
                          <div className="grid h-12 w-12 place-items-center rounded-xl bg-pink-50 text-xs font-bold text-[#C9004F]">
                            {product.name
                              ?.slice(0, 2)
                              .toUpperCase()}
                          </div>
                        )}

                        <div>
                          <p className="font-semibold text-slate-900">
                            {product.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {product.unit || "-"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      {product.category?.name ||
                        categories.find(
                          (category) =>
                            String(category.id) ===
                            String(product.categoryId)
                        )?.name ||
                        "-"}
                    </td>

                    <td className="p-4">
                      <p className="font-semibold text-slate-900">
                        ₹{Number(product.price || 0).toFixed(2)}
                      </p>

                      {Number(product.mrp) > Number(product.price) && (
                        <p className="text-xs text-slate-400 line-through">
                          ₹{Number(product.mrp).toFixed(2)}
                        </p>
                      )}
                    </td>

                    <td className="p-4">
                      <span
                        className={
                          Number(product.stock) <= 5
                            ? "font-medium text-red-600"
                            : "text-slate-700"
                        }
                      >
                        {product.stock ?? 0}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          product.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </span>

                      {product.isBestseller && (
                        <span className="ml-1 inline-flex rounded-full bg-pink-50 px-2 py-1 text-xs text-[#C9004F]">
                          Bestseller
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openForm(product)}
                        className="mr-3 font-medium text-[#C9004F] hover:underline"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(product.id)}
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

      {/* Add / edit product modal */}
      <Modal
        open={open}
        onClose={() => {
          if (!saving) setOpen(false);
        }}
        title={editing ? "Edit Product" : "Add Product"}
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {productFields.map((field) => (
              <div
                key={field.key}
                className={
                  field.key === "name" ||
                  field.key === "image"
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
                  max={field.max}
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

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Category *
              </label>

              <select
                required
                value={form.categoryId}
                disabled={saving}
                onChange={(event) =>
                  updateField("categoryId", event.target.value)
                }
                className="h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-[#C9004F] focus:ring-2 focus:ring-pink-100"
              >
                <option value="">Select category</option>

                {categories
                  .filter((category) => category.isActive !== false)
                  .map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Description
              </label>

              <textarea
                rows={3}
                value={form.description}
                disabled={saving}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                placeholder="Enter product description"
                className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-[#C9004F] focus:ring-2 focus:ring-pink-100 disabled:bg-slate-50"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={Boolean(form.isBestseller)}
                disabled={saving}
                onChange={(event) =>
                  updateField("isBestseller", event.target.checked)
                }
                className="h-4 w-4 accent-[#C9004F]"
              />
              Bestseller
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={Boolean(form.isFeatured)}
                disabled={saving}
                onChange={(event) =>
                  updateField("isFeatured", event.target.checked)
                }
                className="h-4 w-4 accent-[#C9004F]"
              />
              Featured product
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
              Product is active
            </label>
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
                  ? "Update Product"
                  : "Create Product"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
