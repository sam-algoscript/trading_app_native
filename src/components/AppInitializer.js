import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { handleConnection } from "./ComFuncStart";
import { clientData } from "../services/ClientDataServices";
import { setClientWatchListData } from "../actions/ClientActions";
import { useDispatch } from "react-redux";
import { saveToken, setAuthToken } from "../helper/AuthTokenHelper";
import ConnectSignalR from "./ConnectSignalR";
import axios from "axios";

const AppInitializer = () => {
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const clientsData = async () => {
    const watchListData = await clientData();
    dispatch(setClientWatchListData(watchListData));
    navigation.navigate("HomeScreen");
  };

  useEffect(() => {
    const checkUserData = async () => {
      try {
        const firstTime = await AsyncStorage.getItem("isFirstTime");

        if (firstTime === null) {
          // App is being launched for the first time
          await AsyncStorage.setItem("isFirstTime", "false");
          navigation.navigate("LoginScreen");
          return;
        }

        const userDetailsString = await AsyncStorage.getItem("UserDetails");

        if (!userDetailsString) {
          // No user details found, navigate to LoginScreen
          navigation.navigate("LoginScreen");
          return;
        }

        const userDetails = JSON.parse(userDetailsString);

        if (userDetails && userDetails.accessToken) {
          await setAuthToken(userDetails.accessToken);
          // If user data exists, navigate to HomeScreen and initialize SignalR
          ConnectSignalR.start();
          console.log("SignalR connected");
          await clientsData();
        } else {
          // If no accessToken, navigate to LoginScreen
          navigation.navigate("LoginScreen");
        }
      } catch (error) {
        console.error("Error checking user data:", error);
        // Navigate to LoginScreen in case of error
        navigation.navigate("LoginScreen");
      } finally {
        setLoading(false);
      }
    };

    checkUserData();
  }, [navigation]);

  if (loading) {
    // Show a loading indicator while checking user data
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return null;
};

export default AppInitializer;
