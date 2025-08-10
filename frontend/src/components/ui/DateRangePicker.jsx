import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DateRangePicker = ({ onChange, value }) => {
  const [startDate, setStartDate] = useState(value?.startDate || null);
  const [endDate, setEndDate] = useState(value?.endDate || null);

  // Sinkronisasi jika props berubah
  useEffect(() => {
    setStartDate(value?.startDate || null);
    setEndDate(value?.endDate || null);
  }, [value]);

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    
    onChange({ startDate: start, endDate: end });
  };

  const handleClear = () => {
    setStartDate(null);
    setEndDate(null);
    onChange({ startDate: null, endDate: null });
  };

  return (
    <div className="flex items-center space-x-4">
      <DatePicker
        selectsRange
        startDate={startDate}
        endDate={endDate}
        onChange={handleDateChange}
        placeholderText="Pilih rentang tanggal..."
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
      />
      {(startDate || endDate) && (
        <button
          onClick={handleClear}
          className="text-sm text-indigo-600 hover:text-indigo-900"
        >
          Clear
        </button>
      )}
    </div>
  );
};

export default DateRangePicker;