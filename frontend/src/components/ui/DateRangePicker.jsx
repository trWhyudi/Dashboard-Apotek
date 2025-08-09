import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DateRangePicker = ({ onChange }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    
    if (start && end) {
      onChange({ startDate: start, endDate: end });
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <DatePicker
        selectsRange
        startDate={startDate}
        endDate={endDate}
        onChange={handleDateChange}
        isClearable
        placeholderText="Select date range"
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
      />
      {startDate && endDate && (
        <button
          onClick={() => {
            setStartDate(null);
            setEndDate(null);
            onChange({ startDate: null, endDate: null });
          }}
          className="text-sm text-indigo-600 hover:text-indigo-900"
        >
          Clear
        </button>
      )}
    </div>
  );
};

export default DateRangePicker;