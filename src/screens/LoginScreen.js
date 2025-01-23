import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { WIN_HEIGHT, WIN_WIDTH } from "../constant/constant";
import { login } from "../services/AuthServices";
import { useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { handleConnection } from "../components/ComFuncStart";
import { clientData } from "../services/ClientDataServices";
import { setClientWatchListData } from "../actions/ClientActions";
import ConnectSignalR from "../components/ConnectSignalR";
import { setAuthToken } from "../helper/AuthTokenHelper";

const LoginScreen = () => {
  const [loginData, setLoginData] = useState(null);
  const [userName, setUserName] = useState("");
  const [pass, setPass] = useState("");
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const onLoginPres = async () => {
    const obj = {
      userName: userName,
      password: pass,
      role: "client",
    };
    // await saveToken(user_data);
    const loginApi = await login(obj);

    console.log("loginApi", loginApi);
    if (loginApi?.data?.accessToken) {
      console.log("login Token", loginApi.data.accessToken);
      // console.log("Login successful, setting token in headers...");

      // const accessToken = loginApi.data.accessToken;
      await setAuthToken(loginApi.data.accessToken); // Ensure the token is set before proceeding
      setLoginData(loginApi);
      clientData();
      navigation.navigate("HomeScreen");
    } else {
      console.error("Login failed or token not received.");
    }
  };

  const clientsData = async () => {
    try {
      const watchListData = await clientData();
      console.log("watchListData", watchListData);


      if (watchListData) {
        dispatch(setClientWatchListData(watchListData));
        navigation.navigate("HomeScreen");
      }
    } catch (error) {
      console.error("Error fetching client data:", error);
    }
  };

  useEffect(() => {
    if (loginData?.data?.accessToken) {
      ConnectSignalR.start();
      clientsData();
      navigation.navigate("AppInitializer");
    }
  }, [loginData]);

  return (
    <View style={styles.container}>
      <TextInput
        style={{
          borderWidth: 1,
          width: (WIN_WIDTH * 80) / 100,
          height: (WIN_HEIGHT * 5) / 100,
          borderRadius: (WIN_WIDTH * 2) / 100,
          paddingHorizontal: (WIN_WIDTH * 2) / 100,
        }}
        value={userName}
        onChangeText={(text) => setUserName(text)}
        placeholder={"Enter Your Username"}
        placeholderTextColor={"#C0C0C0"}
      />
      <TextInput
        style={{
          borderWidth: 1,
          marginTop: (WIN_HEIGHT * 2) / 100,
          width: (WIN_WIDTH * 80) / 100,
          height: (WIN_HEIGHT * 5) / 100,
          borderRadius: (WIN_WIDTH * 2) / 100,
          paddingHorizontal: (WIN_WIDTH * 2) / 100,
        }}
        value={pass}
        onChangeText={(text) => setPass(text)}
        placeholder={"Enter Your Password"}
        placeholderTextColor={"#C0C0C0"}
      />
      <TouchableOpacity
        onPress={onLoginPres}
        style={{
          borderWidth: 1,
          width: (WIN_WIDTH * 38) / 100,
          marginTop: (WIN_HEIGHT * 2) / 100,
          height: (WIN_HEIGHT * 5) / 100,
          borderRadius: (WIN_WIDTH * 2) / 100,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#ADD8E6",
        }}
        activeOpacity={0.85}
      >
        <Text style={{ color: "#000", fontSize: 16, fontWeight: "700" }}>
          {"Login"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default LoginScreen;
