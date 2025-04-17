'use client';

import React, { useState } from 'react';
import axiosInstance from '../../../components/axiosConfig'; // Update the path to match your project structure

function AddBookPage() {
  const [formData, setFormData] = useState({
    name: '',
    defaultPrice: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await axiosInstance.post('/books', {
        name: formData.name,
        defaultPrice: parseFloat(formData.defaultPrice)
      });
      console.log('Book added successfully:', response.data);

      // Reset form after successful submission
      setFormData({
        name: '',
        defaultPrice: ''
      });

      setSuccess(true);
    } catch (error: any) {
      console.error('Error adding book:', error);

      // Check for specific error response from the backend
      if (error.response && error.response.data.message) {
        setError(error.response.data.message); // Display the error message from the backend
      } else {
        setError('Failed to add book. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Add New Book</h2>
          <p className="mt-2 text-sm text-gray-600">Enter the book's information below</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-md">
            Book added successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Book Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter book name"
            />
          </div>

          <div>
            <label htmlFor="defaultPrice" className="block text-sm font-medium text-gray-700">
              Default Price
            </label>
            <input
              type="number"
              name="defaultPrice"
              id="defaultPrice"
              value={formData.defaultPrice}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter default price"
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Adding...' : 'Add Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddBookPage;