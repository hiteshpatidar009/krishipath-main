import axios from "./axiosInstance";

// Calculate charges
export const calculateShipping = (data) =>
  axios.post("/shipping/calculate", data);

// Create shipment
export const createShipment = (data) =>
  axios.post("/shipping/create-shipment", data);

// Track shipment by AWB
export const trackShipment = (awb) =>
  axios.get(`/shipping/track/${awb}`);

// Admin — update settings
export const updateShippingSettings = (data) =>
  axios.put("/admin/shipping-settings", data);

// Admin — get settings
export const getShippingSettings = () =>
  axios.get("/admin/shipping-settings");



// Calculate charge
export const calculateShippingCharge = (data) =>
  axios.post("/shipping/calculate", data);

