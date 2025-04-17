'use client';
import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDropdownOpen2, setIsDropdownOpen2] = useState(false);

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
        සිප්සයුරි
        </Link>
        <img src="/logo.png" alt="Logo" className="h-8 w-8" />
        <ul className="flex space-x-6">
          <li>
            <Link href="/" className="hover:underline">
              Home
            </Link>
          </li>
          <li className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="hover:underline focus:outline-none"
            >
              Teacher
            </button>
            {isDropdownOpen && (
              <ul className="absolute bg-gray-700 text-white mt-2 rounded shadow-lg">
                <li className="px-4 py-2 hover:bg-gray-600">
                  <Link href="/teacher/addTeacher" className="block">
                    Add Teacher
                  </Link>
                </li>
                <li className="px-4 py-2 hover:bg-gray-600">
                  <Link href="/teacher/viewAllTeachers" className="block">
                    Display Teachers
                  </Link>
                </li>
              </ul>
            )}
          </li>

          <li className="relative">
            <button
              onClick={() => setIsDropdownOpen2(!isDropdownOpen2)}
              className="hover:underline focus:outline-none"
            >
              Book
            </button>
            {isDropdownOpen2 && (
              <ul className="absolute bg-gray-700 text-white mt-2 rounded shadow-lg">
                <li className="px-4 py-2 hover:bg-gray-600">
                  <Link href="/book/addBooks" className="block">
                    Add Book
                  </Link>
                </li>
                <li className="px-4 py-2 hover:bg-gray-600">
                  <Link href="/book/viewBooks" className="block">
                    edit book details
                  </Link>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;