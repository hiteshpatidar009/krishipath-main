// src/services/superAdminAPI.js
import axios from "./axiosInstance";

const getToken = () => localStorage.getItem("token");



// GET ALL ADMINS
export const getAllAdmins = () =>
  axios.get("/admin/list", {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

// CREATE ADMIN
export const createAdmin = (payload) =>
  axios.post("/admin/create", payload, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });

// DELETE ADMIN
export const deleteAdmin = (id) =>
  axios.delete(`/admin/${id}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

// UPDATE STATUS
export const updateAdminStatus = (id, status) =>
  axios.patch(
    `/admin/${id}`,
    { status },
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
