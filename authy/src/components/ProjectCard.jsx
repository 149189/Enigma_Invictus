'use client';
import React from 'react';
import Link from 'next/link';
import { MapPin, Users, CheckCircle } from 'lucide-react';

const ProjectCard = ({ project }) => {
  const progressPercentage = (project.raisedAmount / project.goalAmount) * 100;

  const getCategoryColor = (category) => {
    const colors = {
      education: 'bg-blue-100 text-blue-800',
      environment: 'bg-green-100 text-green-800',
      community: 'bg-purple-100 text-purple-800',
      health: 'bg-pink-100 text-pink-800',
      emergency: 'bg-red-100 text-red-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group hover:transform hover:scale-105">
      <div className="relative">
        <img
          src={project.images?.[0] || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600'}
          alt={project.title}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4 flex items-center space-x-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getCategoryColor(
              project.category
            )}`}
          >
            {project.category}
          </span>
          {project.verified && (
            <div className="bg-emerald-500 text-white p-1.5 rounded-full">
              <CheckCircle className="w-3 h-3" />
            </div>
          )}
        </div>
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
          <span className="text-sm font-semibold text-gray-800">
            {project.daysLeft} days left
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center space-x-3 mb-3">
          <img
            src={project.creatorAvatar}
            alt={project.creatorName}
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="text-sm text-gray-600">{project.creatorName}</span>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors duration-200">
          {project.title}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {project.shortDescription}
        </p>

        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span>{project.location}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{project.donorCount} donors</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-semibold text-gray-900">
              ₹{project.raisedAmount.toLocaleString()}
            </span>
            <span className="text-gray-500">
              ₹{project.goalAmount.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {progressPercentage.toFixed(1)}% funded
          </div>
        </div>

        <Link
          href={`/project/${project.id}`}
          className="block w-full bg-gradient-to-r from-emerald-600 to-blue-600 text-white text-center py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:from-emerald-700 hover:to-blue-700"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;
