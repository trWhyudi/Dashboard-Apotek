import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-9xl font-extrabold text-gray-300">404</h1>
      <p className="text-2xl font-semibold text-gray-700 mt-4">Halaman tidak ditemukan</p>
      <p className="text-gray-500 mt-2 mb-6">Maaf, halaman yang kamu cari tidak tersedia.</p>
      <Link
        to="/"
        className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
};

export default NotFound;
