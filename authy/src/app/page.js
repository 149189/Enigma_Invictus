import React from 'react';
import Link from 'next/link';
import { ArrowRight, Users, Target, Zap, Shield, ChevronDown } from 'lucide-react';
import ProjectCard from '../components/ProjectCard';
import { mockProjects } from '../data/mockData'; // Import mock data directly

const LandingPage = () => {
  // Use mockProjects directly and add optional chaining
  const featuredProjects = mockProjects?.filter(project => project.featured).slice(0, 3) || [];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-16 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-blue-500/5 to-purple-500/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 animate-fadeInUp">
              <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Small Donations,
              </span>
              <br />
              <span className="text-gray-900">Big Impact</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed animate-fadeInUp animation-delay-200">
              Join thousands of community members making a difference through micro-donations. 
              See the real-time impact of your contribution on local causes that matter.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fadeInUp animation-delay-400">
              <Link
                href="/projects"  // Changed 'to' to 'href'
                className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center space-x-2"
              >
                <span>Explore Projects</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/submit"  // Changed 'to' to 'href'
                className="bg-white text-gray-900 px-8 py-4 rounded-full font-semibold border-2 border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-300"
              >
                Start a Project
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-gray-400" />
        </div>
      </section>

      {/* Rest of your component remains the same, just update all Link components */}
      {/* ... */}

      {/* Featured Projects */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Projects
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover amazing projects making a real difference in communities across India.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProjects.map((project, index) => (
              <div
                key={project.id}
                className="animate-fadeInUp"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/projects"  // Changed 'to' to 'href'
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              <span>View All Projects</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ... Rest of your component with all Links updated ... */}

    </div>
  );
};

export default LandingPage;