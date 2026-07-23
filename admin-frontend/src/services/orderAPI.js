import axiosInstance from './axiosInstance.js';
import { ENDPOINTS } from '../config/api.config.js';

export const orderAPI = {
  // Get all orders/bills
  getAll: () => 
    axiosInstance.get(ENDPOINTS.BILLS + '/all'),

  // Get order by ID
  getById: (billId) => 
    axiosInstance.get(ENDPOINTS.BILL_BY_ID(billId)),

  // Create new order/bill
  create: (orderData) => 
    axiosInstance.post(ENDPOINTS.BILLS + '/create', orderData),

  // Update order status
  updateStatus: (billId, status) => 
    axiosInstance.put(ENDPOINTS.UPDATE_ORDER_STATUS(billId), { status }),

  // Update payment status
  updatePaymentStatus: (billId, paymentStatus) => 
    axiosInstance.put(ENDPOINTS.BILLS + `/update-payment/${billId}`, { paymentStatus }),

  // Download invoice
  downloadInvoice: (billId) => 
    axiosInstance.get(ENDPOINTS.BILLS + `/invoice/${billId}`, { responseType: 'blob' })
};