// app/profile/page.js
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, logoutUser } from "@/services/user/userServices";
import { 
  User, 
  Mail, 
  Calendar, 
  LogOut, 
  Edit, 
  Shield,
  Globe,
  CreditCard,
  Heart,
  Settings
} from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const response = await getCurrentUser(router);
      if (response?.data) {
        setUser(response.data.data);
      } else {
        router.push("/login");
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    const res = await logoutUser(router);
    if (res?.data?.success) {
      setUser(null);
      router.push("/");
    } else {
      alert("Logout failed, try again");
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="w-12 h-12 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <div className="flex flex-col md:flex-row items-center">
              <div className="relative mb-4 md:mb-0 md:mr-6">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-24 h-24 rounded-full border-4 border-white/80 object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/80">
                    <User size={40} />
                  </div>
                )}
                <button className="absolute bottom-0 right-0 bg-white text-blue-600 p-2 rounded-full shadow-md hover:bg-blue-50 transition-colors">
                  <Edit size={16} />
                </button>
              </div>
              
              <div className="text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold">{user?.name}</h1>
                <p className="flex items-center justify-center md:justify-start mt-2">
                  <Mail size={16} className="mr-2" />
                  {user?.email}
                </p>
                <div className="flex items-center justify-center md:justify-start mt-2">
                  <Shield size={16} className="mr-2" />
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    {user?.status || 'Active'}
                  </span>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="ml-auto mt-4 md:mt-0 flex items-center bg-white/20 hover:bg-white/30 py-2 px-4 rounded-lg transition-colors"
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-6 py-4 font-medium text-sm flex items-center whitespace-nowrap ${activeTab === "profile" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
              >
                <User size={16} className="mr-2" />
                Profile
              </button>
              <button
                onClick={() => setActiveTab("activity")}
                className={`px-6 py-4 font-medium text-sm flex items-center whitespace-nowrap ${activeTab === "activity" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
              >
                <Heart size={16} className="mr-2" />
                Activity
              </button>
              <button
                onClick={() => setActiveTab("billing")}
                className={`px-6 py-4 font-medium text-sm flex items-center whitespace-nowrap ${activeTab === "billing" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
              >
                <CreditCard size={16} className="mr-2" />
                Billing
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`px-6 py-4 font-medium text-sm flex items-center whitespace-nowrap ${activeTab === "settings" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
              >
                <Settings size={16} className="mr-2" />
                Settings
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "profile" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-3 rounded-lg mr-4">
                        <User className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="font-medium">{user?.name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-3 rounded-lg mr-4">
                        <Mail className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email Address</p>
                        <p className="font-medium">{user?.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-3 rounded-lg mr-4">
                        <Globe className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Account Type</p>
                        <p className="font-medium capitalize">{user?.provider || 'Local'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-3 rounded-lg mr-4">
                        <Calendar className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Member Since</p>
                        <p className="font-medium">{user?.createdAt ? formatDate(user.createdAt) : 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Account Status</h2>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                      <Shield className="text-green-600 mr-2" size={20} />
                      <span className="font-medium text-green-800">Your account is active</span>
                    </div>
                    <p className="text-sm text-green-600 mt-1">
                      You have full access to all CommunityFund features.
                    </p>
                  </div>
                  
                  <h3 className="font-medium text-gray-700 mb-3">Security</h3>
                  <div className="space-y-3">
                    <button className="w-full text-left py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                      Change Password
                    </button>
                    <button className="w-full text-left py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                      Two-Factor Authentication
                    </button>
                    <button className="w-full text-left py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                      Connected Devices
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === "activity" && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Activity</h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <Heart className="text-blue-400 mx-auto mb-3" size={32} />
                  <h3 className="font-medium text-blue-800">Your donation history will appear here</h3>
                  <p className="text-blue-600 text-sm mt-1">
                    Once you start supporting projects, you'll see a record of all your contributions.
                  </p>
                  <button 
                    onClick={() => router.push('/projects')}
                    className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Explore Projects
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === "billing" && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Billing Information</h2>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                  <CreditCard className="text-yellow-500 mx-auto mb-3" size={32} />
                  <h3 className="font-medium text-yellow-800">No payment methods yet</h3>
                  <p className="text-yellow-600 text-sm mt-1">
                    You haven't added any payment methods. Add a card to start supporting projects.
                  </p>
                  <button className="mt-4 bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors">
                    Add Payment Method
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === "settings" && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Account Settings</h2>
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-700 mb-2">Notifications</h3>
                    <p className="text-sm text-gray-600 mb-3">Manage how we notify you about activities</p>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Email Notifications</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-700 mb-2">Privacy</h3>
                    <p className="text-sm text-gray-600 mb-3">Control your privacy settings</p>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Public Profile</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="border border-red-200 rounded-lg p-4">
                    <h3 className="font-medium text-red-700 mb-2">Danger Zone</h3>
                    <p className="text-sm text-red-600 mb-3">Once you delete your account, there is no going back</p>
                    <button className="bg-red-100 text-red-700 py-2 px-4 rounded-lg hover:bg-red-200 transition-colors">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}