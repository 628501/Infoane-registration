import axios, { AxiosResponse } from 'axios';

const API_URL = 'http://localhost:5000/api/users';

interface RegisterResponse {
  message: string;
  id: number;
}

interface User {
  name: string;
  emailId: string;
  id: number;
  auth: string;
}

export interface Employee {
  id: number;
  name: string;
  email: string;
  mobile: string;
  degree: string;
  department: string;
  degree_percentage: number;
  sslc_percentage: number;
  hsc_percentage: number;
  location: string;
  relocate: boolean;
}

interface EmployeesResponse {
  employees: Employee[];
}

export const register = async (
  name: string,
  email: string,
  mobile: string,
  degree: string,
  department: string,
  degree_percentage: number,
  sslc_percentage: number,
  hsc_percentage: number,
  location: string,
  relocate: boolean
): Promise<RegisterResponse> => {
  try {
    const response: AxiosResponse<RegisterResponse> = await axios.post(`${API_URL}/register`, {
      name,
      email,
      mobile,
      degree,
      department,
      degree_percentage,
      sslc_percentage,
      hsc_percentage,
      location,
      relocate
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Registration error:', error.response?.data || error);
    throw error.response?.data || error;
  }
};

export const login = async (email: string, password: string, token: any): Promise<User> => {
  try {
    const { data } = await axios.post(`${API_URL}/login`, { email, password, token }, { withCredentials: true });
    const { token: authToken, name, emailId, id, auth } = data;

    document.cookie = `token=${authToken}; path=/; max-age=${30 * 24 * 60 * 60}; Secure; SameSite=Strict`;

    return { name, emailId, id, auth };
  } catch (error: any) {
    console.error('Error logging in:', error.response?.data || error);
    throw error.response?.data || error;
  }
};

export const logout = async (email: any) => {
  try {
    await axios.post(`${API_URL}/logout`, { email }, { withCredentials: true });
    document.cookie = `token=; path=/; max-age=0; Secure; SameSite=Strict`;
  } catch (error: any) {
    console.error('Error logging out:', error.response?.data || error);
    throw error.response?.data || error;
  }
};

export const getEmployees = async (): Promise<EmployeesResponse> => {
  try {
    const response: AxiosResponse<EmployeesResponse> = await axios.get(`${API_URL}/employees`, { withCredentials: true });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching employees:', error.response?.data || error);
    throw error.response?.data || error;
  }
};

export const getToken = async (email: string): Promise<any> => {
  try {
    const response: AxiosResponse<{ token: any }> = await axios.post(`${API_URL}/get-token`, { email }, { withCredentials: true });
    return response.data.token;
  } catch (error: any) {
    console.error('Error fetching token:', error.response?.data || error);
    throw error.response?.data || error;
  }
};
