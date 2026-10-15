import { useRef, useState } from "react";
import api from "../../services/api";

export default function ImageUpload({
  value,
  onChange,
  label = "Image",
  required = false,
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function pickFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);

    try {
      const form = new FormData();
      form.append("image", file);

      // api is your axios instance with baseURL + auth interceptor
      const response = await api.post("/uploads/image", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const payload = response.data?.data ?? response.data;
      const url = payload?.url;
      if (!url) throw new Error("Upload succeeded but no URL returned");

      onChange(url);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Upload failed"
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function clearImage() {
    onChange("");
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required ? " *" : ""}
      </label>

      {value ? (
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <img
            src={value}
            alt="preview"
            className="h-20 w-20 rounded-lg border border-slate-200 object-cover"
          />

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-slate-500">
              {value}
            </p>

            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Change"}
              </button>

              <button
                type="button"
                onClick={clearImage}
                disabled={uploading}
                className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-[#C9004F] hover:bg-pink-50 disabled:opacity-60"
        >
          <div className="grid h-12 w-12 place-items-center rounded-full bg-white shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-[#C9004F]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>

          <span className="text-sm font-medium text-slate-700">
            {uploading ? "Uploading..." : "Click to upload image"}
          </span>

          <span className="text-xs text-slate-500">
            JPG, PNG, WEBP, GIF — up to 5 MB
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={pickFile}
        className="hidden"
      />

      {error && (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}