import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import ReportTable from '../../components/report/ReportTable';
import ReportTypeFilter from '../../components/report/ReportTypeFilter';
import Pagination from '../../components/ui/Pagination';
import Swal from 'sweetalert2';
import { IoMdAddCircleOutline } from "react-icons/io";

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    type: '',
    page: 1,
    limit: 5,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [totalReports, setTotalReports] = useState(0);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (filter.type) params.append('type', filter.type);
        params.append('page', filter.page);
        params.append('limit', filter.limit);
        params.append('sortBy', filter.sortBy);
        params.append('sortOrder', filter.sortOrder);

        const response = await api.get(`/report/all-reports?${params.toString()}`);
        setReports(response.data.data.reports);
        setTotalReports(response.data.data.pagination.total);
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [filter]);

  const handleFilterChange = (newFilter) => {
    setFilter(prev => ({
      ...prev,
      ...newFilter,
      page: 1,
    }));
  };

  const handleSort = (column) => {
    setFilter(prev => ({
      ...prev,
      sortBy: column,
      sortOrder: prev.sortBy === column ? (prev.sortOrder === 'asc' ? 'desc' : 'asc') : 'desc'
    }));
  };

  const handleDownload = async (id) => {
    try {
      const response = await api.get(`/report/download-report/${id}`, { responseType: 'blob' });
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'report.pdf';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+)"?/);
        if (match?.[1]) filename = match[1];
      }
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      Swal.fire('Error', 'Gagal mengunduh laporan.', 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Yakin ingin menghapus?',
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/report/delete-report/${id}`);
        setReports(prev => prev.filter(report => report._id !== id));
        Swal.fire('Berhasil!', 'Laporan telah dihapus.', 'success');
      } catch {
        Swal.fire('Error!', 'Terjadi kesalahan saat menghapus laporan.', 'error');
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
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-indigo-900 mb-4 md:mb-0">
          Laporan
        </h1>
        <Link
          to="/reports/generate"
          className="inline-flex items-center px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition duration-300"
        >
          <IoMdAddCircleOutline size={24} className="mr-2" />
          Buat Laporan
        </Link>
      </div>

      <section className="mb-8 bg-white p-5 rounded-xl shadow-md">
        <ReportTypeFilter
          currentType={filter.type}
          onChange={handleFilterChange}
        />
      </section>

      <section className="bg-white p-6 rounded-xl shadow-md">
        <ReportTable
          reports={reports}
          onDelete={handleDelete}
          onDownload={handleDownload}
          onSort={handleSort}
          sortConfig={filter}
        />
        {totalReports > 0 && (
          <Pagination
            currentPage={filter.page}
            totalPages={Math.ceil(totalReports / filter.limit)}
            onPageChange={(page) => setFilter((prev) => ({ ...prev, page }))}
          />
        )}
      </section>
    </main>
  );
};

export default AdminReports;