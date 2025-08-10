const ReportTypeSelector = ({ selectedType, onChange }) => {
  const types = [
    { id: 'daily', name: 'Daily Report', description: 'Summary of sales and transactions for a single day' },
    { id: 'monthly', name: 'Monthly Report', description: 'Summary of sales and transactions for a month' },
    { id: 'yearly', name: 'Yearly Report', description: 'Summary of sales and transactions for a year' }
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {types.map((type) => (
        <div
          key={type.id}
          onClick={() => onChange(type.id)}
          className={`border rounded-lg p-4 cursor-pointer ${
            selectedType === type.id
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <h3 className="font-medium text-gray-900">{type.name}</h3>
          <p className="mt-1 text-sm text-gray-500">{type.description}</p>
        </div>
      ))}
    </div>
  );
};

export default ReportTypeSelector;