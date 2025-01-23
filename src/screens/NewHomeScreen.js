import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
} from "react-native";
import { useSelector } from "react-redux";
import { WIN_HEIGHT, WIN_WIDTH } from "../constant/constant";
import ConnectSignalR from "../components/ConnectSignalR";
import {
  DataProvider,
  LayoutProvider,
  RecyclerListView,
} from "recyclerlistview";
import MarqueeText from "react-native-marquee";
import WatchListItem from "../components/WatchListItem";
import { sortData } from "../helper/helper";

const NewHomeScreen = () => {
  const [transformData, setTransformData] = useState([]);
  const [currentWatchListName, setCurrentWatchListName] = useState("");
  const [previousWatchListName, setPreviousWatchListName] = useState("");
  const [currentScripts, setCurrentScripts] = useState([]);
  const [previousScripts, setPreviousScripts] = useState([]);
  const [data, setData] = useState([]);
  // const [filteredData, setFilteredData] = useState([]);
  const [priceChanges, setPriceChanges] = useState({});
  const [highLowPriceChanges, setHighLowPriceChanges] = useState({});
  // const [search, setSearch] = useState("");
  const [dataProvider, setDataProvider] = useState(
    new DataProvider((r1, r2) => r1 !== r2) 
  );
  const clientWatchListData = useSelector(
    (state) => state?.user?.clientWatchListData
  );
  // // console.log(clientWatchListData);

  const layoutProvider = useMemo(
    () =>
      new LayoutProvider(
        (index) => 0, // Item type
        (type, dim) => {
          dim.width = WIN_WIDTH;
          dim.height = (WIN_HEIGHT * 11) / 100;
        }
      ),
    []
  );
  useEffect(() => {
    console.log(typeof clientWatchListData ,"type of data")
    if (clientWatchListData && Object.keys(clientWatchListData).length > 0) {
      console.log(typeof Object.entries(clientWatchListData))
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
      if (transformedData?.length > 0) {
        const defaultWatchList = transformedData[0];
        console.log('defaultWatchList:', defaultWatchList);
        console.log('defaultWatchList.script:', defaultWatchList.script);
        if (Array.isArray(defaultWatchList.script)) {
          setCurrentWatchListName(defaultWatchList.watchlistName);
          setCurrentScripts(defaultWatchList.script);
        } else {
          console.error('Expected script to be an array');
        }
        setCurrentWatchListName(defaultWatchList.watchlistName);
        setCurrentScripts(defaultWatchList?.script);
      }
    }
  }, []);

  useEffect(() => {
    ConnectSignalR.on("OnSubscribeFinished", (msg) => {
      // console.log("OnSubscribeFinished", msg);
    });
    ConnectSignalR.on("OnUnsubscribeFinished", (msg) => {
      // console.log("OnUnsubscribeFinished", msg);
      setData([]);
      // setPreviousData([]);
      // setFilteredData([]);
    });

    const handleNewData = (newData) => {
      console.log(Array.isArray(newData),"hello im array ");
      setData((prevData) => {
        const updatedData = [...prevData];
        const newPriceChanges = { ...priceChanges };
        const newHighLowPriceChanges = { ...highLowPriceChanges };
        const existingIndex = updatedData.findIndex(
          (item) => item.es === newData.es
        );
        if (existingIndex !== -1) {
          const prevAskPrice = updatedData[existingIndex]?.ap;
          const newAskPrice = (newData?.ap);
          const prevBidPrice = updatedData[existingIndex]?.bp;
          const newBidPrice = newData?.bp;
          const prevLowPrice = updatedData[existingIndex]?.lp;
          const newLowPrice = newData?.lp;
          const prevHighPrice = updatedData[existingIndex]?.hp;
          const newHighPrice = newData?.hp;

          if (newAskPrice > prevAskPrice) {
            newPriceChanges[newData.s] = {
              ...newPriceChanges[newData.s],
              askPriceColor: "green",
            };
          } else if (newAskPrice < prevAskPrice) {
            newPriceChanges[newData.s] = {
              ...newPriceChanges[newData.s],
              askPriceColor: "red",
            };
          }

          // Handle Bid Price
          if (newBidPrice > prevBidPrice) {
            newPriceChanges[newData.s] = {
              ...newPriceChanges[newData.s],
              bidPriceColor: "green", // Set color to green
            };
          } else if (newBidPrice < prevBidPrice) {
            newPriceChanges[newData.s] = {
              ...newPriceChanges[newData.s],
              bidPriceColor: "red", // Set color to red
            };
          }

          // Handle High Price
          if (newHighPrice > prevHighPrice) {
            newHighLowPriceChanges[newData.s] = {
              ...newHighLowPriceChanges[newData.s],
              highPriceColor: "#e6ffe6", // Set background color
            };
            setTimeout(() => {
              setHighLowPriceChanges((prev) => ({
                ...prev,
                [newData.s]: {
                  ...prev[newData.s],
                  highPriceColor: undefined,
                },
              }));
            }, 500);
          }

          // Handle Low Price
          if (newLowPrice < prevLowPrice) {
            newHighLowPriceChanges[newData.s] = {
              ...newHighLowPriceChanges[newData.s],
              lowPriceColor: "#FFD6D7", // Set background color
            };
            setTimeout(() => {
              setHighLowPriceChanges((prev) => ({
                ...prev,
                [newData.s]: {
                  ...prev[newData.s],
                  lowPriceColor: undefined,
                },
              }));
            }, 500);
          }

          updatedData[existingIndex] = newData;
        } else {
          updatedData.push(newData);
        }
        setPriceChanges(newPriceChanges);
        setHighLowPriceChanges(newHighLowPriceChanges);
        setDataProvider(dataProvider.cloneWithRows(updatedData));

        return updatedData;
      });
    };
    ConnectSignalR.on("ReceiveSubscribedScriptUpdate", handleNewData);
  }, []);

  useEffect(() => {
    const connection = async () => {
      await ConnectSignalR.invoke("OnUnsubscribe", previousScripts);
      if (currentScripts?.length > 0) {
        setTimeout(() => {
          console.log("OnSubscribe called from timeout");
          const getOnsubscribe = async () => {
            await ConnectSignalR.invoke("OnSubscribe", currentScripts);
            console.log("subscribed", currentScripts);
          };
          getOnsubscribe();
        }, [2000]);
      }
    };
    connection();
  }, [currentScripts, previousScripts]);

  const rowRenderer = useCallback(
    (type, data) => {
      return (
        <WatchListItem
          item={data}
          priceChanges={priceChanges}
          highLowPriceChanges={highLowPriceChanges}
        />
      );
    },
    [priceChanges, highLowPriceChanges]
  );
  // console.log(data);
  

  const handleWatchListPress = (watchlistName) => {
    console.log("called from watchlist click");
    
    const currentData = transformData.find(
      (item) => item.watchlistName === watchlistName
    );

    // Update previous watchlist and scripts
    if (currentWatchListName && currentWatchListName !== watchlistName) {
      setPreviousWatchListName(currentWatchListName);
      setPreviousScripts(currentScripts);
    }

    // Update current watchlist and scripts
    setCurrentWatchListName(watchlistName);
    setCurrentScripts(currentData?.script || []);
  };

  const renderItem = ({ item }) => {
    return (
      <View>
        <Text onPress={() => handleWatchListPress(item?.watchlistName)}>
          {item?.watchlistName}
        </Text>
      </View>
    );
  };
  const onChange = async (text) => {
    console.log(text?.length);
    if (text?.length > 0) {
      const filteredItems = currentScripts.filter((item) => {
        // Remove "NSE:" or "MCX:" prefix for search purposes only
        const strippedItem = item.replace(/^NSE:|^MCX:/, "");
        console.log("Stripped Item:", strippedItem);

        // Check if the search text is included in the stripped item
        return strippedItem.toLowerCase().includes(text.toLowerCase());
      });

      await ConnectSignalR.invoke("OnUnsubscribe", currentScripts);
      if (currentScripts?.length > 0) {
        setTimeout(() => {
          console.log("OnSubscribe called from timeout");
          const getOnsubscribe = async () => {
            await ConnectSignalR.invoke("OnSubscribe", filteredItems);
            console.log("subscribed", filteredItems);
          };
          getOnsubscribe();
        }, [2000]);
      }
      // setPreviousScripts(currentScripts);
      // setCurrentScripts(filteredItems);
    } else {
      console.log(currentWatchListName);
      const currentData = transformData.find(
        (item) => item.watchlistName === currentWatchListName
      );
      setPreviousScripts(currentScripts);
      setCurrentScripts(currentData?.script || []);
    }
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
        <View style={{flexDirection:'row',alignItems:'center'}}>

        <TextInput
          style={{
            height: (WIN_HEIGHT * 4.5) / 100,
            borderWidth: 1,
            width: (WIN_WIDTH * 75) / 100,
            marginVertical: (WIN_HEIGHT * 0.5) / 100,
            marginLeft: (WIN_WIDTH * 2) / 100,
            borderColor: "#FFFF",
            borderRadius: (WIN_WIDTH * 2) / 100,
          }}
          onChangeText={(text) => onChange(text)}
        />
        <Text>{'Hello'}</Text>
        </View>
        <FlatList data={transformData} renderItem={renderItem} horizontal />
      </View>

      <RecyclerListView
        style={{ height: (WIN_HEIGHT * 70) / 100, width: WIN_WIDTH }}
        contentContainerStyle={{ margin: 3 }}
        dataProvider={dataProvider}
        layoutProvider={layoutProvider}
        rowRenderer={rowRenderer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
});

export default NewHomeScreen;
