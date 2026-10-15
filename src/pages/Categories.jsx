
import { useEffect, useState } from "react";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/categoryService";

import Modal from "../components/common/Modal";
import Loader from "../components/common/Loader";

import ImageUpload from "../components/common/ImageUpload";
const blank = {
  name: "",
  slug: "",
  image: "",
  parentId: "",
  sortOrder: 0,
  isActive: true,
};

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...blank });
  const [error, setError] = useState("");

  async function loadCategories() {
    setLoading(true);
    setError("");

    try {
      const response = await getCategories();
      const data = response.data?.data ?? response.data;

      setCategories(
        Array.isArray(data)
          ? data
          : data?.categories ?? []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load categories."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function openForm(category = null) {
    setEditing(category);

    setForm(
      category
        ? {
            ...blank,
            ...category,
            parentId: category.parentId
              ? String(category.parentId)
              : "",
            sortOrder: category.sortOrder ?? 0,
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

    if (!form.name.trim()) {
      setError("Category name is required.");
      return;
    }

    const payload = {
      ...form,
      name: form.name.trim(),
      slug: form.slug.trim(),
      image: form.image.trim(),
      parentId: form.parentId
        ? Number(form.parentId)
        : null,
      sortOrder: Number(form.sortOrder || 0),
    };

    if (
      !Number.isInteger(payload.sortOrder) ||
      payload.sortOrder < 0
    ) {
      setError("Sort order must be a non-negative integer.");
      return;
    }

    if (
      editing &&
      payload.parentId === Number(editing.id)
    ) {
      setError("A category cannot be its own parent.");
      return;
    }

    try {
      if (editing) {
        await updateCategory(editing.id, payload);
      } else {
        await createCategory(payload);
      }

      setOpen(false);
      setEditing(null);
      setForm({ ...blank });

      await loadCategories();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to save category."
      );
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this category?")) {
      return;
    }

    setError("");

    try {
      await deleteCategory(id);
      await loadCategories();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to delete category."
      );
    }
  }

  const parentCategories = categories.filter(
    (category) =>
      !category.parentId &&
      category.id !== editing?.id
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Categories
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage grocery categories and subcategories.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openForm()}
          className="rounded-xl bg-[#C9004F] px-4 py-2.5 font-medium text-white hover:bg-[#A90042]"
        >
          Add Category
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {loading ? (
          <Loader />
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No categories found. Add your first category.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-4 text-left">Category</th>
                  <th className="p-4 text-left">Slug</th>
                  <th className="p-4 text-left">Parent Category</th>
                  <th className="p-4 text-left">Sort Order</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {categories.map((category) => (
                  <tr
                    key={category.id}
                    className="border-t border-slate-100"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="h-10 w-10 rounded-lg border border-slate-100 object-cover"
                          />
                        ) : (
                          <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-500">
                            {category.name
                              ?.slice(0, 2)
                              .toUpperCase()}
                          </div>
                        )}

                        <span className="font-medium text-slate-900">
                          {category.name}
                        </span>
                      </div>
                    </td>

                    <td className="p-4 text-slate-600">
                      {category.slug || "-"}
                    </td>

                    <td className="p-4">
                      {category.parent?.name ||
                        categories.find(
                          (item) =>
                            item.id === category.parentId
                        )?.name ||
                        "-"}
                    </td>

                    <td className="p-4">
                      {category.sortOrder ?? 0}
                    </td>

                    <td className="p-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs ${
                          category.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {category.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td className="p-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openForm(category)}
                        className="mr-3 font-medium text-[#C9004F]"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(category.id)
                        }
                        className="font-medium text-red-500"
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
        onClose={() => setOpen(false)}
        title={
          editing ? "Edit Category" : "Add Category"
        }
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Category Name *
            </label>

            <input
              required
              value={form.name}
              onChange={(event) =>
                updateField("name", event.target.value)
              }
              placeholder="Example: Fruits & Vegetables"
              className="h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-[#C9004F]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Slug
            </label>

            <input
              value={form.slug}
              onChange={(event) =>
                updateField("slug", event.target.value)
              }
              placeholder="Leave blank to generate from name"
              className="h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-[#C9004F]"
            />
          </div>

        <ImageUpload
  value={form.image}
  onChange={(url) => updateField("image", url)}
  label="Category Image"
/>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Parent Category
            </label>

            <select
              value={form.parentId}
              onChange={(event) =>
                updateField("parentId", event.target.value)
              }
              className="h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-[#C9004F]"
            >
              <option value="">Main Category</option>

              {parentCategories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Sort Order
            </label>

            <input
              type="number"
              min="0"
              step="1"
              value={form.sortOrder}
              onChange={(event) =>
                updateField("sortOrder", event.target.value)
              }
              className="h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-[#C9004F]"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={Boolean(form.isActive)}
              onChange={(event) =>
                updateField("isActive", event.target.checked)
              }
              className="accent-[#C9004F]"
            />
            Category is active
          </label>

          <button
            type="submit"
            className="h-11 w-full rounded-xl bg-[#C9004F] font-semibold text-white hover:bg-[#A90042]"
          >
            {editing
              ? "Update Category"
              : "Create Category"}
          </button>
        </form>
      </Modal>
    </div>
  );
}