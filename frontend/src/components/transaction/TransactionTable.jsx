import { Link } from "react-router-dom";
import moment from "moment";
import { formatCurrency } from "../../utils/helpers";
import { FaEye, FaTimesCircle } from "react-icons/fa";

const TransactionTable = ({ transactions, onCancel }) => {
  const getStatusBadge = (status) => {
    const statusClasses = {
      completed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      cancelled: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[status]}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID Transaksi
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tanggal
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Kasir
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Barang
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <tr key={transaction._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {transaction.transactionNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {moment(transaction.createdAt).format("DD MMM YYYY HH:mm")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.cashier?.name || "N/A"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="flex flex-col">
                    {transaction.items.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span>
                          {item.medicine?.name || "Deleted Item"} ×{" "}
                          {item.quantity}
                        </span>
                        <span className="font-medium">
                          {formatCurrency(item.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatCurrency(transaction.totalAmount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(transaction.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-3">
                    <Link
                      to={`/transactions/${transaction._id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Lihat Detail"
                    >
                      <FaEye />
                    </Link>
                    {transaction.status === "completed" && (
                      <button
                        onClick={() => onCancel(transaction._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Batalkan Transaksi"
                      >
                        <FaTimesCircle />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="7"
                className="px-6 py-4 text-center text-sm text-gray-500"
              >
                Tidak ada transaksi ditemukan.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
