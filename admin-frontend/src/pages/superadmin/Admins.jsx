// src/pages/superadmin/Admins.jsx (or wherever you use this)

import React, { useState, useEffect } from "react";
import {
  getAllAdmins,
  createAdmin,
  deleteAdmin,
  updateAdminStatus,
} from "../../services/superAdminAPI";

// helper to get last 10 digits from stored mobile (e.g. "+91 9876543210")
const extract10Digits = (value = "") => {
  const digits = value.replace(/\D/g, "");
  return digits.slice(-10);
};

const CATEGORY_OPTIONS = ["24 Sessions", "CBSE", "Play School", "School 2025"];

/* ---------------------- Success Modal ---------------------- */

function SuccessModal({ open, title = "Success!", message, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl ring-1 ring-slate-200">
        <button
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
          onClick={onClose}
        >
          ✕
        </button>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-4 border-emerald-500/40">
          <span className="text-3xl text-emerald-500">✓</span>
        </div>
        <h2 className="mb-2 text-xl font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-600">{message}</p>
      </div>
    </div>
  );
}

/* ---------------------- Delete Confirm Modal ---------------------- */

function DeleteConfirmModal({ open, institute, onCancel, onConfirm }) {
  if (!open || !institute) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
        <button
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
          onClick={onCancel}
        >
          ✕
        </button>
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <span className="text-3xl text-red-500">🗑️</span>
        </div>
        <h2 className="mb-2 text-xl font-semibold text-center text-slate-900">
          Confirm Deletion
        </h2>
        <p className="mb-4 text-center text-sm text-slate-600">
          Are you sure you want to delete{" "}
          <span className="font-semibold">&quot;{institute.name}&quot;</span>?
          This action cannot be undone.
        </p>
        <div className="mb-4 rounded-lg bg-yellow-50 px-3 py-2 text-xs text-yellow-700">
          ⚠ This admin may be associated with other data. Make sure you have
          handled related records before deleting.
        </div>
        <div className="flex justify-end gap-3 text-sm">
          <button
            onClick={onCancel}
            className="rounded-full border border-slate-200 bg-white px-4 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-full border border-red-500 bg-red-500 px-4 py-1.5 font-medium text-white shadow-sm hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------- Add / Edit Modal ---------------------- */

function AddInstituteModal({
  open,
  mode,
  editingInstitute,
  onClose,
  onSave,
  loading,
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "", // only 10 digits here
    date: "",
    status: "Active",
    logo: null,
    adminPassword: "",
    adminRole: "Admin",
    logoName: "",
    logoUrl: "",
  });

  // Prefill form when editing / reset when adding
  useEffect(() => {
    if (open && mode === "edit" && editingInstitute) {
      const existingStatus = editingInstitute.status || "Active";
      setForm({
        name: editingInstitute.name || "",
        email: editingInstitute.email || "",
        mobile: extract10Digits(
          editingInstitute.phone || editingInstitute.mobile || ""
        ),
        date: "",
        status:
          existingStatus.toLowerCase() === "active" ? "Active" : "In Active",
        logo: null,
        adminPassword: editingInstitute.adminPassword || "",
        adminRole:
          editingInstitute.adminRole ||
          (editingInstitute.role
            ? editingInstitute.role.charAt(0).toUpperCase() +
              editingInstitute.role.slice(1)
            : "Admin"),
        logoName: editingInstitute.logoName || "",
        logoUrl: editingInstitute.logoUrl || editingInstitute.imageURL || "",
      });
    }
    if (open && mode === "add") {
      setForm({
        name: "",
        email: "",
        mobile: "",
        date: "",
        status: "Active",
        logo: null,
        adminPassword: "",
        adminRole: "Admin",
        logoName: "",
        logoUrl: "",
      });
    }
  }, [open, mode, editingInstitute]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    // special handling for mobile
    if (name === "mobile") {
      let digits = value.replace(/\D/g, ""); // keep only digits
      if (digits.length <= 10) {
        setForm((prev) => ({ ...prev, mobile: digits }));
      }
      return;
    }

    // numeric only for maxFaculty / maxStudents
    if (name === "maxFaculty" || name === "maxStudents") {
      const digits = value.replace(/\D/g, "");
      setForm((prev) => ({ ...prev, [name]: digits }));
      return;
    }

    // pin code: 6 digits
    if (name === "pinCode") {
      const digits = value.replace(/\D/g, "");
      if (digits.length <= 6) {
        setForm((prev) => ({ ...prev, pinCode: digits }));
      }
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 2MB validation for logo (image)
  const handleFileChange = (name, file) => {
    if (file && file.size > 2 * 1024 * 1024) {
      alert("Image must be less than 2MB");
      return;
    }
    setForm((prev) => ({
      ...prev,
      [name]: file || null,
      logoName: file?.name || prev.logoName,
    }));
  };

  const handleCategoryToggle = (cat) => {
    setForm((prev) => {
      const exists = prev.categories.includes(cat);
      return {
        ...prev,
        categories: exists
          ? prev.categories.filter((c) => c !== cat)
          : [...prev.categories, cat],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.mobile) return;

    // ensure mobile is exactly 10 digits
    if (form.mobile.length !== 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    // admin password required while adding
    if (mode === "add" && !form.adminPassword) {
      alert("Please enter admin password.");
      return;
    }

    // Admin creation JSON payload
    const nameParts = form.name.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const payload = {
      firstName,
      lastName,
      email: form.email,
      phone: `+91 ${form.mobile}`,
      password: form.adminPassword || editingInstitute?.adminPassword || "",
      permissions: [],
      role: (form.adminRole || "Admin").toLowerCase(),
    };

    // For local UI state tracking (legacy compatibility)
    const base = {
      ...payload,
      id: editingInstitute?.id,
      name: form.name,
      mobile: `+91 ${form.mobile}`,
      date: form.date || new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      status: form.status,
      adminRole: form.adminRole || "Admin",
    };

    // Ask parent to handle API + local state.
    const success = await onSave(payload, mode, base);

    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-200">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            {mode === "edit" ? "Edit Admin" : "Add New Admin"}
          </h2>
          <button
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <p className="mb-3 text-sm text-slate-500">
          Fill the details below to{" "}
          {mode === "edit" ? "update" : "add"} the admin.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-3 max-h-[80vh] overflow-y-auto pr-1"
        >
          {/* Top basic details */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col space-y-1 text-sm">
              <label className="font-medium text-slate-800">
                Admin Name<span className="ml-0.5 text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="Enter admin name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex flex-col space-y-1 text-sm">
              <label className="font-medium text-slate-800">
                Admin Email<span className="ml-0.5 text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="example@gmail.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Admin Password */}
            <div className="flex flex-col space-y-1 text-sm">
              <label className="font-medium text-slate-800">
                Admin Password<span className="ml-0.5 text-red-500">*</span>
              </label>
              <input
                type="password"
                name="adminPassword"
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="Create a password"
                value={form.adminPassword}
                onChange={handleChange}
                required={mode === "add"}
              />
              {mode === "edit" && (
                <span className="text-[11px] text-slate-400">
                  Leave unchanged to keep the existing password.
                </span>
              )}
            </div>

            {/* MOBILE WITH +91 AND VALIDATION */}
            <div className="flex flex-col space-y-1 text-sm">
              <label className="font-medium text-slate-800">
                Contact Number<span className="ml-0.5 text-red-500">*</span>
              </label>
              <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
                <span className="text-slate-600 text-sm font-medium select-none">
                  +91
                </span>
                <input
                  type="tel"
                  name="mobile"
                  className="flex-1 bg-transparent text-sm outline-none text-slate-900 placeholder:text-slate-400"
                  placeholder="9876543210"
                  value={form.mobile}
                  onChange={handleChange}
                  maxLength={10}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                />
              </div>
              {form.mobile.length > 0 && form.mobile.length < 10 && (
                <span className="text-xs text-red-500">
                  Enter a valid 10-digit mobile number
                </span>
              )}
            </div>

            {/* Admin Role */}
            <div className="flex flex-col space-y-1 text-sm">
              <label className="font-medium text-slate-800">
                Admin Role<span className="ml-0.5 text-red-500">*</span>
              </label>
              <select
                name="adminRole"
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                value={form.adminRole}
                onChange={handleChange}
              >
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
              </select>
            </div>

            <div className="flex flex-col space-y-1 text-sm">
              <label className="font-medium text-slate-800">Status</label>
              <select
                name="status"
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                value={form.status}
                onChange={handleChange}
              >
                <option value="Active">Active</option>
                <option value="In Active">In Active</option>
              </select>
            </div>
          </div>

          {/* Logo upload */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col space-y-1 text-sm">
              <label className="font-medium text-slate-800">Admin Image</label>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-6 text-center text-xs text-slate-500 hover:bg-slate-100">
                <span className="mb-1 text-2xl">📁</span>
                <span className="font-medium">
                  Click to upload or drag and drop
                </span>
                <span>PNG, JPG, GIF, WebP (MAX. 2MB)</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    handleFileChange("logo", e.target.files?.[0])
                  }
                />
              </label>
              {(form.logo || form.logoName) && (
                <span className="mt-1 text-xs text-slate-600">
                  Selected: {form.logo?.name || form.logoName}
                </span>
              )}
            </div>
          </div>

          {/* Footer buttons */}
          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center rounded-full border border-indigo-500 bg-indigo-500 px-4 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-600 disabled:opacity-60"
            >
              {loading
                ? mode === "edit"
                  ? "Updating..."
                  : "Creating..."
                : mode === "edit"
                ? "Update Admin"
                : "Create Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ----------------------------- MAIN APP ----------------------------- */

function App() {
  const [institutes, setInstitutes] = useState([]); // this now holds admins from backend
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' | 'edit'
  const [editingInstitute, setEditingInstitute] = useState(null);
  const [sortOption, setSortOption] = useState("az");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [successModal, setSuccessModal] = useState({
    open: false,
    type: "add",
  });

  const [deleteTarget, setDeleteTarget] = useState(null);

  const [listLoading, setListLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load admin list (excluding superadmin)
  const loadAdmins = async () => {
    try {
      setListLoading(true);
      const res = await getAllAdmins();
      const filtered = res.data.filter((a) => a.role !== "superadmin");
      setInstitutes(filtered);
    } catch (err) {
      console.error(err);
      alert("Failed to load admins");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  // AUTO HIDE SUCCESS POPUP AFTER 2s
  useEffect(() => {
    if (successModal.open) {
      const timer = setTimeout(() => {
        setSuccessModal((prev) => ({ ...prev, open: false }));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [successModal.open]);

  // Sorting
  const sortedInstitutes = [...institutes].sort((a, b) => {
    if (sortOption === "az") {
      return a.name.localeCompare(b.name);
    } else if (sortOption === "za") {
      return b.name.localeCompare(a.name);
    }
    return 0;
  });

  const pageCount = Math.max(1, Math.ceil(sortedInstitutes.length / pageSize));
  const currentPageSafe = Math.min(currentPage, pageCount);
  const startIndex = (currentPageSafe - 1) * pageSize;
  const visibleInstitutes = sortedInstitutes.slice(
    startIndex,
    startIndex + pageSize
  );

  const openAddModal = () => {
    setModalMode("add");
    setEditingInstitute(null);
    setIsModalOpen(true);
  };

  const openEditModal = (inst) => {
    setModalMode("edit");
    setEditingInstitute(inst);
    setIsModalOpen(true);
  };

  // mode === "add": call backend createAdmin
  // mode === "edit": only update UI locally (backend update not provided)
  const handleSaveInstitute = async (payload, mode, editing) => {
    if (mode === "edit" && editing) {
      // local-only update (no backend update API in provided code)
      const updated = { ...editing, ...payload };
      setInstitutes((prev) =>
        prev.map((item) =>
          (item.id === editing.id || item._id === editing._id) ? updated : item
        )
      );
      setSuccessModal({
        open: true,
        type: "edit",
      });
      return true;
    }

    // ADD (createAdmin via backend)
    try {
      setSaving(true);
      await createAdmin(payload);
      setCurrentPage(1);
      setSuccessModal({
        open: true,
        type: "add",
      });
      await loadAdmins();
      return true;
    } catch (err) {
      console.error("Admin create error:", err);
      alert(err.response?.data?.message || "Failed to create admin");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteInstitute = (id) => {
    const target = institutes.find((i) => i._id === id);
    if (target) {
      setDeleteTarget(target);
    }
  };

  const confirmDeleteInstitute = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAdmin(deleteTarget._id);
      setDeleteTarget(null);
      await loadAdmins();
    } catch (err) {
      console.error(err);
      alert("Failed to delete admin");
    }
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleFooterClick = (label) => {
    alert(`${label} clicked (demo only).`);
  };

  // toggle status handler -> backend updateAdminStatus
  const handleToggleStatus = async (inst) => {
    const currentStatus = (inst.status || "").toLowerCase();
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    try {
      await updateAdminStatus(inst._id, newStatus);
      await loadAdmins();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const getStatusLabel = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "active") return "Active";
    if (s === "inactive") return "In Active";
    return status || "In Active";
  };

  const isActiveStatus = (status) =>
    (status || "").toLowerCase() === "active";

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 mt-20">
      {/* Main Area */}
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 md:px-6 lg:py-8">
        {/* Top line brand / title */}
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">Admin</h1>

          <button
            onClick={openAddModal}
            className="hidden items-center gap-2 rounded-full border border-emerald-500/70 bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-600 sm:inline-flex"
          >
            <span className="text-base">＋</span>
            <span>Add Admin</span>
          </button>
        </header>

        {/* Card */}
        <main className="flex flex-1 flex-col gap-4">
          {/* Controls */}
          <div className="flex flex-col items-start justify-between gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200 backdrop-blur-lg sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                Total: {institutes.length}
              </span>
              <span className="text-xs text-slate-500">
                Page {currentPageSafe} of {pageCount}
              </span>
              {listLoading && (
                <span className="text-xs text-indigo-500">
                  Loading admins...
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm">
              <div className="flex items-center gap-1 text-slate-700">
                <span className="text-xs text-slate-500">Sort:</span>
                <select
                  value={sortOption}
                  onChange={handleSortChange}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="az">Name A–Z</option>
                  <option value="za">Name Z–A</option>
                </select>
              </div>

              <button
                onClick={openAddModal}
                className="inline-flex items-center rounded-full border border-emerald-500/70 bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-emerald-600 sm:hidden"
              >
                ＋ Add
              </button>
            </div>
          </div>

          {/* Table Card */}
          <div className="overflow-hidden rounded-2xl bg-white p-4 shadow-md ring-1 ring-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="whitespace-nowrap px-2 py-3 gap-12 text-center">
                      Name
                    </th>
                    <th className="whitespace-nowrap px-2 py-3 text-center">
                      Email ID
                    </th>
                    <th className="whitespace-nowrap px-2 py-3 text-center">
                      Mobile No
                    </th>
                    <th className="whitespace-nowrap px-2 py-3 text-center">
                      Role
                    </th>
                    <th className="whitespace-nowrap px-2 py-3 text-center">
                      Status
                    </th>
                    <th className="whitespace-nowrap px-2 py-3 text-left">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleInstitutes.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-6 text-center text-sm text-slate-500"
                      >
                        {listLoading
                          ? "Loading admins..."
                          : "No admins found."}
                      </td>
                    </tr>
                  ) : (
                    visibleInstitutes.map((inst, idx) => (
                      <tr
                        key={inst._id}
                        className={`border-t border-slate-100 text-slate-800 ${
                          idx % 2 === 1 ? "bg-slate-50/60" : "bg-white"
                        } hover:bg-indigo-50/40`}
                      >
                        <td className="px-2 py-2 align-middle">
                          <div className="flex items-center gap-12">
                            {/* Avatar / Logo */}
                            <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-sky-500 to-violet-500 text-xs font-semibold text-white shadow-md overflow-hidden">
                              {inst.logoUrl || inst.imageURL ? (
                                <img
                                  src={inst.logoUrl || inst.imageURL}
                                  alt={inst.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                inst.name?.[0]
                              )}
                            </div>
                            <span className="truncate text-sm">
                              {inst.name}
                            </span>
                          </div>
                        </td>

                        <td className="px-2 py-2 align-middle text-sm text-slate-700">
                          {inst.email}
                        </td>
                        <td className="px-2 py-2 align-middle text-sm text-slate-700">
                          {inst.phone || inst.mobile}
                        </td>
                        <td className="px-2 py-2 align-middle text-sm text-center text-slate-700">
                          {inst.adminRole ||
                            (inst.role
                              ? inst.role.charAt(0).toUpperCase() +
                                inst.role.slice(1)
                              : "Admin")}
                        </td>
                        <td className="px-2 py-2 align-middle text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(inst)}
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                              isActiveStatus(inst.status)
                                ? "bg-emerald-500 text-white hover:bg-emerald-600"
                                : "bg-red-500 text-white hover:bg-red-600"
                            }`}
                          >
                            <span>●</span>
                            {getStatusLabel(inst.status)}
                          </button>
                        </td>
                        <td className="px-2 py-2 align-middle">
                          <div className="flex items-center gap-1">
                            <button
                              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                              title="Edit"
                              onClick={() => openEditModal(inst)}
                            >
                              ✏️
                            </button>
                            <button
                              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-xs text-red-500 hover:bg-red-50"
                              title="Delete"
                              onClick={() => handleDeleteInstitute(inst._id)}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer / Pagination */}
            <div className="mt-4 flex flex-col items-start justify-between gap-3 text-xs text-slate-600 sm:flex-row sm:items-center">
              <span>
                Showing {visibleInstitutes.length === 0 ? 0 : startIndex + 1} to{" "}
                {Math.min(startIndex + pageSize, sortedInstitutes.length)} of{" "}
                {sortedInstitutes.length} entries
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    handlePageChange(Math.max(1, currentPageSafe - 1))
                  }
                  className="h-7 min-w-[30px] rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 hover:bg-slate-50"
                >
                  ‹
                </button>
                {Array.from({ length: pageCount }).map((_, i) => {
                  const page = i + 1;
                  const isActive = page === currentPageSafe;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`h-7 min-w-[28px] rounded-md border px-2 text-xs ${
                        isActive
                          ? "border-indigo-500 bg-indigo-500 text-white shadow-sm"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() =>
                    handlePageChange(Math.min(pageCount, currentPageSafe + 1))
                  }
                  className="h-7 min-w-[30px] rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 hover:bg-slate-50"
                >
                  ›

                </button>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <footer className="mt-3 flex flex-col items-start justify-between gap-2 text-[11px] text-slate-500 sm:flex-row sm:items-center">
            <span>{/* ©️ Copyright ... */}</span>
            <div className="flex gap-3">
              <button
                onClick={() => handleFooterClick("License")}
                className="hover:text-slate-800 hover:underline"
              >
                License
              </button>
              <button
                onClick={() => handleFooterClick("Documentation")}
                className="hover:text-slate-800 hover:underline"
              >
                Documentation
              </button>
              <button
                onClick={() => handleFooterClick("Support")}
                className="hover:text-slate-800 hover:underline"
              >
                Support
              </button>
            </div>
          </footer>
        </main>
      </div>

      {/* Add/Edit Modal */}
      <AddInstituteModal
        open={isModalOpen}
        mode={modalMode}
        editingInstitute={editingInstitute}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveInstitute}
        loading={saving}
      />

      {/* Success Modal */}
      <SuccessModal
        open={successModal.open}
        title="Success!"
        message={
          successModal.type === "edit"
            ? "The admin details have been updated successfully."
            : "The new admin has been created and saved in the system."
        }
        onClose={() =>
          setSuccessModal((prev) => ({ ...prev, open: false }))
        }
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        open={!!deleteTarget}
        institute={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteInstitute}
      />
    </div>
  );
}

export default App;