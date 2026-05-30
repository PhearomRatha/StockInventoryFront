import { getCollection, addItem, updateItem, deleteItem } from './storage';
const successResponse = (data, message = 'Success') => ({ success: true, data, message, status: 200 });

export const paymentApi = {
  getAll: async () => {
    return successResponse({ data: getCollection('payments'), total: getCollection('payments').length });
  },
  create: async (data) => {
    return successResponse(addItem('payments', data), 'Payment created');
  },
  update: async (id, data) => {
    const updated = updateItem('payments', id, data);
    return successResponse(updated, 'Payment updated');
  },
  delete: async (id) => {
    deleteItem('payments', id);
    return successResponse(null, 'Payment deleted');
  },
  getDashboard: async () => {
    const payments = getCollection('payments');
    const totalIncome = payments.filter(p => p.payment_type === 'income' && p.status === 'paid').reduce((s, i) => s + (i.amount || 0), 0);
    const totalExpense = payments.filter(p => p.payment_type === 'expense' && p.status === 'paid').reduce((s, i) => s + (i.amount || 0), 0);
    return successResponse({ today_income: totalIncome, today_expense: totalExpense });
  },
  checkout: async (data) => {
    return successResponse(addItem('payments', data), 'Checkout successful');
  },
  verify: async () => {
    return successResponse({ verified: true });
  }
};
export default paymentApi;
