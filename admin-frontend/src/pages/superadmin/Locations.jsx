// src/pages/superadmin/Location.jsx
import React, { useState, useEffect } from "react";
import {
  getAllLocations,
  createLocation,
  updateLocation,
  deleteLocation,
} from "../../services/locationAPI";

// Dummy fallback data – will be replaced by API data on load
const initialLocations = [
  {
    id: 1,
    country: "India",
    state: "Madhya Pradesh",
    city: "Indore",
    pincode: "452001",
    status: "active",
  },
  {
    id: 2,
    country: "India",
    state: "Madhya Pradesh",
    city: "Bhopal",
    pincode: "462001",
    status: "inactive",
  },
  {
    id: 3,
    country: "India",
    state: "Maharashtra",
    city: "Mumbai",
    pincode: "400001",
    status: "active",
  },
  {
    id: 4,
    country: "India",
    state: "Gujarat",
    city: "Ahmedabad",
    pincode: "380001",
    status: "active",
  },
  {
    id: 5,
    country: "India",
    state: "Rajasthan",
    city: "Jaipur",
    pincode: "302001",
    status: "inactive",
  },
];

// Modal for Add / Edit Location
function AddLocationModal({ open, mode, editingLocation, onClose, onSave }) {
  const [form, setForm] = useState({
    country: "India",
    state: "",
    city: "",
    pincode: "",
    status: "active",
  });

  // 🔔 Toast state for pincode error
  const [toast, setToast] = useState({
    open: false,
    message: "",
  });

  const showToast = (msg) => {
    setToast({ open: true, message: msg });
  };

  // auto-hide toast after 2 seconds + clean up timer
  useEffect(() => {
    if (!toast.open) return;
    const id = setTimeout(
      () => setToast((prev) => ({ ...prev, open: false })),
      2000
    );
    return () => clearTimeout(id);
  }, [toast.open]);

  useEffect(() => {
    if (open && mode === "edit" && editingLocation) {
      setForm({
        country: editingLocation.country || "India",
        state: editingLocation.state || "",
        city: editingLocation.city || "",
        pincode: editingLocation.pincode || "",
        status: editingLocation.status || "active",
      });
    }
    if (open && mode === "add") {
      setForm({
        country: "India",
        state: "",
        city: "",
        pincode: "",
        status: "active",
      });
    }
  }, [open, mode, editingLocation]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    // keep pincode numeric and max 6 digits
    if (name === "pincode") {
      const digits = value.replace(/\D/g, "");
      if (digits.length <= 6) {
        setForm((prev) => ({ ...prev, pincode: digits }));
      }
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.country || !form.state || !form.city || !form.pincode) return;

    // ✅ Pincode validation: must be exactly 6 digits
    if (!/^\d{6}$/.test(form.pincode)) {
      showToast("Please enter a valid 6-digit pincode.");
      return;
    }

    const base = {
      country: form.country,
      state: form.state,
      city: form.city,
      pincode: form.pincode,
      status: form.status,
    };

    const payload =
      mode === "edit" && editingLocation
        ? { ...editingLocation, ...base }
        : { id: Date.now(), ...base };

    onSave(payload, mode);
    onClose();
  };

  return (
    <>
      {/* Toast popup */}
      {toast.open && (
        <div className="fixed top-4 right-4 z-50 rounded-lg bg-red-500 px-4 py-2 text-sm text-white shadow-lg ">
          {toast.message}
        </div>
      )}

      <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-4">
        <div className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-200">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              {mode === "edit" ? "Edit Location" : "Add Location"}
            </h2>
            <button
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
          <p className="mb-3 text-sm text-slate-500">
            Fill the details below to {mode === "edit" ? "update" : "add"} the
            location.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              {/* Country (text input) */}
              <div className="flex flex-col space-y-1 text-sm">
                <label className="font-medium text-slate-800">
                  Country<span className="ml-0.5 text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="country"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="Enter country"
                  value={form.country}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* State (text input) */}
              <div className="flex flex-col space-y-1 text-sm">
                <label className="font-medium text-slate-800">
                  State<span className="ml-0.5 text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="state"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="Enter state"
                  value={form.state}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* City (text input) */}
              <div className="flex flex-col space-y-1 text-sm">
                <label className="font-medium text-slate-800">
                  City<span className="ml-0.5 text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="Enter city"
                  value={form.city}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Pincode */}
              <div className="flex flex-col space-y-1 text-sm">
                <label className="font-medium text-slate-800">
                  Pincode<span className="ml-0.5 text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="pincode"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="Enter pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Status (select) */}
              <div className="flex flex-col space-y-1 text-sm">
                <label className="font-medium text-slate-800">Status</label>
                <select
                  name="status"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="mt-2 flex justify-end gap-3">
              <button
                type="button"
                className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center rounded-full border border-indigo-500 bg-indigo-500 px-4 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-600"
              >
                {mode === "edit" ? "Update Location" : "Save Location"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

function LocationPage() {
  const [locations, setLocations] = useState(initialLocations);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' | 'edit'
  const [editingLocation, setEditingLocation] = useState(null);
  const [sortOption, setSortOption] = useState("country-az");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔄 normalize API data -> UI shape
  const normalizeLocation = (loc) => ({
    id: loc._id || loc.id,
    country: loc.country || "India",
    state: loc.state || "",
    city: loc.city || "",
    pincode: loc.pincode || "",
    status: loc.status || "active",
  });

  // ⬇️ Load locations from API on mount
  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await getAllLocations();
      const data = Array.isArray(res.data) ? res.data : [];
      setLocations(data.map(normalizeLocation));
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load locations");
      // keep existing locations (dummy) as fallback
    } finally {
      setLoading(false);
    }
  };

  // Sorting
  const sortedLocations = [...locations].sort((a, b) => {
    if (sortOption === "country-az") return a.country.localeCompare(b.country);
    if (sortOption === "country-za") return b.country.localeCompare(a.country);
    if (sortOption === "state-az") return a.state.localeCompare(b.state);
    if (sortOption === "state-za") return b.state.localeCompare(a.state);
    if (sortOption === "city-az") return a.city.localeCompare(b.city);
    if (sortOption === "city-za") return b.city.localeCompare(a.city);
    return 0;
  });

  const pageCount = Math.max(1, Math.ceil(sortedLocations.length / pageSize));
  const currentPageSafe = Math.min(currentPage, pageCount);
  const startIndex = (currentPageSafe - 1) * pageSize;
  const visibleLocations = sortedLocations.slice(
    startIndex,
    startIndex + pageSize
  );

  const openAddModal = () => {
    setModalMode("add");
    setEditingLocation(null);
    setIsModalOpen(true);
  };

  const openEditModal = (loc) => {
    setModalMode("edit");
    setEditingLocation(loc);
    setIsModalOpen(true);
  };

  // ✅ Create / Update using API
  const handleSaveLocation = async (loc, mode) => {
    try {
      setLoading(true);
      setErrorMsg("");

      const payload = {
        country: loc.country,
        state: loc.state,
        city: loc.city,
        pincode: loc.pincode,
        status: loc.status,
      };

      if (mode === "edit") {
        // uses id which we mapped from _id
        await updateLocation(loc.id, payload);
        alert("Location updated!");
      } else {
        await createLocation(payload);
        alert("Location created!");
        setCurrentPage(1);
      }

      await loadLocations();
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete using API
  const handleDeleteLocation = async (id) => {
    if (!window.confirm("Are you sure you want to delete this location?")) {
      return;
    }
    try {
      setLoading(true);
      setErrorMsg("");
      await deleteLocation(id);
      await loadLocations();
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to delete");
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (e) => setSortOption(e.target.value);
  const handlePageChange = (page) => setCurrentPage(page);
  const handleFooterClick = (label) =>
    alert(`${label} clicked (demo only).`);

  // ✅ Change status via API (active / inactive)
  const handleStatusChange = async (id, newStatus) => {
    try {
      setLoading(true);
      setErrorMsg("");
      await updateLocation(id, { status: newStatus });
      await loadLocations();
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 mt-20">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 md:px-6 lg:py-8">
        {/* Header */}
        <header className="mb-4 flex items-center justify-between">
          {/* 👇 Heading on the left */}
          <h1 className="text-xl font-semibold text-slate-900">Location</h1>

          <button
            onClick={openAddModal}
            className="hidden items-center gap-2 rounded-full border border-emerald-500/70 bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-600 sm:inline-flex"
          >
            <span className="text-base">＋</span>
            <span>{loading ? "Please wait..." : "Add Location"}</span>
          </button>
        </header>

        {/* Error message (same page, minimal layout impact) */}
        {errorMsg && (
          <div className="mb-3 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        <main className="flex flex-1 flex-col gap-4">
          {/* Controls */}
          <div className="flex flex-col items-start justify-between gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                Total: {locations.length}
              </span>
              <span className="text-xs text-slate-500">
                Page {currentPageSafe} of {pageCount}
              </span>
              {loading && (
                <span className="text-xs text-indigo-500">
                  Loading...
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
                  <option value="country-az">Country A–Z</option>
                  <option value="country-za">Country Z–A</option>
                  <option value="state-az">State A–Z</option>
                  <option value="state-za">State Z–A</option>
                  <option value="city-az">City A–Z</option>
                  <option value="city-za">City Z–A</option>
                </select>
              </div>

              <button
                onClick={openAddModal}
                className="inline-flex items-center rounded-full border border-emerald-500/70 bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-emerald-600 sm:hidden"
              >
                ＋ Add Location
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-2xl bg-white p-4 shadow-md ring-1 ring-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="whitespace-nowrap px-2 py-3 text-center">
                      Country
                    </th>
                    <th className="whitespace-nowrap px-2 py-3 text-center">
                      State
                    </th>
                    <th className="whitespace-nowrap px-2 py-3 text-center">
                      City
                    </th>
                    <th className="whitespace-nowrap px-2 py-3 text-center">
                      Pincode
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
                  {visibleLocations.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-6 text-center text-sm text-slate-500"
                      >
                        No locations found.
                      </td>
                    </tr>
                  ) : (
                    visibleLocations.map((loc, idx) => (
                      <tr
                        key={loc.id}
                        className={`border-t border-slate-100 text-slate-800 ${
                          idx % 2 === 1 ? "bg-slate-50/60" : "bg-white"
                        } hover:bg-indigo-50/40`}
                      >
                        <td className="px-2 py-2 align-middle text-sm text-center">
                          {loc.country}
                        </td>
                        <td className="px-2 py-2 align-middle text-sm text-center">
                          {loc.state}
                        </td>
                        <td className="px-2 py-2 align-middle text-sm text-center">
                          {loc.city}
                        </td>
                        <td className="px-2 py-2 align-middle text-sm text-center">
                          {loc.pincode}
                        </td>
                        <td className="px-2 py-2 align-middle text-center">
                          {/* ACTIVE / INACTIVE BUTTONS */}
                          <div className="inline-flex rounded-full bg-slate-100 p-0.5">
                            <button
                              type="button"
                              onClick={() =>
                                handleStatusChange(loc.id, "active")
                              }
                              className={`px-2 py-1 text-[11px] rounded-full font-medium ${
                                loc.status === "active"
                                  ? "bg-emerald-500 text-white"
                                  : "text-slate-600 hover:text-emerald-600"
                              }`}
                            >
                              Active
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleStatusChange(loc.id, "inactive")
                              }
                              className={`px-2 py-1 text-[11px] rounded-full font-medium ${
                                loc.status === "inactive"
                                  ? "bg-red-500 text-white"
                                  : "text-slate-600 hover:text-red-600"
                              }`}
                            >
                              Inactive
                            </button>
                          </div>
                        </td>
                        <td className="px-2 py-2 align-middle">
                          <div className="flex items-center gap-1">
                            <button
                              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                              title="Edit"
                              onClick={() => openEditModal(loc)}
                            >
                              ✏️
                            </button>
                            <button
                              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-xs text-red-500 hover:bg-red-50"
                              title="Delete"
                              onClick={() => handleDeleteLocation(loc.id)}
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

            {/* Pagination */}
            <div className="mt-4 flex flex-col items-start justify-between gap-3 text-xs text-slate-600 sm:flex-row sm:items-center">
              <span>
                Showing{" "}
                {visibleLocations.length === 0 ? 0 : startIndex + 1} to{" "}
                {Math.min(startIndex + pageSize, sortedLocations.length)} of{" "}
                {sortedLocations.length} entries
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
                    handlePageChange(
                      Math.min(pageCount, currentPageSafe + 1)
                    )
                  }
                  className="h-7 min-w-[30px] rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 hover:bg-slate-50"
                >
                  ›
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-3 flex flex-col items-start justify-between gap-2 text-[11px] text-slate-500 sm:flex-row sm:items-center">
            <span>{/* footer text commented by you */}</span>
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

      <AddLocationModal
        open={isModalOpen}
        mode={modalMode}
        editingLocation={editingLocation}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveLocation}
      />
    </div>
  );
}

export default LocationPage;