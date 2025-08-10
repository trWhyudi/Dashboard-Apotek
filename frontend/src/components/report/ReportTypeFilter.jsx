const ReportTypeFilter = ({ currentType, onChange }) => {
  const types = [
    { value: '', label: 'Semua' },
    { value: 'daily', label: 'Harian' },
    { value: 'monthly', label: 'Bulanan' },
    { value: 'yearly', label: 'Tahunan' }
  ];

  const handleTypeChange = (e) => {
    onChange({ type: e.target.value });
  };

  return (
    <div className="flex items-center space-x-4">
      <label className="text-sm font-medium text-gray-700">Filter berdasarkan tipe:</label>
      <select
        value={currentType}
        onChange={handleTypeChange}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
      >
        {types.map((type) => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ReportTypeFilter;