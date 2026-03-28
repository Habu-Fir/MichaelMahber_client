// frontend/src/services/dashenApi.ts
import axios from 'axios';

// Hardcoded for production - remove after environment variable works
const API_URL = 'https://michaelmahberbackend.onrender.com';

export const initiateDashenPayment = async (data: {
    loanId: string;
    amount: number;
    phoneNumber: string;
}) => {
    const url = `${API_URL}/api/loans/dashen-payment/initiate`;
    console.log('📡 Calling URL:', url);

    const response = await axios.post(
        url,
        data,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        }
    );
    return response.data;
};

export const checkDashenPaymentStatus = async (orderId: string) => {
    const url = `${API_URL}/api/v1/loans/dashen-payment/status/${orderId}`;
    console.log('📡 Checking status at:', url);

    const response = await axios.get(
        url,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        }
    );
    return response.data;
};