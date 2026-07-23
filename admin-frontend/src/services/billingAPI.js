// src/services/billingAPI.js
import axios from "./axiosInstance";

// GET ALL BILLS
export const getAllBills = () => axios.get("/bill/all");

// GET BILL BY BILL ID
export const getBillById = (billId) => axios.get(`/bill/${billId}`);

// CREATE BILL
export const createBill = (data) => axios.post("/bill/create", data);

// UPDATE ORDER STATUS (processing → packed → shipped → delivered)
export const updateOrderStatus = (billId, status) =>
  axios.put(`/bill/update-status/${billId}`, { status });

// UPDATE PAYMENT STATUS
export const updatePaymentStatus = (billId, status) =>
  axios.put(`/bill/update-payment/${billId}`, { status });

// DOWNLOAD PDF INVOICE
export const downloadInvoicePdf = (billId) =>
  axios.get(`/bill/invoice/${billId}`, {
    responseType: "blob",
  });


  
