import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails } from '../helper/AuthTokenHelper';
import ConnectSignalR from './ConnectSignalR';
import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();
const AppInitialize = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
const [connection,setConnection] = useState(false);

  useEffect(() => {
    const handleConnection = async () => {
      const userData = await getUserDetails();

      if (userData) {
        if (!connection) {
          try {
            await ConnectSignalR.start();
            setConnection(true);
            // navigation.replace('HomeScreen');
          } catch (error) {
            console.error('SignalR connection error:', error);
          }
        } else {
          // navigation.replace('HomeScreen');
        }
      }
       else {
        if (isConnected) {
          try {
            await ConnectSignalR.stop();
            dispatch(setConnection(false));
          } catch (error) {
            console.error('SignalR disconnection error:', error);
          }
        }
        // navigation.replace('LoginScreen');
      }
    };

    handleConnection();
  }, [connection, dispatch, navigation]);

  return null; // or a loading spinner
};

export default AppInitialize;
