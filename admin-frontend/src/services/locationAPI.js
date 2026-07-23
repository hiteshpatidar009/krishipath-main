import axios from "./axiosInstance";

// Get all locations
export const getAllLocations = () =>
  axios.get("/location/all");

// Create location
export const createLocation = (data) =>
  axios.post("/location/create", data);

// Update location
export const updateLocation = (id, data) =>
  axios.put(`/location/update/${id}`, data);

// Delete location
export const deleteLocation = (id) =>
  axios.delete(`/location/delete/${id}`);
