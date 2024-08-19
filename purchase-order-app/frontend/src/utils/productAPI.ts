import axios, { AxiosRequestConfig } from "axios";

const API_BASE_URL = "https://gearvn.com"; // Update this to match your backend URL

export interface Product {
  id: string;
  name: string;
  price: number;
  // Add other product properties as needed
}

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/products`);
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    const config: AxiosRequestConfig = {
      method: "post",
      url: `${process.env.REACT_APP_API_URL}/proxy`,
      
      headers: {
        path: "/apps/gvn_search/search_products",
        "Content-Type": "application/json",
        referer: "https://gearvn.com/",
      },
      data: {
        search: query,
        pageIndex: 1,
        pageSize: 10,
      },
    };
    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    console.error("Error searching products:", error);
    throw error;
  }
};
