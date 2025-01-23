//import liraries
import React, {
  Component,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { View, Text, StyleSheet, SafeAreaView, FlatList } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { WIN_HEIGHT, WIN_WIDTH } from "../constant/constant";
import { clientData } from "../services/ClientDataServices";
import ConnectSignalR from "../components/ConnectSignalR";
import {
  DataProvider,
  LayoutProvider,
  RecyclerListView,
} from "recyclerlistview";
import MarqueeText from "react-native-marquee";
import WatchListItem from "../components/WatchListItem";
import { setClientWatchListData } from "../actions/ClientActions";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { saveToken } from "../helper/AuthTokenHelper";

// create a component
const HomeScreen = () => {
  const [data, setData] = useState([]);
  const [priceChanges, setPriceChanges] = useState({});
  const [highLowPriceChanges, setHighLowPriceChanges] = useState({});
  const [transformData, setTransformData] = useState([]);
  const [scriptData, setScriptData] = useState([]);
  const [previousData, setPreviousData] = useState([]);
  const [currentData,setCurrentData]= useState([]);
  const [watchListName, setWatchListName] = useState("");

  const navigation = useNavigation();

  const [dataProvider, setDataProvider] = useState(
    new DataProvider((r1, r2) => r1 !== r2)
  );
  const dispatch = useDispatch();

  // const connection = useSelector((state) => state?.auth);
  // console.log(clientWatchListData?.watchList);
  const pendingUpdates = useRef([]);
  const layoutProvider = useMemo(
    () =>
      new LayoutProvider(
        (index) => 0,
        (type, dim) => {
          dim.width = WIN_WIDTH;
          dim.height = (WIN_HEIGHT * 11) / 100;
        }
      ),
    []
  );
  const clientWatchListData = useSelector(
    (state) => state?.user?.clientWatchListData
  );

  useEffect(() => {
    if (clientWatchListData && Object.keys(clientWatchListData).length > 0) {
      const transformedData = Object.entries(clientWatchListData).map(
        ([key, scripts]) => {
          const [id, watchlistName] = key.split(":");
          return {
            id,
            watchlistName,
            script: scripts,
          };
        }
      );
      setTransformData(transformedData);
      setWatchListName(transformedData[0]?.watchlistName);
      const OnSubscribe = async () => {
        await ConnectSignalR.invoke("OnSubscribe", transformedData[0]?.script);
      };
      OnSubscribe();
    }
  }, [clientWatchListData]);

  useEffect(() => {
			const connectData = async () => {
				await ConnectSignalR.invoke('OnUnSubscribe', previousData);
           setData([]);
    pendingUpdates.current = [];
				if (currentData?.length > 0) {
					setTimeout(() => {
						console.log('OnSubscribe called from timeout');
						const getOnSubscribe = async () => {
							await Connection.invoke('OnSubscribe', currentData);
						};
						getOnSubscribe();
					}, [2000]);
				}
			};
			connectData();
	}, [currentData, previousData]);

  useEffect(() => {
    if (watchListName) {
      setData([]);
      pendingUpdates.current=[];
			const getData = transformData?.find((data) => data?.watchlistName === watchListName);
      console.log(getData?.script,`hello ${getData?.watchlistName}`);
      
			if (getData) {
				setPreviousData(currentData);
				setCurrentData(getData?.scripts);
			} else {
				setPreviousData(currentData);
				setCurrentData([]);
			}
		}
	}, [watchListName]);

  // const ScriptData = [
  //   "MCX:CRUDEOIL24AUGFUT",
  //   "MCX:CRUDEOILM24AUGFUT",
  //   "MCX:NATGASMINI24AUGFUT",
  //   "MCX:NATURALGAS24AUGFUT",
  //   "MCX:SILVER24SEPFUT",
  //   "MCX:SILVERM24AUGFUT",
  //   "MCX:SILVERMIC24AUGFUT",
  // ];

  const getData = async () => {
    try {
      await ConnectSignalR.invoke("OnUnSubscribe", previousData);

      // Clear current data and pending updates before subscribing to new data
     
      const handleNewData = (newData) => {
        // pendingUpdates = null;
        console.log(newData,"newdata ::::::::: ");
        
        pendingUpdates.current.push(newData);
      };
      const ScriptData = transformData[0]?.script;

      const selectedScriptData = transformData.find(
        (item) => item.watchlistName === watchListName
      )?.script;

      // if (selectedScriptData) {

        await ConnectSignalR.invoke("OnSubscribe", currentData);
         ConnectSignalR.on("ReceiveSubscribedScriptUpdate", handleNewData);
      // }
    } catch (e) {}
  };
  useEffect(() => {
    getData();
  }, [watchListName]);
//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (pendingUpdates.current.length > 0) {
//         setData((prevData) => {
//           const updatedData = [...prevData];
//           const newPriceChanges = { ...priceChanges };
//           const newHighLowPriceChanges = { ...highLowPriceChanges };
//           pendingUpdates.current.forEach((newData) => {
//             const existingIndex = updatedData.findIndex(
//               (item) => item?.s === newData?.s
//             );

//             // console.log(newData);
            

//             if (existingIndex !== -1) {
//               const prevAskPrice = updatedData[existingIndex]?.ap;
//               const newAskPrice = newData?.ap;
//               const prevBidPrice = updatedData[existingIndex]?.bp;
//               const newBidPrice = newData?.bp;
//               const prevLowPrice = updatedData[existingIndex]?.lp;
//               const newLowPrice = newData?.lp;
//               const prevHighPrice = updatedData[existingIndex]?.hp;
//               const newHighPrice = newData?.hp;

//               if (newAskPrice > prevAskPrice) {
//                 newPriceChanges[newData.s] = {
//                   ...newPriceChanges[newData.s],
//                   askPriceColor: "green",
//                 };
//               } else if (newAskPrice < prevAskPrice) {
//                 newPriceChanges[newData.s] = {
//                   ...newPriceChanges[newData.s],
//                   askPriceColor: "red",
//                 };
//               }

//               if (newBidPrice > prevBidPrice) {
//                 newPriceChanges[newData.s] = {
//                   ...newPriceChanges[newData.s],
//                   bidPriceColor: "green",
//                 };
//               } else if (newBidPrice < prevBidPrice) {
//                 newPriceChanges[newData.s] = {
//                   ...newPriceChanges[newData.s],
//                   bidPriceColor: "red",
//                 };
//               }

//               if (newHighPrice > prevHighPrice) {
//                 newHighLowPriceChanges[newData.s] = {
//                   ...newHighLowPriceChanges[newData.s],
//                   highPriceColor: "#e6ffe6",
//                 };
//                 setTimeout(() => {
//                   setHighLowPriceChanges((prev) => ({
//                     ...prev,
//                     [newData.s]: {
//                       ...prev[newData.s],
//                       highPriceColor: undefined,
//                     },
//                   }));
//                 }, 500);
//               } else if (newLowPrice < prevLowPrice) {
//                 newHighLowPriceChanges[newData.s] = {
//                   ...newHighLowPriceChanges[newData.s],
//                   highPriceColor: "#FFD6D7",
//                 };
//                 setTimeout(() => {
//                   setHighLowPriceChanges((prev) => ({
//                     ...prev,
//                     [newData.s]: {
//                       ...prev[newData.s],
//                       highPriceColor: undefined,
//                     },
//                   }));
//                 }, 500);
//               }

//               updatedData[existingIndex] = newData;
//             } else {
//               updatedData.push(newData);
//             }
//           });
// console.log(updatedData);
//           setPriceChanges(newPriceChanges);
//           setHighLowPriceChanges(newHighLowPriceChanges);
//           setDataProvider(dataProvider.cloneWithRows(updatedData));
//           pendingUpdates.current = [];
//           return updatedData;
//         });
//       }
//     }, 1);

//     return () => clearInterval(interval);
//   }, [priceChanges, highLowPriceChanges]);

  const rowRenderer = useCallback(
    (type, data) => (
      <WatchListItem
        item={data}
        priceChanges={priceChanges}
        highLowPriceChanges={highLowPriceChanges}
      />
    ),
    [priceChanges, highLowPriceChanges]
  );
  const renderItem = ({ item }) => {
    return (
      <View style={{}}>
        <Text
          onPress={() => {
            setWatchListName(item?.watchlistName);
          }}
        >
          {item?.watchlistName}
        </Text>
      </View>
    );
  };
  return (
    <View style={styles.container}>
      <SafeAreaView style={{ backgroundColor: "#1C355D" }} />
      <View
        style={{ height: (WIN_HEIGHT * 18) / 100, backgroundColor: "#1C355D" }}
      >
        <MarqueeText
          style={{ fontSize: 20, marginTop: 40 }}
          speed={1}
          marqueeOnStart={true}
          loop={true}
          delay={10}
        >
          This app is only for paper trading not used real money in this app
        </MarqueeText>
        <FlatList
          data={transformData}
          renderItem={renderItem}
          horizontal={true}
        />
      </View>

      <RecyclerListView
        style={{ height: (WIN_HEIGHT * 50) / 100, width: WIN_WIDTH }}
        contentContainerStyle={{ margin: 3 }}
        dataProvider={dataProvider}
        layoutProvider={layoutProvider}
        rowRenderer={rowRenderer}
      />
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

//make this component available to the app
export default HomeScreen;
