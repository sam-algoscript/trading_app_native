//import liraries
import React, { useEffect, useState } from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import {Provider as StoreProvider} from 'react-redux';
import store from './src/store/store';
import HomeScreen from './src/screens/HomeScreen';
import AppInitializer from './src/components/AppInitializer';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken } from './src/helper/AuthTokenHelper';
import ConnectSignalR from './src/components/ConnectSignalR';
import NewHomeScreen from './src/screens/NewHomeScreen';
import FlatListNewHomeScreen from './src/screens/FlatListNewHomeScreen';

// create a component

const Stack = createNativeStackNavigator();
const App = () => {
  const [appState, setAppState] = useState(AppState.currentState);

  // useEffect(() => {
  //   const handleAppStateChange = async (nextAppState) => {
  //     if (nextAppState === 'background' || nextAppState === 'inactive') {
  //       // Stop SignalR connection when the app goes to the background or becomes inactive
  //       await ConnectSignalR.stop();
  //       console.log('SignalR connection stopped due to app state change:', nextAppState);
  //     } else if (nextAppState === 'active') {
  //       try {
  //         console.log("called from app js else part")
  //         const token = await AsyncStorage.getItem('token');
  //         console.log(token,"hello im token");
  //         if (token) {
  //           setAuthToken(token); // Token set karne ke liye
  //         }
  //       } catch (error) {
  //         console.error('Error loading token:', error);
  //       }
  //       // Start or restart SignalR connection when the app becomes active
  //       await ConnectSignalR.start();
  //       console.log('SignalR connection started/restarted due to app state change:', nextAppState);
  //     }
  //     setAppState(nextAppState); // Update app state
  //   };

  //   const subscription = AppState.addEventListener('change', handleAppStateChange);

  //   return () => {
  //     subscription.remove(); // Cleanup listener on unmount
  //   };
  // }, [appState]);
  return (
    <NavigationContainer>
      <StoreProvider store={store}>
        <Stack.Navigator>
        <Stack.Screen
            options={{ headerShown: false }}
            name="AppInitializer"
            component={AppInitializer}
          />
          <Stack.Screen
            options={{headerShown: false}}
            name="LoginScreen"
            component={LoginScreen}
          />
          <Stack.Screen
            options={{headerShown: false}}
            name="HomeScreen"
            component={NewHomeScreen}
          />
        </Stack.Navigator>
      </StoreProvider>
    </NavigationContainer>
  );
};

//make this component available to the app
export default App;
