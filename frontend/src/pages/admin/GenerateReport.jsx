import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import ReportTypeSelector from '../../components/report/ReportTypeSelector';
import DateRangePicker from '../../components/ui/DateRangePicker';
import { formatDate } from '../../utils/helpers';

const GenerateReport = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: 'daily',
    startDate: null,
    endDate: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      type
    }));
  };

  const handleDateChange = (dates) => {
    setFormData(prev => ({
      ...prev,
      startDate: dates.startDate,
      endDate: dates.endDate
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.startDate || !formData.endDate) {
        throw new Error('Please select a date range');
      }

      const response = await api.post('/report/generate', {
        type: formData.type,
        startDate: formatDate(formData.startDate),
        endDate: formatDate(formData.endDate)
      });

      navigate(`/admin/reports/${response.data.data.reportId}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  // Auto-set date range based on report type
  const updateDatesForType = (type) => {
    const now = new Date();
    let startDate, endDate;

    switch (type) {
      case 'daily':
        startDate = new Date(now);
        endDate = new Date(now);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        startDate = null;
        endDate = null;
    }

    setFormData(prev => ({
      ...prev,
      startDate,
      endDate
    }));
  };

  return (
    <div className="ml-64 pt-16 p-6 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-indigo-800">Buat Laporan Baru</h1>
        <button
          onClick={() => navigate('/admin/reports')}
          className="px-4 py-2 border border-indigo-300 rounded-md text-sm font-medium text-indigo-700 hover:bg-indigo-50"
        >
          Cancel
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Tipe Laporan</h2>
            <ReportTypeSelector 
              selectedType={formData.type}
              onChange={(type) => {
                handleTypeChange(type);
                updateDatesForType(type);
              }}
            />
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Rentang Tanggal / Periode</h2>
            <DateRangePicker
              startDate={formData.startDate}
              endDate={formData.endDate}
              onChange={handleDateChange}
            />
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={loading || !formData.startDate || !formData.endDate}
              className={`px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                loading || !formData.startDate || !formData.endDate ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GenerateReport;