import { apiClient } from "@/helper/commonHelper.js";
import { handleApiResponse } from "@/helper/zindex.js";



// ✅ Get current logged-in user (/users/me)
export const getCurrentUser = async (router) => {
  const response = await apiClient.get(`/users/me`);
  return handleApiResponse(response, router);
};

// ✅ Google login
export const googleLogin = async (payload, router) => {
  const response = await apiClient.post(`/users/google`, payload);
  return handleApiResponse(response, router);
};

// ✅ Logout
export const logoutUser = async (router) => {
  const response = await apiClient.get(`/users/logout`, {});
  return handleApiResponse(response, router);
};

export const localLogin = async (payload, router) => {
  const response = await apiClient.post(`/users/login`, payload);
  return handleApiResponse(response, router);
};

// ✅ Local register
export const localRegister = async (payload, router) => {
  const response = await apiClient.post(`/users/register`, payload);
  return handleApiResponse(response, router);
};

export const verifyEmail = async (payload, router) => {
  const response = await apiClient.post(`/users/verify-email`, payload);
  return handleApiResponse(response, router);
};

// ✅ Resend verification OTP
export const resendVerificationOTP = async (payload, router) => {
  const response = await apiClient.post(`/users/resend-verification`, payload);
  return handleApiResponse(response, router);
};

// ✅ Send verification OTP
export const sendVerificationOTP = async (payload, router) => {
  const response = await apiClient.post(`/users/send-verification-otp`, payload);
  return handleApiResponse(response, router);
};





