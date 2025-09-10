import React from "react";
import { formatCurrency } from "../../utils/helpers";

const ReportSummary = ({ summary }) => {
  const formatNumber = (number) => {
    return new Intl.NumberFormat("id-ID").format(number || 0);
  };

  const summaryCards = [
    {
      title: "Total Penjualan",
      value: formatCurrency(summary?.totalSales || 0),
      bgColor: "bg-blue-500",
      textColor: "text-blue-600",
      icon: "💰",
    },
    {
      title: "Total Transaksi",
      value: formatNumber(summary?.totalTransactions || 0),
      bgColor: "bg-green-500",
      textColor: "text-green-600",
      icon: "📋",
    },
    {
      title: "Rata-rata Transaksi",
      value: formatCurrency(summary?.averageTransactionValue || 0),
      bgColor: "bg-yellow-500",
      textColor: "text-yellow-600",
      icon: "📊",
    },
    {
      title: "Total Obat Terjual",
      value: `${formatNumber(summary?.totalMedicinesSold || 0)} pcs`,
      bgColor: "bg-purple-500",
      textColor: "text-purple-600",
      icon: "💊",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">
                  {card.title}
                </p>
                <p className={`text-2xl font-bold ${card.textColor} mt-1`}>
                  {card.value}
                </p>
              </div>
              <div
                className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center text-white text-xl`}
              >
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {summary.topProducts && summary.topProducts.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Produk Terjual
          </h3>
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
                        {product.medicineName ||
                          product.medicine?.name ||
                          "N/A"}
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
