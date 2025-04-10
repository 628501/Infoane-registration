import { AxiosResponse } from "axios";
import axiosInstance from "../api/axiosInstance";

interface RegisterResponse {
  message: string;
  id: number;
}
export interface Candidate {
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
interface CandidatesResponse {
  employees: Candidate[];
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
    const response: AxiosResponse<RegisterResponse> = await axiosInstance.post(
      "/register",
      {
        name,
        email,
        mobile,
        degree,
        department,
        degree_percentage,
        sslc_percentage,
        hsc_percentage,
        location,
        relocate,
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Registration error:", error.response?.data || error);
    throw error.response?.data || error;
  }
};

export const getCandidates = async (): Promise<CandidatesResponse> => {
  try {
    const response: AxiosResponse<CandidatesResponse> = await axiosInstance.get(
      "/candidate",
      { withCredentials: true }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error fetching employees:", error.response?.data || error);
    throw error.response?.data || error;
  }
};
