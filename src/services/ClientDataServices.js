import { useDispatch } from "react-redux";
import { AxiosInstance as axios, AxiosInstance } from "../helper/AuthTokenHelper";
import { setClientWatchListData } from "../actions/ClientActions";

export const clientData = async () => {
  try {
    console.log(AxiosInstance.defaults.headers);
    const response = await axios.get(`Me`);
console.log(response);
    const result = response?.data?.data?.watchList;
    if (response?.status === 200) {
      return result;
    } else {
      return false;
    }
  } catch (e) {
    console.log(e);
    if (e.response?.status === 401) {
      console.log("hello");
      // Handle token refresh or redirect to login
    }
  }
};
