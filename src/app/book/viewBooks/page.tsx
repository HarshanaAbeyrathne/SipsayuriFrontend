'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axiosInstance from '../../../components/axiosConfig'; // Update path as needed

interface Book {
  _id: string;
  name: string;
  defaultPrice: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

function BooksManagementPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    defaultPrice: ''
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('/books?active=true');
      setBooks(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching books:', err);
      setError('Failed to load books. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBook = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await axiosInstance.delete(`/books/${id}`);
        setActionSuccess(`"${name}" has been successfully deleted.`);
        // Refresh the book list
        fetchBooks();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setActionSuccess(null);
        }, 3000);
      } catch (err) {
        console.error('Error deleting book:', err);
        setError('Failed to delete book. Please try again.');
        
        // Clear error message after 3 seconds
        setTimeout(() => {
          setError(null);
        }, 3000);
      }
    }
  };

  const openEditModal = (book: Book) => {
    setEditingBook(book);
    setFormData({
      name: book.name,
      defaultPrice: book.defaultPrice.toString()
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBook(null);
    setError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook) return;
    
    setIsSaving(true);
    setError(null);
  
    try {
      // Convert price to number for API
      const dataToSubmit = {
        name: formData.name,
        defaultPrice: parseFloat(formData.defaultPrice)
      };

      await axiosInstance.put(`/books/${editingBook._id}`, dataToSubmit);
      
      // Close modal and show success message
      closeModal();
      setActionSuccess(`"${formData.name}" has been successfully updated.`);
      
      // Refresh the book list
      fetchBooks();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setActionSuccess(null);
      }, 3000);
      
    } catch (error: any) {
      console.error('Error updating book:', error);
      
      if (error.response && error.response.status === 400 && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to update book. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-medium text-gray-700">Loading books...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Books Management</h1>
          <Link 
            href="/book/addBooks" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add New Book
          </Link>
        </div>

        {error && !isModalOpen && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
            {error}
          </div>
        )}

        {actionSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-md">
            {actionSuccess}
          </div>
        )}

        {books.length === 0 ? (
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <p className="text-gray-500">No books found. Add a new book to get started.</p>
          </div>
        ) : (
          <div className="overflow-hidden bg-white shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Book Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Default Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Added Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {books.map((book) => (
                  <tr key={book._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{book.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Rs. {book.defaultPrice}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(book.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(book)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBook(book._id, book.name)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Edit Book</h3>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmitEdit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Book Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="defaultPrice" className="block text-sm font-medium text-gray-700 mb-1">
                  Default Price (Rs)
                </label>
                <input
                  type="number"
                  name="defaultPrice"
                  id="defaultPrice"
                  value={formData.defaultPrice}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default BooksManagementPage;