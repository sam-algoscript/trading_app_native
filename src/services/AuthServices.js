import {
  AxiosAuthApiInstance as axios,
  saveToken,
  setAuthToken,
} from "../helper/AuthTokenHelper";
export const login = async (obj) => {
  try {
    const response = await axios.post('/Auth/Login', obj);
    // console.log("API login response",response);
    if (response.status === 200) {
      saveToken(response?.data?.data);
      return response.data;
    } else {
      throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (e) {
    console.error("API Error:", e);
    throw e;
  }
};