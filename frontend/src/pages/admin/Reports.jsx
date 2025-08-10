import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import ReportTable from '../../components/report/ReportTable';
import ReportTypeFilter from '../../components/report/ReportTypeFilter';
import Pagination from '../../components/ui/Pagination';
import { formatDate } from '../../utils/helpers';
import Swal from 'sweetalert2';
import { IoMdAddCircleOutline } from "react-icons/io";

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    type: '',
    page: 1,
    limit: 10,
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
      page: 1
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
      const response = await api.get(`/report/download-report/${id}`, {
        responseType: 'blob'
      });

      const contentDisposition = response.headers['content-disposition'];
      let filename = 'report.pdf';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch.length === 2) {
          filename = filenameMatch[1];
        }
      }

      // Buat URL untuk blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download report');
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Yakin ingin menghapus?',
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/report/delete-report/${id}`);
          setReports(reports.filter(report => report._id !== id));
          Swal.fire('Deleted!', 'Your report has been deleted.', 'success');
        } catch (error) {
          console.error('Error deleting report:', error);
          Swal.fire('Error!', 'There was an error deleting the report.', 'error');
        }
      }
    })
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="ml-64 pt-16 p-6 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-indigo-800">Laporan</h1>
        <Link
          to="/admin/reports/generate"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
        >
          <span className="material-icons-outlined mr-1"><IoMdAddCircleOutline/></span>
          Buat Laporan
        </Link>
      </div>

      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <ReportTypeFilter 
          currentType={filter.type}
          onChange={handleFilterChange}
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
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
            onPageChange={(page) => setFilter(prev => ({ ...prev, page }))}
          />
        )}
      </div>
    </div>
  );
};

export default AdminReports;