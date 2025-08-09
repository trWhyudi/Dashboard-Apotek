import { useState } from 'react';

const MedicineSelection = ({ medicines, onAddMedicine }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    if (!selectedMedicine || quantity <= 0) return;
    onAddMedicine(selectedMedicine, parseInt(quantity));
    setSelectedMedicine(null);
    setQuantity(1);
  };

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Select Medicines</h2>
      
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search medicines..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div className="mb-4 max-h-64 overflow-y-auto">
        {filteredMedicines.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {filteredMedicines.map(medicine => (
              <li 
                key={medicine._id} 
                className={`p-3 cursor-pointer hover:bg-gray-50 ${selectedMedicine?._id === medicine._id ? 'bg-indigo-50' : ''}`}
                onClick={() => setSelectedMedicine(medicine)}
              >
                <div className="flex justify-between">
                  <span className="font-medium">{medicine.name}</span>
                  <span>Rp {medicine.price.toLocaleString()}</span>
                </div>
                <div className="text-sm text-gray-500">
                  Stock: {medicine.stock} | Exp: {new Date(medicine.expired).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center py-4">No medicines found</p>
        )}
      </div>

      {selectedMedicine && (
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity (Max: {selectedMedicine.stock})
            </label>
            <input
              type="number"
              min="1"
              max={selectedMedicine.stock}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            onClick={handleAdd}
            className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
};

export default MedicineSelection;