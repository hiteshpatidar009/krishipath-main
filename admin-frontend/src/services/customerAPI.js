import axios from "axios";

const API = "http://localhost:8000/api/customer";

import axiosInstance from "./axiosInstance";


export const getAllCustomers = () => axios.get(`${API}/list`);


export const exportCustomerPDF = async (id) => {
  window.open(`${API}/${id}/export-pdf`, "_blank");
};

export const exportAllCustomersExcel = async () => {
  window.open(`${API}/export-excel`, "_blank");
};




// ✅ Get list of all customers (for table)
export const getCustomerList = () =>
  axiosInstance.get("/customer/list");

// ✅ Get one customer + order history (IMPORTANT: /details/:id)
export const getCustomerDetails = (id) =>
  axiosInstance.get(`/customer/details/${id}`);

// ✅ Update active / inactive
export const updateCustomerStatus = (id, status) =>
  axiosInstance.put(`/customer/${id}/status/${status}`);

