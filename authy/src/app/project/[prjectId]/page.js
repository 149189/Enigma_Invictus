'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, MapPin, Calendar, Users, Share2, Heart, CheckCircle, TrendingUp } from 'lucide-react';
import { mockProjects,mockUsers } from '../../../data/mockData';
const ProjectDetailsPage = () => {
  const { prjectId } = useParams(); // dynamic param from folder [prjectId]
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('about');
  const [isFollowing, setIsFollowing] = useState(false);

  const project = mockProjects.find(p => p.id === prjectId);

  if (!project) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h2>
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
  const getCategoryColor = () => {
    const colors = {
      education: 'bg-blue-100 text-blue-800 border-blue-200',
      environment: 'bg-green-100 text-green-800 border-green-200',
      community: 'bg-purple-100 text-purple-800 border-purple-200',
      health: 'bg-pink-100 text-pink-800 border-pink-200',
      emergency: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors;
  };
  const handleDonate = (amount) => {
    router.push(`/payment/${project.id}?amount=${amount}`);
  };

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
                src={project.images[0]}
                alt={project.title}
                className="w-full h-64 md:h-96 object-cover"
              />
              <div className="absolute top-6 left-6 flex items-center space-x-3 ">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize border bg-white text-black ${getCategoryColor(project.category)}`}>
                  {project.category}
                </span>
                {project.verified && (
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
                    src={project.creatorAvatar}
                    alt={project.creatorName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="font-medium">{project.creatorName}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{project.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{project.daysLeft} days left</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{project.donorCount} donors</span>
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
                  { id: 'updates', label: `Updates (${project.updates.length})` },
                  { id: 'milestones', label: 'Milestones' },
                  { id: 'impact', label: 'Impact' }
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
                  
                  {project.images.length > 1 && (
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

              {activeTab === 'updates' && (
                <div className="space-y-6">
                  {project.updates.length > 0 ? (
                    project.updates.map(update => (
                      <div key={update.id} className="bg-gray-50 rounded-xl p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <img
                            src={project.creatorAvatar}
                            alt={project.creatorName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <h3 className="font-semibold text-gray-900">{update.title}</h3>
                            <p className="text-sm text-gray-500">
                              {update.createdAt.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-4">{update.content}</p>
                        {update.images.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {update.images.map((image, index) => (
                              <img
                                key={index}
                                src={image}
                                alt={`Update ${index + 1}`}
                                className="rounded-lg object-cover h-32 w-full"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">No updates yet.</p>
                  )}
                </div>
              )}

              {activeTab === 'milestones' && (
                <div className="space-y-4">
                  {project.milestones.map((milestone, index) => (
                    <div
                      key={milestone.id}
                      className={`p-6 rounded-xl border-2 ${
                        milestone.achieved
                          ? 'border-emerald-200 bg-emerald-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className={`font-semibold ${
                          milestone.achieved ? 'text-emerald-900' : 'text-gray-900'
                        }`}>
                          {milestone.title}
                        </h3>
                        {milestone.achieved && (
                          <CheckCircle className="w-6 h-6 text-emerald-600" />
                        )}
                      </div>
                      <p className={`mb-3 ${
                        milestone.achieved ? 'text-emerald-700' : 'text-gray-600'
                      }`}>
                        {milestone.description}
                      </p>
                      <div className={`text-sm font-medium ${
                        milestone.achieved ? 'text-emerald-800' : 'text-gray-500'
                      }`}>
                        Target: ₹{milestone.targetAmount.toLocaleString()}
                        {milestone.achieved && milestone.achievedAt && (
                          <span className="ml-4">
                            Achieved on {milestone.achievedAt.toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'impact' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {project.impactMetrics.map((metric, index) => (
                    <div key={index} className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-xl p-6 text-center">
                      <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-2">
                        {metric.value.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        {metric.label} {metric.unit && `(${metric.unit})`}
                      </div>
                    </div>
                  ))}
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
                  {progressPercentage.toFixed(1)}% funded • {project.donorCount} donors
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
                  <span className="font-semibold text-gray-900">{project.daysLeft}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total donors</span>
                  <span className="font-semibold text-gray-900">{project.donorCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Created</span>
                  <span className="font-semibold text-gray-900">
                    {project.createdAt.toLocaleDateString()}
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
