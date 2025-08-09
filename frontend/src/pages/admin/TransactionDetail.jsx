import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import { formatCurrency, formatDate } from '../../utils/helpers';
import moment from 'moment';

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
        setError('Failed to load transaction details');
        console.error('Error fetching transaction:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return (
      <div className="ml-64 pt-16 p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="ml-64 pt-16 p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
          Transaction not found
        </div>
      </div>
    );
  }

  return (
    <div className="ml-64 pt-16 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Transaction Details</h1>
        <Link
          to="/admin/transactions"
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back to Transactions
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Transaction Information</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Transaction #:</span> {transaction.transactionNumber}</p>
              <p><span className="font-medium">Date:</span> {moment(transaction.createdAt).format('DD MMM YYYY HH:mm')}</p>
              <p><span className="font-medium">Cashier:</span> {transaction.cashier?.name || 'N/A'}</p>
              <p><span className="font-medium">Status:</span> 
                <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                  transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {transaction.status}
                </span>
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Information</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Total Amount:</span> {formatCurrency(transaction.totalAmount)}</p>
              <p><span className="font-medium">Payment Amount:</span> {formatCurrency(transaction.paymentAmount)}</p>
              <p><span className="font-medium">Change:</span> {formatCurrency(transaction.changeAmount)}</p>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-medium text-gray-900 mb-4">Items Purchased</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medicine
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transaction.items.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.medicine?.name || 'Deleted Item'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(item.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetail;