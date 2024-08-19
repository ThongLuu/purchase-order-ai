import axios, { AxiosRequestConfig } from 'axios';

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
    let data = JSON.stringify({
      "search": query,
      "pageIndex": 1,
      "pageSize": 1
    });
    
    let config: AxiosRequestConfig = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://gearvn.com/apps/gvn_search/search_products',
      headers: { 
        'Content-Type': 'application/json'
      },
      data: data
    };
    
    const response = await axios.request(config);
    return response.data as Product[];
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};