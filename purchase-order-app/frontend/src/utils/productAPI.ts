import axios from 'axios';

export interface Product {
  id: string;
  name: string;
  price: number;
  // Add other product properties as needed
}

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const response = await axios.get('/product/list');
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    const response = await axios.get(`/product/list?search=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};