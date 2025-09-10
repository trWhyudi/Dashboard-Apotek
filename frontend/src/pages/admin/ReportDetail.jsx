import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../utils/api";
import ReportSummary from "../../components/report/ReportSummary";
import ReportChart from "../../components/report/ReportChart";
import { formatCurrency } from "../../utils/helpers";
import { FaFileDownload, FaArrowLeft } from "react-icons/fa";

const ReportDetail = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  const formatNumber = (number) => {
    return new Intl.NumberFormat("id-ID").format(number || 0);
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const response = await api.get(`/report/download-report/${id}`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${report.title || "report"}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Clean up
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Gagal mengunduh laporan:", error);
      alert("Gagal mengunduh laporan. Silakan coba lagi.");
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await api.get(`/report/single-report/${id}`);
        setReport(response.data.data);
      } catch (err) {
        setError("Gagal memuat detail laporan");
        console.error("Error fetching report:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchReport();
    }
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
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
        <Link
          to="/reports"
          className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <FaArrowLeft className="mr-2" />
          Kembali ke Laporan
        </Link>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="ml-64 pt-16 p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Peringatan!</strong>
          <span className="block sm:inline"> Laporan tidak ditemukan</span>
        </div>
        <Link
          to="/reports"
          className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <FaArrowLeft className="mr-2" />
          Kembali ke Laporan
        </Link>
      </div>
    );
  }

  return (
    <div className="ml-64 pt-16 p-6 mt-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{report.title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Dibuat pada: {new Date(report.createdAt).toLocaleString("id-ID")}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
          >
            <FaFileDownload className="mr-2" />
            {downloading ? "Mengunduh..." : "Download PDF"}
          </button>
          <Link
            to="/reports"
            className="inline-flex items-center justify-center px-4 py-2 border border-indigo-300 rounded-md text-sm font-medium text-indigo-700 hover:bg-indigo-50 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Kembali
          </Link>
        </div>
      </div>

      {/* Report Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Informasi Laporan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="border border-gray-200 p-4 rounded-lg bg-gray-50">
            <h3 className="text-sm font-medium text-gray-500">Tipe Laporan</h3>
            <p className="mt-1 text-lg font-semibold text-gray-900 capitalize">
              {report.type === "daily"
                ? "Harian"
                : report.type === "monthly"
                ? "Bulanan"
                : report.type === "yearly"
                ? "Tahunan"
                : report.type}
            </p>
          </div>
          <div className="border border-gray-200 p-4 rounded-lg bg-gray-50">
            <h3 className="text-sm font-medium text-gray-500">
              Periode Laporan
            </h3>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {new Date(report.startDate).toLocaleDateString("id-ID")}
            </p>
            <p className="text-sm font-semibold text-gray-900">
              s/d {new Date(report.endDate).toLocaleDateString("id-ID")}
            </p>
          </div>
          <div className="border border-gray-200 p-4 rounded-lg bg-gray-50">
            <h3 className="text-sm font-medium text-gray-500">Dibuat Oleh</h3>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {report.generatedBy?.name || "System"}
            </p>
            <p className="text-sm text-gray-600">
              {report.generatedBy?.email || ""}
            </p>
          </div>
          <div className="border border-gray-200 p-4 rounded-lg bg-gray-50">
            <h3 className="text-sm font-medium text-gray-500">
              Total Obat Terjual
            </h3>
            <p className="mt-1 text-lg font-semibold text-purple-600">
              {formatNumber(report.summary?.totalMedicinesSold || 0)} pcs
            </p>
          </div>
        </div>
      </div>

      {/* Report Summary */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Ringkasan Kinerja
        </h2>
        <ReportSummary summary={report.summary} />
      </div>

      {/* Daily Breakdown Chart */}
      {report.summary.dailyBreakdown &&
        report.summary.dailyBreakdown.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Rincian Penjualan dan Transaksi
            </h2>
            <ReportChart data={report.summary.dailyBreakdown} />
          </div>
        )}
    </div>
  );
};

export default ReportDetail;
