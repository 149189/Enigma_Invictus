'use client';
import React, { useState } from 'react';
import { useRouter,useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, CreditCard, Smartphone, Building2, Lock, CheckCircle } from 'lucide-react';
import { mockProjects } from '../../../data/mockData';

const PaymentPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams(); // use the hook
  const projectId = params.projectId; // access param safely

  const [amount, setAmount] = useState(searchParams.get('amount') || '100');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [donorInfo, setDonorInfo] = useState({
    name: '',
    email: '',
    message: '',
    anonymous: false
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const project = mockProjects.find(p => p.id === projectId);

  if (!project) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h2>
          <button
            onClick={() => router.push('/projects')}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors duration-200"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const handlePayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 3000));

    setIsProcessing(false);
    setIsComplete(true);

    // Redirect after success
    setTimeout(() => {
      router.push(`/project/${projectId}`);
    }, 3000);
  };

  if (isComplete) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h2>
          <p className="text-gray-600 mb-6">
            Your donation of ₹{amount} to {project.title} has been processed successfully.
          </p>
          <div className="bg-emerald-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-emerald-800">
              You'll receive a confirmation email shortly. Thank you for making a difference!
            </p>
          </div>
          <button
            onClick={() => router.push(`/project/${projectId}`)}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors duration-200"
          >
            View Project
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-8 pb-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-emerald-600 mb-6 transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Project</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-8">Complete Your Donation</h1>

              <form onSubmit={handlePayment} className="space-y-6">
                {/* Donation Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Donation Amount
                  </label>
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {[100, 500, 1000, 2000].map(presetAmount => (
                      <button
                        key={presetAmount}
                        type="button"
                        onClick={() => setAmount(presetAmount.toString())}
                        className={`py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                          amount === presetAmount.toString()
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        ₹{presetAmount}
                      </button>
                    ))}
                  </div>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="1"
                      required
                      className="flex-1 px-3 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter custom amount"
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Payment Method
                  </label>
                  <div className="space-y-3">
                    {[
                      { id: 'card', label: 'Credit/Debit Card', icon: CreditCard },
                      { id: 'upi', label: 'UPI', icon: Smartphone },
                      { id: 'netbanking', label: 'Net Banking', icon: Building2 }
                    ].map(method => (
                      <label
                        key={method.id}
                        className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={paymentMethod === method.id}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="text-emerald-600"
                        />
                        <method.icon className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-gray-900">{method.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Donor Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Your Information
                  </label>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={donorInfo.name}
                      onChange={(e) => setDonorInfo(prev => ({ ...prev, name: e.target.value }))}
                      required={!donorInfo.anonymous}
                      disabled={donorInfo.anonymous}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100"
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={donorInfo.email}
                      onChange={(e) => setDonorInfo(prev => ({ ...prev, email: e.target.value }))}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <textarea
                      placeholder="Leave a message (optional)"
                      value={donorInfo.message}
                      onChange={(e) => setDonorInfo(prev => ({ ...prev, message: e.target.value }))}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={donorInfo.anonymous}
                        onChange={(e) =>
                          setDonorInfo(prev => ({
                            ...prev,
                            anonymous: e.target.checked,
                            name: e.target.checked ? '' : prev.name
                          }))
                        }
                        className="rounded text-emerald-600"
                      />
                      <span className="text-sm text-gray-700">Donate anonymously</span>
                    </label>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Lock className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Secure Payment Processing</span>
                  </div>
                  <p className="text-xs text-blue-700 mt-1">
                    Your payment information is encrypted and secure. We never store your card details.
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing Payment...</span>
                    </div>
                  ) : (
                    `Donate ₹${amount}`
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Project Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="font-bold text-gray-900 mb-4">Donation Summary</h2>

              <div className="space-y-4 mb-6">
                <img
                  src={project.images[0]}
                  alt={project.title}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{project.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{project.location}</p>
                  <div className="text-xs text-gray-500">by {project.creatorName}</div>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Donation Amount:</span>
                  <span className="font-semibold">₹{amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform Fee:</span>
                  <span className="font-semibold">₹0</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-3">
                  <span>Total:</span>
                  <span>₹{amount}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-emerald-50 rounded-lg">
                <p className="text-xs text-emerald-800">
                  <strong>100% of your donation</strong> goes directly to the project. We don't charge any platform fees.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
