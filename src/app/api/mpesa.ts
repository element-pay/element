import axios from 'axios';

// Define the base URL for the FastAPI backend
const api = axios.create({
  baseURL: 'http://localhost:8000', // Replace with the actual backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create order request type
export interface CreateOrderRequest {
  phone_number: string;
  amount: number;
  token_amount: number;
  wallet_address: string;
}

// Get order response type
export interface OrderResponse {
  id: number;
  phone_number: string;
  amount: number;
  token_amount: number;
  wallet_address: string;
  status: string;
  mpesa_ref?: string;
  created_at: string;
  merchant_request_id?: string;
  checkout_request_id?: string;
}

// Function to create a new order
export const createOrder = async (orderData: CreateOrderRequest): Promise<OrderResponse> => {
  const response = await api.post('/create_order', orderData);
  return response.data;
};

// Function to get an order by ID
export const getOrder = async (orderId: number): Promise<OrderResponse> => {
  const response = await api.get(`/order/${orderId}`);
  return response.data;
};

// Function to handle the M-Pesa callback (used internally by the backend)
export const handleMpesaCallback = async (data: any): Promise<any> => {
  const response = await api.post('/callback', data);
  return response.data;
};
