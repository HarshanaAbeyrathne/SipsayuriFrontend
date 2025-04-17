'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const navigationButtons = [
    {
      title: 'Add Bills',
      description: 'Create and manage new billing entries',
      icon: '📝',
      path: '/bill/billAdd',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'View Bills',
      description: 'See and search through all billing records',
      icon: '📊',
      path: '/bill/viewBill',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Collection',
      description: 'Process bill payments and track collections',
      icon: '💰',
      path: '/collection',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Book Management',
      description: 'Maintain and organize book inventory',
      icon: '📚',
      path: '/book/addBooks',
      color: 'bg-amber-500 hover:bg-amber-600'
    }
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {/* <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
      </header> */}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-gray-700">Welcome Ruwan</h1>
          <p className="mt-2 text-gray-600">Select an option below to get started</p>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {navigationButtons.map((button, index) => (
            <div 
              key={index}
              onClick={() => handleNavigation(button.path)}
              className={`${button.color} text-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all duration-200 transform hover:scale-105`}
            >
              <div className="p-6">
                <div className="text-4xl mb-4">{button.icon}</div>
                <h3 className="text-xl font-bold mb-2">{button.title}</h3>
                <p className="text-white text-opacity-80">{button.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">Total Bills</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">Pending Payments</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">Books Available</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">Collections Today</p>
              <p className="text-2xl font-bold text-gray-900">₹0</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      {/* <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 md:flex md:items-center md:justify-between">
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-500">© 2025 Your Business Name. All rights reserved.</p>
          </div>
          <div className="mt-4 md:mt-0">
            <p className="text-sm text-gray-500">Version 1.0.0</p>
          </div>
        </div>
      </footer> */}
    </div>
  );
}
