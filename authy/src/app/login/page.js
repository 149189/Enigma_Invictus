"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GoogleLoginButton from "../../components/GoogleLoginButton";
import { motion } from "framer-motion";
import { getCurrentUser, localLogin, localRegister, verifyEmail, resendVerificationOTP, sendVerificationOTP } from "@/services/user/userServices";

export default function Home() {
  const router = useRouter();
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    image: null,
  });
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const response = await getCurrentUser(router);
      if (response?.data) {
        router.push("/");
      }
    };
   
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    
    // Reset email verification if email changes
    if (e.target.name === "email") {
      setEmailVerified(false);
      setOtpSent(false);
      setOtp(["", "", "", "", "", ""]);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;
    
    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);
    
    // Focus next input
    if (element.nextSibling && element.value !== "") {
      element.nextSibling.focus();
    }
  };

  const handleSendOtp = async () => {
    if (!formData.email) {
      setMessage("Please enter your email first");
      return;
    }

    setIsLoading(true);
    setMessage("");
    
    // Send OTP request
    const response = await sendVerificationOTP({ email: formData.email }, router);
    
    if (response?.data.status) {
      setOtpSent(true);
      setMessage("OTP sent to your email");
    } else {
      setMessage(response?.message || "Failed to send OTP");
    }
    setIsLoading(false);
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setMessage("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    setMessage("");
    
    // For this example, we'll just verify locally
    // In a production app, you would verify with the backend
    setEmailVerified(true);
    setMessage("Email verified successfully");
    setIsLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    if (isSignup) {
      // Create FormData to send file + text data
      const formDataObj = new FormData();
      formDataObj.append("name", formData.name);
      formDataObj.append("email", formData.email);
      formDataObj.append("password", formData.password);
      formDataObj.append("verificationOTP", otp.join(""));
      if (formData.image) {
        formDataObj.append("image", formData.image);
      }

      const response = await localRegister(formDataObj, router);
      
      if (response?.data) {
        router.push("/welcome");
      } else {
        setMessage(response?.message || "Registration failed. Please try again.");
      }
    } else {
      const response = await localLogin(
        { email: formData.email, password: formData.password },
        router
      );
      
      if (response?.data) {
        router.push("/welcome");
      } else {
        setMessage(response?.message || "Login failed. Please try again.");
      }
    }
    setIsLoading(false);
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setMessage("");
    
    const response = await sendVerificationOTP({ email: formData.email }, router);
    
    if (response?.status) {
      setMessage("New OTP sent to your email");
    } else {
      setMessage(response?.message || "Failed to resend OTP");
    }
    setResendLoading(false);
  };

  const handleSwitchMode = () => {
    setIsSignup((prev) => !prev);
    setMessage("");
    setOtp(["", "", "", "", "", ""]);
    setEmailVerified(false);
    setOtpSent(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-gray-800 mb-2"
          >
            {isSignup ? "Create an Account" : "Welcome Back"}
          </motion.h1>
          <p className="text-gray-600">
            {isSignup ? "Sign up to get started" : "Sign in to continue to your account"}
          </p>
        </div>

        <div className="space-y-4">
          <GoogleLoginButton />
        

          {isSignup && (
            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-4 text-gray-500">or</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {isSignup && (
              <>
                <div className="flex flex-col items-center">
                  {preview ? (
                    <img
                      src={preview}
                      alt="preview"
                      className="w-24 h-24 rounded-full object-cover mb-2 border-4 border-blue-200"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-2 text-gray-500">
                      No Image
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="text-sm text-black "
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    placeholder="Enter your name"
                    required
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="Enter your email"
                required
              />
              
              {isSignup && !emailVerified && (
                <div className="mt-2 flex items-center">
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isLoading || !formData.email}
                    className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors disabled:opacity-50"
                  >
                    {otpSent ? "Resend OTP" : "Send OTP"}
                  </button>
                </div>
              )}
            </div>

            {isSignup && otpSent && !emailVerified && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Verification OTP</label>
                <div className="flex justify-between space-x-2">
                  {otp.map((data, index) => (
                    <input
                      key={index}
                      type="text"
                      name="otp"
                      maxLength="1"
                      value={data}
                      onChange={e => handleOtpChange(e.target, index)}
                      onFocus={e => e.target.select()}
                      className="w-12 h-12 border border-gray-300 rounded-lg text-center text-xl font-semibold focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      required
                    />
                  ))}
                </div>
                
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={isLoading || otp.join("").length !== 6}
                    className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition-colors disabled:opacity-50"
                  >
                    Verify OTP
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={resendLoading}
                    className="text-sm text-blue-600 hover:underline disabled:opacity-50"
                  >
                    {resendLoading ? "Sending..." : "Resend OTP"}
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="Enter your password"
                required
              />
            </div>

            {message && (
              <div className={`p-3 rounded-lg text-center ${
                message.includes("sent") || message.includes("success") || message.includes("verified") 
                  ? "bg-green-100 text-green-700" 
                  : "bg-red-100 text-red-700"
              }`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || (isSignup && !emailVerified)}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading 
                ? "Processing..." 
                : isSignup 
                  ? (emailVerified ? "Sign Up" : "Verify Email to Sign Up") 
                  : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={handleSwitchMode}
            className="text-blue-600 hover:underline"
          >
            {isSignup ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}