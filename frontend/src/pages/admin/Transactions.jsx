import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import TransactionTable from '../../components/transaction/TransactionTable';
import DateRangePicker from '../../components/ui/DateRangePicker';
import Pagination from '../../components/ui/Pagination';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { IoMdAddCircleOutline } from "react-icons/io";

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionsPerPage] = useState(10);
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
    if (window.confirm('Are you sure you want to cancel this transaction?')) {
      try {
        await api.put(`/transaction/cancel-transaction/${id}`);
        setTransactions(transactions.map(t => 
          t._id === id ? { ...t, status: 'cancelled' } : t
        ));
      } catch (error) {
        console.error('Error cancelling transaction:', error);
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="ml-64 pt-16 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Transaction Management</h1>
        <Link
          to="/admin/transactions/create"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
        >
          <span className="material-icons-outlined mr-1"><IoMdAddCircleOutline /></span>
          New Transaction
        </Link>
      </div>

      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Filter Transactions</h2>
          <div className="text-sm text-gray-600">
            Showing {stats.count} transactions ({formatCurrency(stats.totalAmount)})
          </div>
        </div>
        <DateRangePicker onChange={handleDateChange} />
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
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
      </div>
    </div>
  );
};

export default AdminTransactions;