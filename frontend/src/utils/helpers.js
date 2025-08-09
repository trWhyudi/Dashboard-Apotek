export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'completed':
      return 'green';
    case 'pending':
      return 'yellow';
    case 'cancelled':
      return 'red';
    default:
      return 'gray';
  }
};