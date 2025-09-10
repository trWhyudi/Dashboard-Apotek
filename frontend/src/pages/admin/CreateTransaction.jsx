import { useState, useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom";
import api from '../../utils/api';
import MedicineSelection from '../../components/transaction/MedicineSelection';
import TransactionSummary from '../../components/transaction/TransactionSummary';
import { FaArrowLeft } from 'react-icons/fa';

const CreateTransaction = () => {
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await api.get('/medicine/all-medicines');
        setMedicines(response.data.medicines);
      } catch (err) {
        console.error('Error fetching medicines:', err);
      }
    };

    fetchMedicines();
  }, []);

  const handleAddMedicine = (medicine, quantity) => {
    if (quantity <= 0) return;
    
    const existingIndex = selectedMedicines.findIndex(
      item => item.medicine._id === medicine._id
    );

    if (existingIndex >= 0) {
      const updated = [...selectedMedicines];
      updated[existingIndex].quantity = quantity;
      setSelectedMedicines(updated);
    } else {
      setSelectedMedicines([
        ...selectedMedicines,
        { medicine, quantity }
      ]);
    }
  };

  const handleRemoveMedicine = (id) => {
    setSelectedMedicines(
      selectedMedicines.filter(item => item.medicine._id !== id)
    );
  };

  const calculateTotal = () => {
    return selectedMedicines.reduce(
      (sum, item) => sum + (item.medicine.price * item.quantity),
      0
    );
  };

  const handleSubmit = async () => {
    if (selectedMedicines.length === 0) {
      setError('Please add at least one medicine');
      return;
    }

    const total = calculateTotal();
    if (!paymentAmount || parseFloat(paymentAmount) < total) {
      setError('Payment amount must be equal or greater than total');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const items = selectedMedicines.map(item => ({
        medicine: item.medicine._id,
        quantity: item.quantity
      }));

      const response = await api.post('/transaction/create-transaction', {
        items,
        paymentAmount: parseFloat(paymentAmount)
      });

      navigate(`/transactions/${response.data.transaction._id}`, {
        state: { changeAmount: response.data.changeAmount }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create transaction');
      console.error('Error creating transaction:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ml-64 pt-16 p-6 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-indigo-800">
          Buat Transaksi Baru
        </h1>
        <Link
          to="/transactions"
          className="inline-flex items-center justify-center px-4 py-2 border border-indigo-300 rounded-md text-sm font-medium text-indigo-700 hover:bg-indigo-50 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Kembali
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <MedicineSelection
            medicines={medicines}
            onAddMedicine={handleAddMedicine}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <TransactionSummary
            items={selectedMedicines}
            onRemove={handleRemoveMedicine}
            total={calculateTotal()}
            paymentAmount={paymentAmount}
            onPaymentChange={setPaymentAmount}
            onSubmit={handleSubmit}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateTransaction;