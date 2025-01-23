import axios from "axios";
import { getBaseUrl } from "../global/Environment";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const getUserDetails = async () => {
  try {
    const userDetails = await AsyncStorage.getItem("UserDetails");
    if(userDetails){
      return JSON.parse(userDetails)
    }else{
      return  null;
    }
  } catch (error) {
    console.error("Error fetching user details:", error);
    return null;
  }
};
const baseUrl = getBaseUrl();        

export const AxiosInstance = axios.create({
  baseURL: baseUrl,
});
export const AxiosAuthApiInstance = axios.create({
  baseURL: baseUrl,
});

export const setAuthToken = async (access_Token) => {
  try {
    console.log("set token ",access_Token);
    AxiosInstance.defaults.headers.common["Authorization"] =
      `Bearer ` + access_Token;
  } catch (e) {
    console.error("Error while setup token", e);
  }
};
export const saveToken = async (user_data) => {
  // const useDetails = encryptData(JSON.stringify(user_data), process.env.REACT_APP_SECRET_KEY);
  if (!user_data || !user_data.accessToken) {
    console.error("Invalid user data. Token is missing.");
    return;
  }
  await AsyncStorage.setItem("UserDetails", JSON.stringify(user_data));
  // await setAuthToken(user_data?.accessToken);
};


export const getToken = async () => {
  try {
    const userDetails = await AsyncStorage.getItem("UserDetails");
    if (!userDetails) {
      console.warn("UserDetails not found in AsyncStorage.");
      return null;
    }
    const parsedDetails = JSON.parse(userDetails);
    return parsedDetails.accessToken || null; // Return the token or null
  } catch (error) {
    console.error("Error retrieving token:", error);
    return null;
  }
};
