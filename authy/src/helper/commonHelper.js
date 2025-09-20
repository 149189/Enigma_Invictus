import axios from "axios";

const asyncHandler = (fn) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error("Error:", error);
      throw error; // Rethrow the error if needed
    }
  };
};

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
};

const handleRequest = async (axiosCall) => {
  try {
    const response = await axiosCall();
    return { data: response.data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error.response?.data?.message || error.message || "Request failed",
    };
  }
};

// Use NEXT_PUBLIC_API_URL (as exposed in next.config.mjs) with a local default
const base_url =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:8001/api";

// 🔑 Function to get access token from localStorage
const getAccessToken = () => {
  try {
    const user = JSON.parse(localStorage.getItem("User"));
    return user?.accessToken || null;
  } catch (err) {
    return null;
  }
};

export const apiClient = {
  get: async (url, config = {}) =>
    handleRequest(() =>
      axios.get(`${base_url}${url}`, {
        ...config,
        withCredentials: true,
        headers: {
          ...(config.headers || {}),
          Authorization: `Bearer ${getAccessToken()}`, // ✅ attach token
        },
      })
    ),

  post: async (url, data, headers = {}) => {
    if (data instanceof FormData) {
      delete headers["Content-Type"];
    } else if (!headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    return handleRequest(() =>
      axios.post(`${base_url}${url}`, data, {
        headers: {
          ...headers,
          Authorization: `Bearer ${getAccessToken()}`, // ✅ attach token
        },
        withCredentials: true,
      })
    );
  },

  delete: async (url, headers = {}) =>
    handleRequest(() =>
      axios.delete(`${base_url}${url}`, {
        headers: {
          ...headers,
          Authorization: `Bearer ${getAccessToken()}`, // ✅ attach token
        },
        withCredentials: true,
      })
    ),
};

// helper/responseHandler.js
export const handleApiResponse = (response, router) => {
 
  if (
    response?.error == "Unauthorized request: Invalid access token" ||
    response?.error == "Unauthorized request: Token missing" ||
    response?.error == "Unauthorized request: Token verification failed" ||
    response?.error == "jwt malformed" ||
    response?.error == "jwt expired"
  ) {
    localStorage.removeItem("User");
    router.push("/"); // redirect to login
    return null;
  }
  return response;
};

export { asyncHandler, getCookie };
