import { useState } from 'react';
import { getUserDetails } from '../helper/AuthTokenHelper';
import ConnectSignalR from './ConnectSignalR';

export const handleConnection = async () => {
    console.log("called");

    const userData = await getUserDetails();
    console.log('User Data:;;;;;;;;;; ', userData);

    if(userData?.accessToken){
  
            try {
              await ConnectSignalR.start();
              console.log('SignalR is connected');
              // navigation.replace('HomeScreen');
            } catch (error) {
              console.error('SignalR connection error:', error);
            }
          
        }
    // if (userData) {
    //   if (!connection) {
    //     try {
    //       await ConnectSignalR.start();
    //       setConnection(true);
    //       console.log('SignalR is connected');
    //       // navigation.replace('HomeScreen');
    //     } catch (error) {
    //       console.error('SignalR connection error:', error);
    //     }
    //   } else {
    //     // navigation.replace('HomeScreen');
    //   }
    // }
    //  else {
    //   if (isConnected) {
    //     try {
    //       await ConnectSignalR.stop();
    //       dispatch(setConnection(false));
    //       console.log('SignalR is disconnected');
    //     } catch (error) {
    //       console.error('SignalR disconnection error:', error);
    //     }
    //   }
    //   // navigation.replace('LoginScreen');
    // }
    return true;
  };