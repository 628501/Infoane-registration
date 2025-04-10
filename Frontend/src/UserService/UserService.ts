import { AxiosResponse } from 'axios';
import axiosInstance from '../api/axiosInstance';


interface RegisterResponse {
  message: string;
  id: number;
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

interface Dashboard{
  message: string;
  user: string;
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
    const response: AxiosResponse<RegisterResponse> = await axiosInstance.post('/register', {
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

export const getEmployees = async (): Promise<EmployeesResponse> => {
  try {
    const response: AxiosResponse<EmployeesResponse> = await axiosInstance.get('/employees', { withCredentials: true });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching employees:', error.response?.data || error);
    throw error.response?.data || error;
  }
};

export const getDashboardData = async (): Promise<Dashboard> => {
  try {
    console.log("Fetching dashboard data");
    const response: AxiosResponse<Dashboard> = await axiosInstance.get('/dashboard', { withCredentials: true });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching dashboard data:', error.response?.data || error);
    throw error.response?.data || error;
  }
};

