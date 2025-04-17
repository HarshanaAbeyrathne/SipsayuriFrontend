'use client';
import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../components/axiosConfig'; // Update path as needed

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

interface TeacherInfo {
  _id: string;
  mobile: string;
  teacherName?: string; // This might come from additional API calls
}

interface Bill {
  _id: string;
  billNumber: string;
  date: string;
  teacher: TeacherInfo;
  bookEntries: BookEntry[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teacherDetails, setTeacherDetails] = useState<Record<string, any>>({});

  // Fetch all bills on component mount
  useEffect(() => {
    const fetchBills = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get<Bill[]>('/bills');
        setBills(response.data);
        setFilteredBills(response.data);
        
        // Extract unique teacher IDs to fetch teacher details
        const teacherIds = [...new Set(response.data.map((bill: Bill) => bill.teacher._id))];
        fetchTeacherDetails(teacherIds);
      } catch (error) {
        console.error('Error fetching bills:', error);
        setError('Failed to load bills. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, []);

  // Fetch teacher details for all bills
  const fetchTeacherDetails = async (teacherIds: string[]) => {
    try {
      const teacherData: Record<string, any> = {};
      
      // For each teacher ID, fetch details
      for (const id of teacherIds) {
        try {
          const response = await axiosInstance.get(`/teachers/${id}`);
          teacherData[id] = response.data;
        } catch (err) {
          console.error(`Error fetching teacher with ID ${id}:`, err);
          teacherData[id] = { teacherName: 'Unknown', schoolName: 'Unknown' };
        }
      }
      
      setTeacherDetails(teacherData);
    } catch (error) {
      console.error('Error fetching teacher details:', error);
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (query.trim() === '') {
      // If search is empty, show all bills
      setFilteredBills(bills);
    } else {
      // Filter bills based on search query
      const filtered = bills.filter((bill) => {
        // Check if bill number matches
        const billNumberMatch = bill.billNumber.toLowerCase().includes(query);
        
        // Check if teacher mobile matches
        const mobileMatch = bill.teacher.mobile.toLowerCase().includes(query);
        
        // Check if teacher name matches (if available)
        const teacherData = teacherDetails[bill.teacher._id];
        const teacherNameMatch = teacherData && 
          teacherData.teacherName && 
          teacherData.teacherName.toLowerCase().includes(query);
        
        // Return true if any of the conditions match
        return billNumberMatch || mobileMatch || teacherNameMatch;
      });
      
      setFilteredBills(filtered);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h1 className="text-2xl font-bold text-center mb-6">Bills</h1>
        
        {/* Search Section */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by bill number, teacher mobile, or teacher name..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
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
            {filteredBills.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-10 text-center">
                <p className="text-gray-500">No bills found matching your search criteria.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredBills.map((bill) => {
                  const teacherData = teacherDetails[bill.teacher._id] || { teacherName: 'Loading...', schoolName: 'Loading...' };
                  
                  return (
                    <div key={bill._id} className="bg-white rounded-lg shadow overflow-hidden">
                      {/* Bill Header */}
                      <div className="bg-blue-50 p-4 flex justify-between items-center">
                        <div>
                          <h2 className="text-lg font-semibold">{bill.billNumber}</h2>
                          <p className="text-sm text-gray-600">Date: {formatDate(bill.date)}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-lg">Rs. {bill.totalAmount}</span>
                          <p className="text-sm text-gray-600">Created: {new Date(bill.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      {/* Teacher Info */}
                      <div className="p-4 border-b">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Teacher Information</h3>
                        <div className="flex justify-between">
                          <p><span className="font-medium">Name:</span> {teacherData.teacherName}</p>
                          <p><span className="font-medium">Mobile:</span> {bill.teacher.mobile}</p>
                          <p><span className="font-medium">School:</span> {teacherData.schoolName}</p>
                        </div>
                      </div>
                      
                      {/* Book Entries */}
                      <div className="p-4">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Books</h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book Name</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Free</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {bill.bookEntries.map((entry) => (
                                <tr key={entry._id}>
                                  <td className="px-4 py-3 text-sm">{entry.bookName}</td>
                                  <td className="px-4 py-3 text-sm">Rs. {entry.price}</td>
                                  <td className="px-4 py-3 text-sm">{entry.quantity}</td>
                                  <td className="px-4 py-3 text-sm">{entry.freeIssue}</td>
                                  <td className="px-4 py-3 text-sm font-medium">Rs. {entry.total}</td>
                                </tr>
                              ))}
                              <tr className="bg-gray-50">
                                <td colSpan={4} className="px-4 py-3 text-sm font-medium text-right">Total:</td>
                                <td className="px-4 py-3 text-sm font-bold">Rs. {bill.totalAmount}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}