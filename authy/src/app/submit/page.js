"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, AlertCircle } from "lucide-react";
import { createProject } from "@/services/project/projectServices";

export default function SubmitProjectPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Community",
    goalAmount: "",
    images: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const router = useRouter();

  const categories = [
    { value: "Education", label: "Education" },
    { value: "Environment", label: "Environment" },
    { value: "Community", label: "Community" },
    { value: "Health", label: "Health" },
    { value: "Other", label: "Other" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (files) => {
    const newImages = Array.from(files).slice(0, 5 - formData.images.length);
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...newImages] }));
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.token) {
        setError("You must be logged in to submit a project.");
        setIsSubmitting(false);
        return;
      }

      const submitData = new FormData();
submitData.append("title", formData.title);
submitData.append("description", formData.description);
submitData.append("category", formData.category);
submitData.append("goalAmount", formData.goalAmount);
formData.images.forEach((image) => submitData.append("images", image));

// 👇 Correct way to log FormData
for (let [key, value] of submitData.entries()) {
  console.log(key, value);
}

      const response = await createProject(submitData, router);

      if (response?.data?.success) {
        alert("✅ Project submitted successfully!");
        setFormData({
          title: "",
          description: "",
          category: "Community",
          goalAmount: "",
          images: [],
        });
        // router.push("/projects");
      } else {
        setError(response?.data?.message || "Failed to submit project");
      }
    } catch (err) {
      console.error("❌ Error submitting project:", err);
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden p-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">
            Submit Your Project
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Project Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-black"
                placeholder="Give your project a compelling title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-black"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Goal Amount (₹) *
              </label>
              <input
                type="number"
                name="goalAmount"
                value={formData.goalAmount}
                onChange={handleInputChange}
                required
                min="1000"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-black"
                placeholder="Minimum ₹1,000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-black"
                placeholder="Provide a comprehensive description..."
              />
            </div>

            {/* Image Upload */}
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                dragActive
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Upload Project Images
              </h3>
              <p className="text-gray-600 mb-4">
                Drag and drop images here, or click to browse
              </p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) =>
                  e.target.files && handleImageUpload(e.target.files)
                }
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors duration-200 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Choose Files</span>
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Maximum 5 images, up to 5MB each
              </p>
            </div>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Submit */}
            <div className="text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-emerald-600 text-white px-8 py-4 rounded-xl hover:bg-emerald-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
              >
                {isSubmitting ? "Submitting..." : "Submit Project"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
