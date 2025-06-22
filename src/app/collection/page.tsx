'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axiosInstance from '../../components/axiosConfig';

interface Bill {
  _id: string;
  billNumber: string;
  date: string;
  totalAmount: number;
  remainPayment: number;
  status: string;
  teacher: {
    _id: string;
    teacherName: string;
    mobile: string;
    schoolName: string;
  };
}

interface Payment {
  _id: string;
  amount: number;
  paymentDate: string;
  collectBy: string;
  bill: {
    billNumber: string;
    totalAmount: number;
    remainPayment: number;
    status: string;
  };
}

export default function PaymentManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchBillNumber, setSearchBillNumber] = useState('');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [newPayment, setNewPayment] = useState({
    amount: '',
    collectBy: '',
    paymentDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle bill number from URL query parameter
  useEffect(() => {
    const billNumber = searchParams.get('billNumber');
    if (billNumber) {
      setSearchBillNumber(billNumber);
      // Auto-search when bill number is provided
      setTimeout(() => {
        handleAutoSearch(billNumber);
      }, 100);
    }
  }, [searchParams]);

  // Auto search function for query parameter
  const handleAutoSearch = async (billNumber: string) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axiosInstance.get('/bills');
      const bill = response.data.find((b: Bill) => 
        b.billNumber.toLowerCase() === billNumber.toLowerCase()
      );
      
      if (bill) {
        setSelectedBill(bill);
        await loadPayments(bill._id);
      } else {
        setError('Bill not found');
        setSelectedBill(null);
        setPayments([]);
      }
    } catch (error) {
      setError('Error searching for bill');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Search bill by bill number
  const searchBill = async () => {
    if (!searchBillNumber.trim()) {
      setError('Please enter a bill number');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await axiosInstance.get('/bills');
      const bill = response.data.find((b: Bill) => 
        b.billNumber.toLowerCase() === searchBillNumber.toLowerCase()
      );
      
      if (bill) {
        setSelectedBill(bill);
        await loadPayments(bill._id);
      } else {
        setError('Bill not found');
        setSelectedBill(null);
        setPayments([]);
      }
    } catch (error) {
      setError('Error searching for bill');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load payments for selected bill
  const loadPayments = async (billId: string) => {
    try {
      const response = await axiosInstance.get(`/payments/bill/${billId}`);
      setPayments(response.data);
    } catch (error) {
      console.error('Error loading payments:', error);
    }
  };

  // Add new payment
  const addPayment = async () => {
    if (!selectedBill) {
      setError('Please select a bill first');
      return;
    }

    if (!newPayment.amount || parseFloat(newPayment.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (parseFloat(newPayment.amount) > selectedBill.remainPayment) {
      setError('Payment amount cannot exceed remaining payment');
      return;
    }

    if (!newPayment.paymentDate) {
      setError('Please select a payment date');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const paymentData = {
        billId: selectedBill._id,
        amount: parseFloat(newPayment.amount),
        collectBy: newPayment.collectBy,
        paymentDate: newPayment.paymentDate
      };

      await axiosInstance.post('/payments', paymentData);
      
      setSuccess('Payment added successfully');
      setNewPayment({ 
        amount: '', 
        collectBy: '',
        paymentDate: new Date().toISOString().split('T')[0]
      });
      
      // Refresh bill data and payments
      await searchBill();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error adding payment');
    } finally {
      setLoading(false);
    }
  };

  // Delete payment
  const deletePayment = async (paymentId: string) => {
    if (!confirm('Are you sure you want to delete this payment?')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axiosInstance.delete(`/payments/${paymentId}`);
      setSuccess('Payment deleted successfully');
      
      // Refresh bill data and payments
      await searchBill();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error deleting payment');
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key in search
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchBill();
    }
  };

  // Handle Enter key in payment form
  const handlePaymentKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addPayment();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h1 className="text-2xl font-bold text-center mb-6">Payment Management</h1>
        
        {/* Search Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-medium mb-4">Search Bill</h2>
          <div className="flex gap-4">
            <input
              type="text"
              value={searchBillNumber}
              onChange={(e) => setSearchBillNumber(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              placeholder="Enter bill number"
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={searchBill}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        {/* Bill Details */}
        {selectedBill && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">Bill Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Bill Number</p>
                <p className="font-medium">{selectedBill.billNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{new Date(selectedBill.date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Teacher</p>
                <p className="font-medium">{selectedBill.teacher.teacherName}</p>
                <p className="text-xs text-gray-400">{selectedBill.teacher.schoolName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                  selectedBill.status === 'Paid' 
                    ? 'bg-green-100 text-green-600'
                    : selectedBill.status === 'Pending' 
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {selectedBill.status}
                </span>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-xl font-bold text-blue-600">Rs.{selectedBill.totalAmount}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Remaining Payment</p>
                <p className="text-xl font-bold text-orange-600">Rs.{selectedBill.remainPayment}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Paid Amount</p>
                <p className="text-xl font-bold text-green-600">Rs.{selectedBill.totalAmount - selectedBill.remainPayment}</p>
              </div>
            </div>
          </div>
        )}

        {/* Add Payment Form */}
        {selectedBill && selectedBill.remainPayment > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">Add Payment</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Amount (Max: Rs.{selectedBill.remainPayment})
                </label>
                <input
                  type="number"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment(prev => ({ ...prev, amount: e.target.value }))}
                  onKeyPress={handlePaymentKeyPress}
                  placeholder="Enter amount"
                  max={selectedBill.remainPayment}
                  min="0.01"
                  step="0.01"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Date
                </label>
                <input
                  type="date"
                  value={newPayment.paymentDate}
                  onChange={(e) => setNewPayment(prev => ({ ...prev, paymentDate: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Collected By
                </label>
                <input
                  type="text"
                  value={newPayment.collectBy}
                  onChange={(e) => setNewPayment(prev => ({ ...prev, collectBy: e.target.value }))}
                  onKeyPress={handlePaymentKeyPress}
                  placeholder="Enter collector name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={addPayment}
                  disabled={loading}
                  className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Payment'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payments List */}
        {selectedBill && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium mb-4">Payment History</h2>
            {payments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No payments found for this bill</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Collected By</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          {new Date(payment.paymentDate).toLocaleDateString()}
                          <br />
                          <span className="text-xs text-gray-500">
                            {new Date(payment.paymentDate).toLocaleTimeString()}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-green-600">Rs.{payment.amount}</span>
                        </td>
                        <td className="py-3 px-4">
                          {payment.collectBy || '-'}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => deletePayment(payment._id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
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
        )}
      </div>
    </div>
  );
}