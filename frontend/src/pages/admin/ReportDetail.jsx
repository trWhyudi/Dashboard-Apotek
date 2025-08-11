import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import ReportSummary from '../../components/report/ReportSummary';
import ReportChart from '../../components/report/ReportChart';
import { formatCurrency } from '../../utils/helpers';
import { FaFileDownload } from "react-icons/fa";

const ReportDetail = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleDownload = async () => {
    try {
      const response = await api.get(`/report/download-report/${id}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${report.title || 'report'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Gagal mengunduh laporan:', error);
    }
  };

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await api.get(`/report/single-report/${id}`);
        setReport(response.data.data);
      } catch (err) {
        setError('Failed to load report details');
        console.error('Error fetching report:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
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

  if (!report) {
    return (
      <div className="ml-64 pt-16 p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
          Report not found
        </div>
      </div>
    );
  }

  return (
    <div className="ml-64 pt-16 p-6 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{report.title}</h1>
        <div className="flex space-x-3">
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
          >
            <span className="material-icons-outlined mr-1"><FaFileDownload /></span>
            Download PDF
          </button>
          <Link
            to="/reports"
            className="px-4 py-2 border border-indigo-300 rounded-md text-sm font-medium text-indigo-700 hover:bg-indigo-50"
          >
            Kembali
          </Link>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="border p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Tipe Laporan</h3>
            <p className="mt-1 text-lg font-semibold text-gray-900 capitalize">{report.type}</p>
          </div>
          <div className="border p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Periode</h3>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {new Date(report.startDate).toLocaleDateString()} - {new Date(report.endDate).toLocaleDateString()}
            </p>
          </div>
          <div className="border p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Dibuat Oleh</h3>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {report.generatedBy?.name || 'System'}
            </p>
          </div>
        </div>

        <ReportSummary summary={report.summary} />
      </div>

      {report.summary.dailyBreakdown && report.summary.dailyBreakdown.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Rincian Penjualan Harian</h2>
          <ReportChart data={report.summary.dailyBreakdown} />
        </div>
      )}
    </div>
  );
};

export default ReportDetail;