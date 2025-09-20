'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, MapPin, Calendar, Users, Share2, Heart, CheckCircle, TrendingUp } from 'lucide-react';
import axios from 'axios';

const ProjectDetailsPage = () => {
  const { prjectId } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('about');
  const [isFollowing, setIsFollowing] = useState(false);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch project details from API
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8000/api/projects/${prjectId}/get_id`);
        
        if (response.data.success) {
          setProject(response.data.project);
        } else {
          setError('Failed to fetch project details');
        }
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Failed to load project. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (prjectId) {
      fetchProject();
    }
  }, [prjectId]);

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The project you are looking for does not exist.'}</p>
          <Link
            href="/projects"
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors duration-200"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const progressPercentage = (project.raisedAmount / project.goalAmount) * 100;
  
  const getCategoryColor = (category) => {
    const colors = {
      Education: 'bg-blue-100 text-blue-800 border-blue-200',
      Environment: 'bg-green-100 text-green-800 border-green-200',
      Community: 'bg-purple-100 text-purple-800 border-purple-200',
      Health: 'bg-pink-100 text-pink-800 border-pink-200',
      Other: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const handleDonate = (amount) => {
    router.push(`/payment/${project._id}?amount=${amount}`);
  };

  // Since the API doesn't provide these fields, we'll use placeholders
  const daysLeft = 30; // Placeholder - you might want to calculate this based on createdAt
  const donorCount = 0; // Placeholder - you might want to add this to your API
  const isVerified = project.status === 'approved'; // Consider approved projects as verified

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-emerald-600 mb-6 transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Hero Image */}
            <div className="relative rounded-2xl overflow-hidden mb-8">
              <img
                src={project.images && project.images.length > 0 
                  ? project.images[0] 
                  : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600'}
                alt={project.title}
                className="w-full h-64 md:h-96 object-cover"
              />
              <div className="absolute top-6 left-6 flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize border ${getCategoryColor(project.category)}`}>
                  {project.category}
                </span>
                {isVerified && (
                  <div className="bg-emerald-500 text-white p-2 rounded-full">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>

            {/* Project Header */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {project.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
                <div className="flex items-center space-x-2">
                  <img
                    src={project.creator?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                    alt={project.creator?.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="font-medium">{project.creator?.name}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{daysLeft} days left</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{donorCount} donors</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isFollowing
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFollowing ? 'fill-current' : ''}`} />
                  <span>{isFollowing ? 'Following' : 'Follow'}</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 mb-8">
              <nav className="flex space-x-8">
                {[
                  { id: 'about', label: 'About' },
                  // Removed other tabs since API doesn't provide this data
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-3 px-1 font-medium text-sm transition-colors duration-200 border-b-2 ${
                      activeTab === tab.id
                        ? 'text-emerald-600 border-emerald-600'
                        : 'text-gray-500 border-transparent hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="mb-8">
              {activeTab === 'about' && (
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed text-lg mb-6">
                    {project.description}
                  </p>
                  
                  {project.images && project.images.length > 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                      {project.images.slice(1).map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`${project.title} ${index + 2}`}
                          className="rounded-xl object-cover h-48 w-full"
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              {/* Progress */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-2xl font-bold text-gray-900">
                    ₹{project.raisedAmount.toLocaleString()}
                  </span>
                  <span className="text-gray-500">
                    ₹{project.goalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-600">
                  {progressPercentage.toFixed(1)}% funded • {donorCount} donors
                </div>
              </div>

              {/* Quick Donate */}
              <div className="space-y-3 mb-6">
                <h3 className="font-semibold text-gray-900">Quick Donate</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[50, 100, 500, 1000].map(amount => (
                    <button
                      key={amount}
                      onClick={() => handleDonate(amount)}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                    >
                      ₹{amount}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Amount
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                    ₹
                  </span>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Donate Button */}
              <button
                onClick={() => handleDonate(100)}
                className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 mb-4"
              >
                Donate Now
              </button>

              {/* Project Stats */}
              <div className="border-t pt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Days remaining</span>
                  <span className="font-semibold text-gray-900">{daysLeft}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total donors</span>
                  <span className="font-semibold text-gray-900">{donorCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Created</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;