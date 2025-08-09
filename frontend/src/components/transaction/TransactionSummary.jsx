const TransactionSummary = ({ 
  items, 
  onRemove, 
  total, 
  paymentAmount, 
  onPaymentChange, 
  onSubmit, 
  loading 
}) => {
  const calculateChange = () => {
    if (!paymentAmount || isNaN(paymentAmount)) return 0;
    const payment = parseFloat(paymentAmount);
    return payment >= total ? payment - total : 0;
  };

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Transaction Summary</h2>
      
      <div className="mb-4 max-h-64 overflow-y-auto">
        {items.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {items.map((item, index) => (
              <li key={index} className="py-3">
                <div className="flex justify-between">
                  <div>
                    <span className="font-medium">{item.medicine.name}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      × {item.quantity}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-3">
                      Rp {(item.medicine.price * item.quantity).toLocaleString()}
                    </span>
                    <button
                      onClick={() => onRemove(item.medicine._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center py-4">No items added</p>
        )}
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between mb-2">
          <span className="font-medium">Subtotal:</span>
          <span>Rp {total.toLocaleString()}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="font-medium">Tax (0%):</span>
          <span>Rp 0</span>
        </div>
        <div className="flex justify-between font-bold text-lg mb-4">
          <span>Total:</span>
          <span>Rp {total.toLocaleString()}</span>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Amount (Rp)
          </label>
          <input
            type="number"
            min={total}
            value={paymentAmount}
            onChange={(e) => onPaymentChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="flex justify-between mb-6">
          <span className="font-medium">Change:</span>
          <span>Rp {calculateChange().toLocaleString()}</span>
        </div>

        <button
          onClick={onSubmit}
          disabled={loading || items.length === 0}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            loading || items.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Processing...' : 'Complete Transaction'}
        </button>
      </div>
    </div>
  );
};

export default TransactionSummary;