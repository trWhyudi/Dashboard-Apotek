import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import { formatCurrency, formatDate } from '../../utils/helpers';
import moment from 'moment';
import { FaArrowLeft } from 'react-icons/fa';

const TransactionDetail = () => {
  const { id } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const response = await api.get(`/transaction/single-transaction/${id}`);
        setTransaction(response.data.transaction);
      } catch (err) {
        setError('Gagal memuat detail transaksi.');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full border-8 border-t-8 border-gray-300 h-16 w-16 border-t-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ml-64 pt-16 p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="ml-64 pt-16 p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Transaksi tidak ditemukan.
        </div>
      </div>
    );
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="ml-64 pt-16 p-6 mt-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-indigo-800">Detail Transaksi</h1>
        <Link
          to="/transactions"
          className="inline-flex items-center justify-center px-4 py-2 border border-indigo-300 rounded-md text-sm font-medium text-indigo-700 hover:bg-indigo-50 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Kembali
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* Informasi Umum */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              Informasi Transaksi
            </h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <strong>ID Transaksi:</strong> {transaction.transactionNumber}
              </li>
              <li>
                <strong>Tanggal:</strong>{" "}
                {moment(transaction.createdAt).format("DD MMM YYYY, HH:mm")}
              </li>
              <li>
                <strong>Kasir:</strong> {transaction.cashier?.name || "N/A"}
              </li>
              <li>
                <strong>Status:</strong>
                <span
                  className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                    transaction.status
                  )}`}
                >
                  {transaction.status}
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              Informasi Pembayaran
            </h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <strong>Total:</strong>{" "}
                {formatCurrency(transaction.totalAmount)}
              </li>
              <li>
                <strong>Dibayar:</strong>{" "}
                {formatCurrency(transaction.paymentAmount)}
              </li>
              <li>
                <strong>Kembalian:</strong>{" "}
                {formatCurrency(transaction.changeAmount)}
              </li>
            </ul>
          </div>
        </div>

        {/* Detail Barang */}
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Detail Barang
          </h2>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Nama Obat</th>
                  <th className="px-4 py-3">Harga</th>
                  <th className="px-4 py-3">Jumlah</th>
                  <th className="px-4 py-3">Subtotal</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {transaction.items.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {item.medicine?.name || "Deleted Item"}
                    </td>
                    <td className="px-4 py-3">{formatCurrency(item.price)}</td>
                    <td className="px-4 py-3">{item.quantity}</td>
                    <td className="px-4 py-3 font-medium">
                      {formatCurrency(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetail;
