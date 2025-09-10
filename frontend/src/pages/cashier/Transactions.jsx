import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import TransactionTable from '../../components/transaction/TransactionTable';
import DateRangePicker from '../../components/ui/DateRangePicker';
import Pagination from '../../components/ui/Pagination';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { IoMdAddCircleOutline } from "react-icons/io";
import Swal from 'sweetalert2';

const CashierTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionsPerPage] = useState(5);
  const [stats, setStats] = useState({
    totalAmount: 0,
    count: 0
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        let response;
        
        if (dateRange.startDate && dateRange.endDate) {
          response = await api.get(`/transaction/transactions-by-date?startDate=${formatDate(dateRange.startDate)}&endDate=${formatDate(dateRange.endDate)}`);
          setStats({
            totalAmount: response.data.totalAmount,
            count: response.data.count
          });
        } else {
          response = await api.get('/transaction/all-transactions');
          setStats({
            totalAmount: response.data.transactions.reduce((sum, t) => sum + t.totalAmount, 0),
            count: response.data.transactions.length
          });
        }
        
        setTransactions(response.data.transactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [dateRange]);

  // Pagination logic
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(transactions.length / transactionsPerPage);

  const handleDateChange = (dates) => {
    setDateRange({
      startDate: dates.startDate,
      endDate: dates.endDate
    });
    setCurrentPage(1);
  };

  const handleCancel = async (id) => {
    const result = await Swal.fire({
      title: 'Batalkan Transaksi?',
      text: 'Apakah Anda yakin ingin membatalkan transaksi ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, batalkan',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await api.put(`/transaction/cancel-transaction/${id}`);
        setTransactions(transactions.map(t =>
          t._id === id ? { ...t, status: 'cancelled' } : t
        ));
        Swal.fire({
          title: 'Dibatalkan!',
          text: 'Transaksi berhasil dibatalkan.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Error cancelling transaction:', error);
        Swal.fire('Gagal', 'Terjadi kesalahan saat membatalkan transaksi.', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full border-8 border-t-8 border-gray-300 h-16 w-16 border-t-indigo-500"></div>
      </div>
    );
  }

  return (
    <main className="ml-64 pt-16 p-8 mt-8 bg-gray-50 min-h-screen">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-indigo-900">
          Data Transaksi
        </h1>
        <Link
          to="/transactions/create"
          className="inline-flex items-center px-5 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition"
        >
          <IoMdAddCircleOutline className="mr-2 text-xl" />
          Tambah Transaksi
        </Link>
      </header>

      <section className="mb-6 bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-semibold text-gray-800">
            Filter Transaksi
          </h2>
          <div className="text-sm text-gray-600">
            Menampilkan <span className="font-semibold">{stats.count}</span>{" "}
            transaksi (
            <span className="font-semibold">
              {formatCurrency(stats.totalAmount)}
            </span>
            )
          </div>
        </div>
        <DateRangePicker onChange={handleDateChange} value={dateRange} />
      </section>

      <section className="bg-white p-6 rounded-xl shadow-md">
        <TransactionTable
          transactions={currentTransactions}
          onCancel={handleCancel}
        />
        {transactions.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </section>
    </main>
  );
};

export default CashierTransactions;