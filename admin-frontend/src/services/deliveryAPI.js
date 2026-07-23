// src/services/deliveryAPI.js
import axios from "./axiosInstance";

// PENDING = processing + packed
export const getPendingOrders = () => axios.get("/delivery/pending");

// SHIPPED
export const getShippedOrders = () => axios.get("/delivery/shipped");

// OUT FOR DELIVERY
export const getOutForDelivery = () =>
  axios.get("/delivery/out-for-delivery");

// DELIVERED
export const getDeliveredOrders = () =>
  axios.get("/delivery/delivered");

// UPDATE ORDER DELIVERY STATUS
export const updateDeliveryStatus = (billId, status) =>
  axios.put(`/delivery/update-status/${billId}`, { status });

// UPDATE SHIPPING INFO
export const updateShippingInfo = (billId, data) =>
  axios.put(`/delivery/update-shipping/${billId}`, data);

// MARK AS DELIVERED
export const markDelivered = (billId) =>
  axios.put(`/delivery/mark-delivered/${billId}`);
