// services/admin/adminServices.js
import { apiClient } from "@/helper/commonHelper.js";
import { handleApiResponse } from "@/helper/zindex.js";

// ✅ Get current logged-in admin
export const getCurrentAdmin = async (router) => {
  try {
    const response = await apiClient.get(`/admin/profile`);
    return handleApiResponse(response, router);
  } catch (error) {
    console.error("Error fetching admin:", error);
    return { data: null, message: "Failed to fetch admin data" };
  }
};

// ✅ Admin login
export const adminLogin = async (payload, router) => {
  try {
    const response = await apiClient.post(`/admin/login`, payload);
    return handleApiResponse(response, router);
  } catch (error) {
    console.error("Admin login error:", error);
    return { data: null, message: "Admin login failed" };
  }
};

// ✅ Admin logout
export const adminLogout = async (router) => {
  try {
    const response = await apiClient.get(`/admin/logout`, {});
    return handleApiResponse(response, router);
  } catch (error) {
    console.error("Admin logout error:", error);
    return { data: null, message: "Admin logout failed" };
  }
};