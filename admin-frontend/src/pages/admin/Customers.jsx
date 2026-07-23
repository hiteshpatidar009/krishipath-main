// src/pages/admin/CustomerManagement.jsx

import { useEffect, useState } from "react";
import {
  getCustomerList,
  getCustomerDetails,
  updateCustomerStatus,
} from "../../services/customerAPI";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export default function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const res = await getCustomerList();
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load customers");
    }
  };

  const openModal = async (customer) => {
    try {
      console.log('Loading customer details for ID:', customer._id);
      const res = await getCustomerDetails(customer._id);
      console.log('Customer details response:', res.data);
      setSelected(res.data);
    } catch (err) {
      console.error('Error loading customer details:', err);
      console.error('Error response:', err.response?.data);
      alert(`Failed to load customer details: ${err.response?.data?.message || err.message}`);
    }
  };

  const closeModal = () => setSelected(null);

  const changeStatus = async (id, status) => {
    try {
      await updateCustomerStatus(id, status);
      loadCustomers();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  return (
    <div className="p-6 mt-20">
      <h1 className="text-3xl font-bold mb-6">Customer Management</h1>

      <div className="bg-white p-4 shadow rounded">
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-2">S.No</th>
              <th className="p-2">Profile</th>
              <th className="p-2">Customer ID</th>
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">Phone</th>
              <th className="p-2">City</th>
              <th className="p-2">State</th>
              <th className="p-2">Status</th>
              <th className="p-2">Registered On</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {customers.map((c, i) => (
              <tr key={c._id} className="border-t">
                <td className="p-2">{i + 1}</td>

                <td className="p-2">
                  <img
                    src={c.profileImage || "/no-user.png"}
                    className="w-12 h-12 rounded-full object-cover"
                    alt="profile"
                  />
                </td>

                <td className="p-2 font-semibold">{c.customerId}</td>
                <td className="p-2">{c.name}</td>
                <td className="p-2">{c.email}</td>
                <td className="p-2">{c.phone}</td>
                <td className="p-2">{c.city}</td>
                <td className="p-2">{c.state}</td>

                <td className="p-2">
                  <select
                    value={c.status}
                    onChange={(e) => changeStatus(c._id, e.target.value)}
                    className="border p-1 rounded"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </td>

                <td className="p-2">
                  {c.createdAt
                    ? new Date(c.createdAt).toLocaleDateString()
                    : "-"}
                </td>

                <td className="p-2">
                  <button
                    onClick={() => openModal(c)}
                    className="text-blue-600 underline"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}

            {customers.length === 0 && (
              <tr>
                <td colSpan={11} className="text-center p-4 text-gray-500">
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && <CustomerModal data={selected} onClose={closeModal} />}
    </div>
  );
}

/* ======================================================
   CUSTOMER DETAILS MODAL
====================================================== */

function CustomerModal({ data, onClose }) {
  const customer = data.customer || {};
  const orders = data.orders || [];
  const ordersCount = data.ordersCount ?? orders.length ?? 0;
  const totalSpent = data.totalSpent ?? 0;

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(`Order History - ${customer.name}`, 10, 10);

    const rows = orders.map((o) => [
      o.billId,
      o.orderStatus,
      o.grandTotal,
      o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "-",
    ]);

    autoTable(doc, {
      head: [["Bill ID", "Status", "Amount", "Date"]],
      body: rows,
    });

    doc.save(`orders_${customer.customerId}.pdf`);
  };

  const exportExcel = () => {
    const rows = orders.map((o) => ({
      BillID: o.billId,
      Status: o.orderStatus,
      Amount: o.grandTotal,
      Date: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "-",
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    XLSX.writeFile(wb, `orders_${customer.customerId}.xlsx`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center p-6">
      <div className="bg-white w-full max-w-3xl p-6 rounded shadow-xl overflow-y-auto max-h-[90vh]">
        <button className="float-right text-red-600" onClick={onClose}>
          Close
        </button>

        <h2 className="text-2xl font-bold mb-4">Customer Details</h2>

        {/* Profile Info */}
        <div className="flex items-center gap-4">
          <img
            src={customer.profileImage || "/no-user.png"}
            className="w-20 h-20 rounded-full object-cover"
            alt="profile"
          />
          <div>
            <p className="text-xl font-semibold">{customer.name}</p>
            <p>ID: {customer.customerId}</p>
            <p>Email: {customer.email}</p>
            <p>Phone: {customer.phone}</p>
          </div>
        </div>

        {/* Address */}
        <div className="bg-gray-100 p-4 rounded mt-4">
          <p>{customer.address}</p>
          <p>
            {customer.city}, {customer.state} - {customer.pincode}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-blue-100 p-4 rounded">
            <p className="text-lg font-semibold">Total Orders</p>
            <p className="text-2xl font-bold">{ordersCount || 0}</p>
            {ordersCount === 0 && (
              <p className="text-sm text-gray-600">No orders yet</p>
            )}
          </div>
          <div className="bg-green-100 p-4 rounded">
            <p className="text-lg font-semibold">Total Spent</p>
            <p className="text-2xl font-bold">₹{totalSpent || 0}</p>
            {totalSpent === 0 && (
              <p className="text-sm text-gray-600">No purchases yet</p>
            )}
          </div>
        </div>
        
        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-yellow-100 p-2 rounded mt-2 text-xs">
            <p>Debug: Customer ID: {customer._id}</p>
            <p>Debug: Orders found: {orders?.length || 0}</p>
            <p>Debug: Orders count: {ordersCount}</p>
            <p>Debug: Total spent: {totalSpent}</p>
          </div>
        )}

        {/* Order History */}
        <h3 className="text-xl font-bold mt-6">Order History</h3>

        <table className="w-full border mt-2">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">Bill ID</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Status</th>
              <th className="p-2">Date</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((o) => (
              <tr key={o._id} className="border-t">
                <td className="p-2 font-bold">#{o.billId}</td>
                <td className="p-2">₹{o.grandTotal}</td>
                <td className="p-2">{o.orderStatus}</td>
                <td className="p-2">
                  {o.createdAt
                    ? new Date(o.createdAt).toLocaleDateString()
                    : "-"}
                </td>
              </tr>
            ))}

            {orders.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center p-4 text-gray-500">
                  <div>
                    <p className="font-semibold">No orders found for this customer.</p>
                    <p className="text-sm mt-1">This customer hasn't placed any orders yet.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Export Buttons */}
        <div className="flex gap-4 mt-4">
          <button
            onClick={exportPDF}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Export PDF
          </button>

          <button
            onClick={exportExcel}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Export Excel
          </button>
          
          {orders.length === 0 && (
            <button
              onClick={async () => {
                try {
                  const response = await fetch(`http://localhost:8000/api/customer/sample-order/${customer._id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                  });
                  if (response.ok) {
                    alert('Sample order created! Refresh to see it.');
                    onClose();
                  }
                } catch (err) {
                  alert('Error creating sample order');
                }
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Create Sample Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
