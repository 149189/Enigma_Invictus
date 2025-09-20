'use client';
import React, { useState } from 'react';
import { Heart, TrendingUp, Eye, Gift } from 'lucide-react';
import ProjectCard from '../../components/ProjectCard';
import { mockUser, mockProjects } from '../../data/mockData';
const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const user = mockUser; // Assign mockUser to a variable called user

  if (!user) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h2>
          <p className="text-gray-600">You need to be logged in to view your dashboard.</p>
        </div>
      </div>
    );
  }

  const followedProjects = mockProjects.filter(p => user.followedProjects.includes(p.id));
  
  const stats = [
    {
      label: 'Total Donated',
      value: `₹${user.totalDonated.toLocaleString()}`,
      icon: Gift,
      color: 'text-emerald-600 bg-emerald-100'
    },
    {
      label: 'Projects Supported',
      value: user.donationCount.toString(),
      icon: Heart,
      color: 'text-pink-600 bg-pink-100'
    },
    {
      label: 'Following',
      value: user.followedProjects.length.toString(),
      icon: Eye,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      label: 'Impact Score',
      value: '847',
      icon: TrendingUp,
      color: 'text-purple-600 bg-purple-100'
    }
  ];

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user.name}!
              </h1>
              <p className="text-gray-600">
                Track your impact and manage your contributions
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-500">
                      {stat.label}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'donations', label: 'Donation History' },
              { id: 'following', label: `Following (${followedProjects.length})` }
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
        <div>
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Recent Activity */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
                <div className="space-y-4">
                  {user.donationHistory.slice(0, 5).map(donation => (
                    <div key={donation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-4">
                        <div className="bg-emerald-100 p-3 rounded-full">
                          <Gift className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Donated to {donation.projectTitle}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {donation.date.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-emerald-600">
                          ₹{donation.amount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Impact Summary */}
              <div className="bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl p-8 text-white">
                <h2 className="text-2xl font-bold mb-4">Your Impact</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">23</div>
                    <div className="text-emerald-100">Families Helped</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">500+</div>
                    <div className="text-emerald-100">Students Benefited</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">15</div>
                    <div className="text-emerald-100">Trees Planted</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'donations' && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Donation History</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Project</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.donationHistory.map(donation => (
                      <tr key={donation.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-900">
                            {donation.projectTitle}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-bold text-emerald-600">
                            ₹{donation.amount.toLocaleString()}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-600">
                          {donation.date.toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4 text-gray-600 text-sm">
                          {donation.message || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'following' && (
            <div>
              {followedProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {followedProjects.map((project, index) => (
                    <div
                      key={project.id}
                      className="animate-fadeInUp"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <ProjectCard project={project} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Heart className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                    No Followed Projects
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Start following projects to track their progress and get updates.
                  </p>
                  <a
                    href="/projects"
                    className="bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 transition-colors duration-200"
                  >
                    Browse Projects
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;