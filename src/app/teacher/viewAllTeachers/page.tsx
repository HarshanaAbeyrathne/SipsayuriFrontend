'use client';
import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../components/axiosConfig'; // Update the path if necessary

// Define TypeScript interface for Teacher
interface Teacher {
  _id: string;
  teacherName: string;
  mobile: string;
  schoolName: string;
  email?: string;
  subject?: string;
  // Add any other teacher properties here
}

function ViewAllTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState<Partial<Teacher>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await axiosInstance.get('/teachers');
        setTeachers(response.data);
      } catch (err: any) {
        console.error('Error fetching teachers:', err);
        setError('Failed to fetch teachers. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) return;

    try {
      await axiosInstance.delete(`/teachers/${id}`);
      setTeachers((prevTeachers) => prevTeachers.filter((teacher) => teacher._id !== id));
    } catch (err: any) {
      console.error('Error deleting teacher:', err);
      setError('Failed to delete teacher. Please try again later.');
    }
  };

  const handleEdit = (teacher: Teacher) => {
    setCurrentTeacher(teacher);
    setFormData({
      teacherName: teacher.teacherName,
      mobile: teacher.mobile,
      schoolName: teacher.schoolName,
      email: teacher.email || '',
      subject: teacher.subject || ''
    });
    setShowEditModal(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeacher) return;
    
    setIsSubmitting(true);
    try {
      const response = await axiosInstance.put(`/teachers/${currentTeacher._id}`, formData);
      
      // Update the teacher in the local state
      setTeachers(prevTeachers => 
        prevTeachers.map(teacher => 
          teacher._id === currentTeacher._id ? { ...teacher, ...formData } : teacher
        )
      );
      
      // Close the modal
      setShowEditModal(false);
      setCurrentTeacher(null);
    } catch (err: any) {
      console.error('Error updating teacher:', err);
      setError('Failed to update teacher. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600 flex justify-center items-center min-h-screen">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">All Teachers</h2>
        {teachers.length === 0 ? (
          <p className="text-gray-600">No teachers found.</p>
        ) : (
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Mobile</th>
                <th className="border border-gray-300 px-4 py-2 text-left">School</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-2">{teacher.teacherName}</td>
                  <td className="border border-gray-300 px-4 py-2">{teacher.mobile}</td>
                  <td className="border border-gray-300 px-4 py-2">{teacher.schoolName}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button
                      onClick={() => handleEdit(teacher)}
                      className="text-blue-600 hover:underline mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(teacher._id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Teacher Modal */}
      {showEditModal && currentTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Edit Teacher</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="teacherName">
                  Teacher Name
                </label>
                <input
                  id="teacherName"
                  name="teacherName"
                  type="text"
                  value={formData.teacherName || ''}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="mobile">
                  Mobile Number
                </label>
                <input
                  id="mobile"
                  name="mobile"
                  type="text"
                  value={formData.mobile || ''}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="schoolName">
                  School Name
                </label>
                <input
                  id="schoolName"
                  name="schoolName"
                  type="text"
                  value={formData.schoolName || ''}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewAllTeachersPage;