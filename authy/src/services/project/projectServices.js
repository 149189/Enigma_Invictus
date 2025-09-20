import { apiClient } from "@/helper/commonHelper.js";
import { handleApiResponse } from "@/helper/zindex.js";

// ✅ Submit new project
export const createProject = async (formData, router) => {
  try {
    const response = await apiClient.post(`/projects/create`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return handleApiResponse(response, router);
  } catch (error) {
    console.error("❌ createProject error:", error);
    throw error;
  }
};
