import React, { useState, useEffect } from "react";
import { Pencil, Trash2, PlusCircle, X, Trash, CheckCircle } from "lucide-react";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../services/categoryAPI";

export default function Category() {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ name: "", description: "", status: "Active" });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // 🟢 Load all categories from API
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await getAllCategories();
      setCategories(res.data || []);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  // 🟢 Handle form input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🟢 Create new category
  const handleAdd = async () => {
    if (!formData.name.trim()) return alert("Category name is required!");
    setLoading(true);
    try {
      await createCategory(formData);
      setShowAddModal(false);
      setFormData({ name: "", description: "", status: "Active" });
      setSuccessMessage("Category added successfully!");
      setShowSuccessModal(true);
      loadCategories();
    } catch (err) {
      alert("Failed to add category");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Edit category (open modal)
  const handleEdit = (cat) => {
    setSelectedCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description,
      status: cat.status === "inactive" ? "Inactive" : "Active",
    });
    setShowEditModal(true);
  };

  // 🟢 Update category
  const handleSaveEdit = async () => {
    if (!selectedCategory) return;
    setLoading(true);
    try {
      await updateCategory(selectedCategory._id, formData);
      setShowEditModal(false);
      setSelectedCategory(null);
      setSuccessMessage("Category updated successfully!");
      setShowSuccessModal(true);
      loadCategories();
    } catch (err) {
      alert("Failed to update category");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Delete Category
  const handleDelete = (cat) => {
    setSelectedCategory(cat);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedCategory) return;
    try {
      await deleteCategory(selectedCategory._id);
      setShowDeleteModal(false);
      setSuccessMessage("Category deleted successfully!");
      setShowSuccessModal(true);
      loadCategories();
    } catch (err) {
      alert("Failed to delete category");
    }
  };

  // 🟢 Toggle Active/Inactive status
  const toggleStatus = async (cat) => {
    const newStatus = cat.status === "active" ? "inactive" : "active";
    try {
      await updateCategory(cat._id, { status: newStatus });
      loadCategories();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  // 🟢 Auto-close success popup
  useEffect(() => {
    if (showSuccessModal) {
      const timer = setTimeout(() => setShowSuccessModal(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessModal]);

  return (
    <main className="pt-20 pb-10 bg-gray-50 min-h-screen w-full overflow-x-hidden px-4 md:px-6 xl:px-10">
      {/* ✅ Success Popup */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-xl shadow-lg w-80 p-6 text-center animate-fade-in">
            <div className="flex justify-center mb-3">
              <CheckCircle size={48} className="text-green-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">{successMessage}</h2>
            <p className="text-sm text-gray-500">Action completed successfully.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Manage Categories</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1 text-sm bg-green-600 text-white px-4 py-1 rounded-md hover:bg-green-700"
        >
          <PlusCircle size={18} /> Add Category
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-gray-100">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="bg-gray-50 text-gray-700 font-semibold">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat._id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{cat.name}</td>
                <td className="px-4 py-3">{cat.description || "—"}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleStatus(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      cat.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {cat.status === "active" ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="px-4 py-3 text-center flex gap-3 justify-center">
                  <button
                    onClick={() => handleEdit(cat)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Edit"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🟢 Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-xl shadow-lg w-96 p-6 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              <X size={18} />
            </button>
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Add New Category</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Category Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter category name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2 text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <input
                  type="text"
                  name="description"
                  placeholder="Enter description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2 text-sm mt-1"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={loading}
                className="px-4 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                {loading ? "Saving..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🟢 Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-xl shadow-lg w-96 p-6 relative">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              <X size={18} />
            </button>
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Edit Category</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Category Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter category name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2 text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <input
                  type="text"
                  name="description"
                  placeholder="Enter description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2 text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2 text-sm mt-1"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={loading}
                className="px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {loading ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🟢 Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-xl shadow-lg w-96 p-6 relative text-center">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              <X size={18} />
            </button>
            <div className="flex justify-center mb-3">
              <Trash size={48} className="text-red-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Confirm Deletion</h2>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete <b>{selectedCategory?.name}</b>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}