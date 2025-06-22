'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '../../../components/axiosConfig';

// Interfaces
interface BookEntry {
  _id: string;
  book: string;
  bookName: string;
  price: number;
  quantity: number;
  freeIssue: number;
  total: number;
}

interface Teacher {
  _id: string;
  teacherName: string;
  mobile: string;
  schoolName: string;
}

interface Bill {
  _id: string;
  billNumber: string;
  date: string;
  teacher: Teacher;
  bookEntries: BookEntry[];
  totalAmount: number;
  remainPayment: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function BillsPage() {
  const router = useRouter();
  const [bills, setBills] = useState<Bill[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch all bills on component mount
  useEffect(() => {
    const fetchBills = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get<Bill[]>('/bills');
        setBills(response.data);
      } catch (error) {
        console.error('Error fetching bills:', error);
        setError('Failed to load bills. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, []);

  // Get unique school names for filter dropdown
  const uniqueSchools = useMemo(() => {
    const schools = bills.map(bill => bill.teacher.schoolName);
    return [...new Set(schools)].sort();
  }, [bills]);

  // Get unique statuses for filter dropdown
  const uniqueStatuses = useMemo(() => {
    const statuses = bills.map(bill => bill.status);
    return [...new Set(statuses)].sort();
  }, [bills]);

  // Filter and search bills
  const filteredBills = useMemo(() => {
    let filtered = bills;

    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((bill) => {
        const billNumberMatch = bill.billNumber.toLowerCase().includes(query);
        const mobileMatch = bill.teacher.mobile.toLowerCase().includes(query);
        const teacherNameMatch = bill.teacher.teacherName.toLowerCase().includes(query);
        const schoolNameMatch = bill.teacher.schoolName.toLowerCase().includes(query);
        
        return billNumberMatch || mobileMatch || teacherNameMatch || schoolNameMatch;
      });
    }

    // Apply school filter
    if (selectedSchool !== '') {
      filtered = filtered.filter(bill => bill.teacher.schoolName === selectedSchool);
    }

    // Apply status filter
    if (selectedStatus !== '') {
      filtered = filtered.filter(bill => bill.status === selectedStatus);
    }

    return filtered;
  }, [bills, searchQuery, selectedSchool, selectedStatus]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredBills.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBills = filteredBills.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSchool, selectedStatus, itemsPerPage]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle school filter change
  const handleSchoolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSchool(e.target.value);
  };

  // Handle status filter change
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSchool('');
    setSelectedStatus('');
    setCurrentPage(1);
  };

  // Handle add payment navigation
  const handleAddPayment = (billNumber: string) => {
    router.push(`/collection?billNumber=${encodeURIComponent(billNumber)}`);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Bills Management</h1>
          <div className="text-sm text-gray-600">
            Total: {bills.length} | Filtered: {filteredBills.length} | Page: {currentPage} of {totalPages}
          </div>
        </div>
        
        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search Input */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by bill number, teacher name, mobile..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* School Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
              <select
                value={selectedSchool}
                onChange={handleSchoolChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Schools</option>
                {uniqueSchools.map((school) => (
                  <option key={school} value={school}>
                    {school}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={selectedStatus}
                onChange={handleStatusChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                {uniqueStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex justify-between items-center">
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Clear All Filters
            </button>
            
            {/* Items Per Page */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Show:</span>
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-700">per page</span>
            </div>
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {/* Loading State */}
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Loading bills...</p>
          </div>
        ) : (
          <>
            {/* Bills List */}
            {currentBills.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-10 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500">No bills found matching your criteria.</p>
                {(searchQuery || selectedSchool || selectedStatus) && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear filters to see all bills
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  {currentBills.map((bill) => (
                    <div key={bill._id} className="bg-white rounded-lg shadow overflow-hidden">
                      {/* Bill Header */}
                      <div className="bg-blue-50 p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h2 className="text-lg font-semibold text-blue-900">{bill.billNumber}</h2>
                            <p className="text-sm text-gray-600">Date: {formatDate(bill.date)}</p>
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${getStatusColor(bill.status)}`}>
                              {bill.status}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Total Amount</p>
                              <span className="font-bold text-xl text-blue-600">Rs.{bill.totalAmount.toLocaleString()}</span>
                            </div>
                            {bill.remainPayment > 0 && (
                              <div className="text-right mt-2">
                                <p className="text-sm text-gray-600">Remaining</p>
                                <span className="font-medium text-orange-600">Rs.{bill.remainPayment.toLocaleString()}</span>
                              </div>
                            )}
                            {/* Add Payment Button */}
                            {bill.remainPayment > 0 && (
                              <div className="mt-3">
                                <button
                                  onClick={() => handleAddPayment(bill.billNumber)}
                                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                                >
                                  Add Payment
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Teacher Info */}
                      <div className="p-4 border-b bg-gray-50">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Teacher Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Name</p>
                            <p className="font-medium">{bill.teacher.teacherName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Mobile</p>
                            <p className="font-medium">{bill.teacher.mobile}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">School</p>
                            <p className="font-medium">{bill.teacher.schoolName}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Book Entries */}
                      <div className="p-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Book Details</h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Free</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {bill.bookEntries.map((entry) => (
                                <tr key={entry._id} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{entry.bookName}</td>
                                  <td className="px-4 py-3 text-sm text-gray-600">Rs.{entry.price}</td>
                                  <td className="px-4 py-3 text-sm text-gray-600">{entry.quantity}</td>
                                  <td className="px-4 py-3 text-sm text-gray-600">{entry.freeIssue}</td>
                                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Rs.{entry.total.toLocaleString()}</td>
                                </tr>
                              ))}
                              <tr className="bg-blue-50 font-semibold">
                                <td colSpan={4} className="px-4 py-3 text-sm text-right text-blue-900">Grand Total:</td>
                                <td className="px-4 py-3 text-sm font-bold text-blue-900">Rs.{bill.totalAmount.toLocaleString()}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Payment Summary */}
                      {bill.remainPayment < bill.totalAmount && (
                        <div className="p-4 bg-green-50 border-t">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-green-700">Payment Progress</span>
                            <span className="text-green-700">
                              Rs.{(bill.totalAmount - bill.remainPayment).toLocaleString()} / Rs.{bill.totalAmount.toLocaleString()}
                            </span>
                          </div>
                          <div className="mt-2 bg-green-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${((bill.totalAmount - bill.remainPayment) / bill.totalAmount) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Timestamps */}
                      <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500 flex justify-between">
                        <span>Created: {new Date(bill.createdAt).toLocaleString()}</span>
                        <span>Updated: {new Date(bill.updatedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="bg-white rounded-lg shadow p-4 mt-6">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Showing {startIndex + 1} to {Math.min(endIndex, filteredBills.length)} of {filteredBills.length} results
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {/* Previous Button */}
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        
                        {/* Page Numbers */}
                        {getPageNumbers().map((pageNumber) => (
                          <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`px-3 py-2 text-sm font-medium rounded-md ${
                              currentPage === pageNumber
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        ))}
                        
                        {/* Next Button */}
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}