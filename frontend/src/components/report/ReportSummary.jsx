import { formatCurrency } from '../../utils/helpers';

const ReportSummary = ({ summary }) => {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Ringkasan Penjualan</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="border p-4 rounded-lg bg-blue-50">
          <h3 className="text-sm font-medium text-blue-800">Total Penjualan</h3>
          <p className="mt-1 text-2xl font-bold text-blue-900">
            {formatCurrency(summary.totalSales)}
          </p>
        </div>
        <div className="border p-4 rounded-lg bg-purple-50">
          <h3 className="text-sm font-medium text-purple-800">Total Transaksi</h3>
          <p className="mt-1 text-2xl font-bold text-purple-900">
            {summary.totalTransactions.toLocaleString()}
          </p>
        </div>
        <div className="border p-4 rounded-lg bg-green-50">
          <h3 className="text-sm font-medium text-green-800">Rata-rata Transaksi</h3>
          <p className="mt-1 text-2xl font-bold text-green-900">
            {formatCurrency(summary.averageTransactionValue)}
          </p>
        </div>
        <div className="border p-4 rounded-lg bg-yellow-50">
          <h3 className="text-sm font-medium text-yellow-800">Persentase Penjualan</h3>
          <p className={`mt-1 text-2xl font-bold ${
            summary.growthRate >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {summary.growthRate >= 0 ? '+' : ''}{summary.growthRate.toFixed(2)}%
          </p>
        </div>
      </div>

      {summary.topProducts && summary.topProducts.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Produk Terlaris</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jumlah Terjual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pendapatan
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {summary.topProducts.map((product, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {product.medicineName || product.medicine?.name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.quantity.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(product.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportSummary;