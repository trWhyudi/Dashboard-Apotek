import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/helpers';

const ReportTable = ({ reports, onDelete, onDownload, onSort, sortConfig }) => {
  const getSortIndicator = (column) => {
    if (sortConfig.sortBy !== column) return null;
    return sortConfig.sortOrder === 'asc' ? '↑' : '↓';
  };

  const handleSortClick = (column) => {
    onSort(column);
  };

  const getTypeBadge = (type) => {
    const typeClasses = {
      daily: 'bg-blue-100 text-blue-800',
      monthly: 'bg-purple-100 text-purple-800',
      yearly: 'bg-green-100 text-green-800'
    };
    
    const typeLabels = {
      daily: 'Harian',
      monthly: 'Bulanan',
      yearly: 'Tahunan'
    };

    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${typeClasses[type]}`}>
        {typeLabels[type]}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSortClick('title')}
            >
              Title {getSortIndicator('title')}
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSortClick('type')}
            >
              Tipe {getSortIndicator('type')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Periode
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSortClick('createdAt')}
            >
              Dibuat {getSortIndicator('createdAt')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {reports.length > 0 ? (
            reports.map((report) => (
              <tr key={report._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{report.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getTypeBadge(report.type)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(report.startDate)} / {formatDate(report.endDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(report.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <Link
                      to={`/admin/reports/${report._id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Detail
                    </Link>
                    <button
                      onClick={() => onDownload(report._id)}
                      className="text-teal-600 hover:text-teal-900"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => onDelete(report._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                No reports found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ReportTable;