// import AsyncStorage from '@react-native-async-storage/async-storage';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  AxiosAuthApiInstance as axios,
  saveToken,
  setAuthToken,
} from "../helper/AuthTokenHelper";
export const login = async (obj) => {
  try {
    const response = await axios.post(`/Auth/Login`, obj);
    console.log("Login response:", response);
    if (response.status === 200) {
      saveToken(response?.data?.data);
      return response.data;
    } else {
      throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    console.error("Login API error:", error?.response || error.message);
  }
};

