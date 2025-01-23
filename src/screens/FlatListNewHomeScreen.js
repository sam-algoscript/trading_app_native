import React, {
    useCallback,
    useEffect,
    useState,
  } from "react";
  import { View, Text, StyleSheet, SafeAreaView, FlatList, TextInput } from "react-native";
  import { useSelector } from "react-redux";
  import { WIN_HEIGHT, WIN_WIDTH } from "../constant/constant";
  import ConnectSignalR from "../components/ConnectSignalR";
  import MarqueeText from "react-native-marquee";
  import WatchListItem from "../components/WatchListItem";
  import { sortData } from "../helper/helper";
  
  const FlatListNewHomeScreen = () => {
    const [transformData, setTransformData] = useState([]);
    const [currentWatchListName, setCurrentWatchListName] = useState("");
    const [previousWatchListName, setPreviousWatchListName] = useState("");
    const [currentScripts, setCurrentScripts] = useState([]);
    const [previousScripts, setPreviousScripts] = useState([]);
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [priceChanges, setPriceChanges] = useState({});
    const [highLowPriceChanges, setHighLowPriceChanges] = useState({});
    const [search, setSearch] = useState('');
  
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
        if (transformedData.length > 0) {
          const defaultWatchList = transformedData[0];
          setCurrentWatchListName(defaultWatchList.watchlistName);
          setCurrentScripts(defaultWatchList.script);
        }
      }
    }, [clientWatchListData]);
  
    useEffect(() => {
      ConnectSignalR.on("OnSubscribeFinished", (msg) => {});
      ConnectSignalR.on("OnUnsubscribeFinished", (msg) => {
        setData([]);
        setFilteredData([]);
      });
  
      const handleNewData = (newData) => {
        setData((prevData) => {
          const updatedData = [...prevData];
          const newPriceChanges = { ...priceChanges };
          const newHighLowPriceChanges = { ...highLowPriceChanges };
          const existingIndex = updatedData.findIndex(
            (item) => item.es === newData.es
          );
          if (existingIndex !== -1) {
            const prevAskPrice = updatedData[existingIndex]?.ap;
            const newAskPrice = newData?.ap;
            const prevBidPrice = updatedData[existingIndex]?.bp;
            const newBidPrice = newData?.bp;
            const prevLowPrice = updatedData[existingIndex]?.lp;
            const newLowPrice = newData?.lp;
            const prevHighPrice = updatedData[existingIndex]?.hp;
            const newHighPrice = newData?.hp;
  
            // Handle Ask Price
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
                bidPriceColor: "green",
              };
            } else if (newBidPrice < prevBidPrice) {
              newPriceChanges[newData.s] = {
                ...newPriceChanges[newData.s],
                bidPriceColor: "red",
              };
            }
  
            // Handle High Price
            if (newHighPrice > prevHighPrice) {
              newHighLowPriceChanges[newData.s] = {
                ...newHighLowPriceChanges[newData.s],
                highPriceColor: "#e6ffe6",
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
                lowPriceColor: "#FFD6D7",
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
            };
            getOnsubscribe();
          }, 2000);
        }
      };
      connection();
    }, [currentScripts, previousScripts]);
  
    const renderItem = ({ item }) => (
      <WatchListItem
        item={item}
        priceChanges={priceChanges}
        highLowPriceChanges={highLowPriceChanges}
      />
    );
  
    const handleWatchListPress = (watchlistName) => {
      const currentData = transformData.find(
        (item) => item.watchlistName === watchlistName
      );
  
      if (currentWatchListName && currentWatchListName !== watchlistName) {
        setPreviousWatchListName(currentWatchListName);
        setPreviousScripts(currentScripts);
      }
  
      setCurrentWatchListName(watchlistName);
      setCurrentScripts(currentData?.script || []);
    };
  
    const renderWatchListName = ({ item }) => (
      <View>
        <Text onPress={() => handleWatchListPress(item?.watchlistName)}>
          {item?.watchlistName}
        </Text>
      </View>
    );
  
    return (
      <View style={styles.container}>
        <SafeAreaView style={{ backgroundColor: "#1C355D" }} />
        <View style={{ height: (WIN_HEIGHT * 18) / 100, backgroundColor: "#1C355D" }}>
          <MarqueeText
            style={{ fontSize: 20, marginTop: 40 }}
            speed={1}
            marqueeOnStart={true}
            loop={true}
            delay={10}
          >
            This app is only for paper trading not used real money in this app
          </MarqueeText>
          <TextInput
            style={styles.searchInput}
            onChangeText={(text) => setSearch(text)}
          />
          <FlatList
            data={transformData}
            renderItem={renderWatchListName}
            horizontal
          />
        </View>
  
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.s}
          contentContainerStyle={{ margin: 3 }}
          style={{ height: (WIN_HEIGHT * 70) / 100, width: WIN_WIDTH }}
        />
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#ffffff",
    },
    searchInput: {
      height: WIN_HEIGHT * 4.5 / 100,
      borderWidth: 1,
      width: WIN_WIDTH * 75 / 100,
      marginVertical: WIN_HEIGHT * 0.5 / 100,
      marginLeft: WIN_WIDTH * 2 / 100,
      borderColor: "#FFFF",
      borderRadius: WIN_WIDTH * 2 / 100,
    },
  });
  
  export default FlatListNewHomeScreen;
  