'use client';
import axiosInstance from '../../../components/axiosConfig'; // Update the path if necessary


import React, { useEffect, useState } from 'react';

// Interfaces
interface BookEntry {
  id: number;
  bookName: string;
  price: number;
  quantity: number;
  freeIssue: number;
  total: number;
}

interface Teacher {
  id: number;
  teacherName: string;
  mobile: string;
  schoolName: string;
}

// Mock teacher data (replace with API call in production)
// const teacherData: Teacher[] = [
//   { id: 1, name: 'Mrs. Smith', mobile: '9876543210', school: 'Central High School' },
//   { id: 2, name: 'Mr. Johnson', mobile: '8765432109', school: 'Westside Elementary' },
//   { id: 3, name: 'Ms. Williams', mobile: '7654321098', school: 'Eastview Academy' }
// ];

export default function AddBillPage() {
  const [billNumber, setBillNumber] = useState('');
  const [billNumberError, setBillNumberError] = useState('');
  const [date, setDate] = useState('');
  const [mobile, setMobile] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [bookEntries, setBookEntries] = useState<BookEntry[]>([
    { id: 1, bookName: '', price: 100, quantity: 25, freeIssue: 1, total: 2500 },
  ]);
  const [nextId, setNextId] = useState(2);
  const [teacherData, setTeacherData] = useState<Teacher[]>([]);
  
  // Show summary state
  const [showSummary, setShowSummary] = useState(false);
  const [teacherInfo, setTeacherInfo] = useState<Teacher | null>(null);
  
  //fetch teacher data from API
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await axiosInstance.get('/teachers');
        setTeacherData(response.data);
      } catch (error) {
        console.error('Error fetching teachers:', error);
      }
    };
    fetchTeachers();
  }, []);
  // Calculate total amount
  const totalAmount = bookEntries.reduce((sum, entry) => sum + entry.total, 0);

  // Validate bill number (numbers only)
  const validateBillNumber = (value: string) => {
    if (!/^\d*$/.test(value)) {
      setBillNumberError('Bill number must contain only digits');
      return false;
    } else {
      setBillNumberError('');
      return true;
    }
  };
  // console.log('teacherData', teacherData);
  // Validate mobile number (10 digits)
  const validateMobile = (value: string) => {
    if (!/^\d{10}$/.test(value)) {
      setMobileError('Mobile number must be exactly 10 digits');
      return false;
    } else {
      setMobileError('');
      return true;
    }
  };

  // Fetch teacher info based on mobile number
  const fetchTeacherInfo = (mobileNumber: string) => {
    // In a real application, replace this with an API call
    const teacher = teacherData.find(t => t.mobile === mobileNumber);
    return teacher || null;
  };

  // Handle bill number change
  const handleBillNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBillNumber(value);
    validateBillNumber(value);
  };

  // Handle mobile number change
  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMobile(value);
    validateMobile(value);
    
    // When mobile number is valid, try to fetch teacher info
    if (value.length === 10) {
      const teacher = fetchTeacherInfo(value);
      setTeacherInfo(teacher);
    } else {
      setTeacherInfo(null);
    }
  };

  // Add new book entry
  const addBookEntry = () => {
    const newEntry: BookEntry = {
      id: nextId,
      bookName: '',
      price: 0,
      quantity: 0,
      freeIssue: 0,
      total: 0
    };
    setBookEntries([...bookEntries, newEntry]);
    setNextId(nextId + 1);
  };

  // Update book entry
  const updateBookEntry = (id: number, field: keyof BookEntry, value: string | number) => {
    const updatedEntries = bookEntries.map(entry => {
      if (entry.id === id) {
        const updatedEntry = { ...entry, [field]: value };
        
        // Auto-calculate total when quantity or price changes
        if (field === 'quantity' || field === 'price') {
          updatedEntry.total = updatedEntry.quantity * updatedEntry.price;
        }
        
        return updatedEntry;
      }
      return entry;
    });
    
    setBookEntries(updatedEntries);
  };

  // Delete book entry
  const deleteBookEntry = (id: number) => {
    // Don't delete if it's the only entry
    if (bookEntries.length === 1) {
      alert('Cannot delete the only book entry. At least one book is required.');
      return;
    }
    
    const updatedEntries = bookEntries.filter(entry => entry.id !== id);
    setBookEntries(updatedEntries);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const isValidBillNumber = validateBillNumber(billNumber);
    const isValidMobile = validateMobile(mobile);
    
    // Check if there are any empty book entries
    const hasEmptyBookEntries = bookEntries.some(entry => 
      !entry.bookName || entry.price <= 0 || entry.quantity <= 0
    );
    
    if (isValidBillNumber && isValidMobile && !hasEmptyBookEntries) {
      // Show summary instead of submitting immediately
      setShowSummary(true);
    } else {
      if (hasEmptyBookEntries) {
        alert('Please fill in all book details before submitting.');
      } else {
        alert('Please fix the errors before submitting.');
      }
    }
  };

  // Handle final confirmation
  const handleConfirmSubmit = () => {
    // Here, you would send the data to your backend
    console.log({
      billNumber,
      date,
      mobile,
      teacherInfo,
      bookEntries,
      totalAmount
    });
    
    // Reset form after successful submission
    alert('Bill submitted successfully!');
    setShowSummary(false);
    setBillNumber('');
    setDate('');
    setMobile('');
    setBookEntries([{ id: 1, bookName: '', price: 0, quantity: 0, freeIssue: 0, total: 0 }]);
    setNextId(2);
    setTeacherInfo(null);
  };

  // Handle back to edit
  const handleBackToEdit = () => {
    setShowSummary(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <h1 className="text-2xl font-bold text-center mb-6">Add bill</h1>
        
        {/* Summary View */}
        {showSummary ? (
          <div className="bg-blue-50 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Bill Summary</h2>
            
            {/* Bill Details */}
            <div className="bg-white rounded-lg p-4 mb-4">
              <h3 className="font-medium mb-2">Bill Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">Bill Number</p>
                  <p className="font-medium">{billNumber}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Date</p>
                  <p className="font-medium">{date}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Mobile</p>
                  <p className="font-medium">{mobile}</p>
                </div>
              </div>
            </div>
            
            {/* Teacher Details */}
            <div className="bg-white rounded-lg p-4 mb-4">
              <h3 className="font-medium mb-2">Teacher Information</h3>
              {teacherInfo ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm">Name</p>
                    <p className="font-medium">{teacherInfo.teacherName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">School</p>
                    <p className="font-medium">{teacherInfo.schoolName}</p>
                  </div>
                </div>
              ) : (
                <p className="text-red-500">No teacher found with this mobile number!</p>
              )}
            </div>
            
            {/* Books Details */}
            <div className="bg-white rounded-lg p-4 mb-6">
              <h3 className="font-medium mb-2">Books</h3>
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-600 text-sm">
                    <th className="py-2 px-3">Book name</th>
                    <th className="py-2 px-3">Price</th>
                    <th className="py-2 px-3">Quantity</th>
                    <th className="py-2 px-3">Free Issue</th>
                    <th className="py-2 px-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {bookEntries.map((entry) => (
                    <tr key={entry.id} className="border-t border-gray-100">
                      <td className="py-2 px-3">{entry.bookName}</td>
                      <td className="py-2 px-3">{entry.price}</td>
                      <td className="py-2 px-3">{entry.quantity}</td>
                      <td className="py-2 px-3">{entry.freeIssue}</td>
                      <td className="py-2 px-3 font-medium">{entry.total}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-gray-300">
                    <td colSpan={4} className="py-2 px-3 text-right font-medium">Total:</td>
                    <td className="py-2 px-3 font-bold">{totalAmount}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-between">
              <button
                type="button"
                onClick={handleBackToEdit}
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-full shadow-sm hover:bg-gray-300"
              >
                Back to Edit
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                className="bg-green-100 text-green-600 px-6 py-2 rounded-full shadow-sm hover:bg-green-200"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        ) : (
          /* Main Form Card */
          <div className="bg-blue-50 rounded-lg shadow p-6">
            <form onSubmit={handleSubmit}>
              {/* Bill Details Section */}
              <div className="col-span-2">
                  <label htmlFor="mobile" className="block text-sm font-medium mb-1">Mobile</label>
                  <input
                    type="text"
                    id="mobile"
                    value={mobile}
                    onChange={handleMobileChange}
                    className={`w-full p-2 border ${mobileError ? 'border-red-500' : 'border-gray-300'} rounded`}
                    required
                    maxLength={10}
                  />
                  {mobileError && (
                    <p className="mt-1 text-xs text-red-600">{mobileError}</p>
                  )}
                  {teacherInfo && (
                    <p className="mt-1 text-xs text-green-600">
                      Teacher Found: {teacherInfo.teacherName} - {teacherInfo.schoolName}
                    </p>
                  )}
                </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="billNumber" className="block text-sm font-medium mb-1">Bill number</label>
                  <input
                    type="text"
                    id="billNumber"
                    value={billNumber}
                    onChange={handleBillNumberChange}
                    className={`w-full p-2 border ${billNumberError ? 'border-red-500' : 'border-gray-300'} rounded`}
                    required
                  />
                  {billNumberError && (
                    <p className="mt-1 text-xs text-red-600">{billNumberError}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <div className="flex-grow">
                    <label htmlFor="date" className="block text-sm font-medium mb-1">date</label>
                    <input
                      type="date"
                      id="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    />
                  </div>
                  <div className="mt-6">
                    <button type="button" className="p-2 border border-gray-300 bg-white rounded-md">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
              </div>
              
              {/* Books Table Section */}
              <div className="bg-white rounded-lg p-4 mb-6">
                <table className="w-full">
                  <thead>
                    <tr className="text-left">
                      <th className="py-2 px-3">Book name</th>
                      <th className="py-2 px-3">Price</th>
                      <th className="py-2 px-3">quantity</th>
                      <th className="py-2 px-3">free issue</th>
                      <th className="py-2 px-3">total</th>
                      <th className="py-2 px-3 w-12">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookEntries.map((entry) => (
                      <tr key={entry.id} className="border-t border-gray-100">
                        <td className="py-2 px-3">
                          <select
                            value={entry.bookName}
                            onChange={(e) => updateBookEntry(entry.id, 'bookName', e.target.value)}
                            className="w-full p-1 bg-pink-50 rounded"
                            required
                          >
                            <option value="">Select a book</option>
                            <option value="Book 1">Book 1</option>
                            <option value="Book 2">Book 2</option>
                            <option value="Book 3">Book 3</option>
                            <option value="Book 4">Book 4</option>
                          </select>
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            value={entry.price}
                            onChange={(e) => updateBookEntry(entry.id, 'price', parseFloat(e.target.value) || 0)}
                            className="w-full p-1 rounded"
                            required
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            value={entry.quantity}
                            onChange={(e) => updateBookEntry(entry.id, 'quantity', parseInt(e.target.value) || 0)}
                            className="w-full p-1 rounded"
                            required
                            min="0"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            value={entry.freeIssue}
                            onChange={(e) => updateBookEntry(entry.id, 'freeIssue', parseInt(e.target.value) || 0)}
                            className="w-full p-1 bg-pink-50 rounded"
                            min="0"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <span className="font-medium">{entry.total}</span>
                        </td>
                        <td className="py-2 px-3">
                          <button
                            type="button"
                            onClick={() => deleteBookEntry(entry.id)}
                            className="text-red-500 hover:text-red-700"
                            title="Delete entry"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {/* Add Book Button */}
                <div className="flex justify-end mt-4">
                  <button
                    type="button"
                    onClick={addBookEntry}
                    className="flex items-center justify-center bg-blue-100 text-blue-600 px-4 py-1 rounded-full shadow-sm hover:bg-blue-200 text-sm"
                  >
                    <span className="mr-1">+</span> add
                  </button>
                </div>
              </div>
              
              {/* Total and Submit Section */}
              <div className="flex justify-between items-center">
                <div className="font-medium">total: {totalAmount}</div>
                <button
                  type="submit"
                  className="bg-blue-100 text-blue-600 px-6 py-2 rounded-full shadow-sm hover:bg-blue-200"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}