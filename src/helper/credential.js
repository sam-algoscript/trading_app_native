// {
//     "userName": "SAdmin",
//     "password": "12345",
//     "role": "SuperAdmin"
//   }
  
  
//   {
//     "userName": "1",
//     "password": "123456",
//     "role": "Client"
//   }
  
//   {
//     "userName": "Master",
//     "password": "12345",
//     "role": "Master"
//   }


//   const [data, setData] = useState([]);
//   const [priceChanges, setPriceChanges] = useState({});
//   const [highLowPriceChanges, setHighLowPriceChanges] = useState({});
//   const [transformData, setTransformData] = useState([]);
//   const [currentData, setCurrentData] = useState([]);
//   const [previousData, setPreviousData] = useState([]);
//   const [watchListName, setWatchListName] = useState("");

//   const pendingUpdates = useRef([]);
//   const [dataProvider, setDataProvider] = useState(
//     new DataProvider((r1, r2) => r1 !== r2)
//   );
//   const layoutProvider = useMemo(
//     () =>
//       new LayoutProvider(
//         (index) => 0,
//         (type, dim) => {
//           dim.width = WIN_WIDTH;
//           dim.height = (WIN_HEIGHT * 11) / 100;
//         }
//       ),
//     []
//   );

//   const clientWatchListData = useSelector(
//     (state) => state?.user?.clientWatchListData
//   );

//   useEffect(() => {
//     if (clientWatchListData && Object.keys(clientWatchListData).length > 0) {
//       const transformedData = Object.entries(clientWatchListData).map(
//         ([key, scripts]) => {
//           const [id, watchlistName] = key.split(":");
//           return {
//             id,
//             watchlistName,
//             script: scripts,
//           };
//         }
//       );
//       setTransformData(transformedData);
//       setWatchListName(transformedData[0]?.watchlistName || "");
//     }
//   }, [clientWatchListData]);

//   useEffect(() => {
//   const connectData = async () => {
//     try {
//       console.log("Unsubscribing from previous data:", previousData);
//       await ConnectSignalR.invoke("OnUnSubscribe", previousData);
      
//       if (currentData?.length > 0) {
//         console.log("Subscribing to current data:", currentData.map(item => item.s));
//         await ConnectSignalR.invoke("OnSubscribe", currentData.map(item => item.s));
//       }

//       const handleNewData = (newData) => {
//         console.log("New Data Received:", newData);
//         console.log("Current Data:", currentData);
//         if (currentData.find(item => item.s === newData.s)) {
//           console.log("Adding to pending updates:", newData);
//           pendingUpdates.current.push(newData);
//         } else {
//           console.log("New data not found in currentData:", newData);
//         }
//       };

//       ConnectSignalR.on("ReceiveSubscribedScriptUpdate", handleNewData);

//       return () => {
//         ConnectSignalR.off("ReceiveSubscribedScriptUpdate", handleNewData);
//         console.log("SignalR event handler removed");
//       };
//     } catch (error) {
//       console.error("Error in SignalR connection:", error.message);
//       console.error("Stack trace:", error.stack);
//       // Optionally, display an alert or message to the user
//     }
//   };

//   connectData();
// }, [currentData, previousData]);

  

//   useEffect(() => {
//     if (watchListName) {
//       const getData = transformData.find(
//         (data) => data?.watchlistName === watchListName
//       );

//       console.log("Transform Data:", transformData);
//       console.log("Current Data:", getData?.script);

//       setPreviousData(currentData);
//       // Ensure currentData is an array of objects with 's' property
//       setCurrentData(getData?.script.map(item => ({ s: item.s })) || []);

//       setTimeout(() => {
//         console.log("Unsubscribing from previous data:", previousData);
//         ConnectSignalR.invoke("OnUnSubscribe", previousData);
//         console.log("Subscribing to new data:", getData?.script || []);
//         ConnectSignalR.invoke("OnSubscribe", getData?.script || []);
//       }, 2000);
//     }
//   }, [watchListName]);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       console.log("Interval running");
//       console.log("Pending updates:", pendingUpdates.current);

//       if (pendingUpdates.current.length > 0) {
//         console.log("Processing pending updates");

//         setData((prevData) => {
//           const updatedData = [...prevData];
//           const newPriceChanges = { ...priceChanges };
//           const newHighLowPriceChanges = { ...highLowPriceChanges };

//           pendingUpdates.current.forEach((newData) => {
//             console.log("Processing New Data:", newData);

//             const existingIndex = updatedData.findIndex(
//               (item) => item?.s === newData?.s
//             );

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

//           console.log("Updated Data:", updatedData);
//           setPriceChanges(newPriceChanges);
//           setHighLowPriceChanges(newHighLowPriceChanges);
//           setDataProvider(dataProvider.cloneWithRows(updatedData));
//           pendingUpdates.current = [];
//           return updatedData;
//         });
//       }
//     }, 100);

//     return () => clearInterval(interval);
//   }, [priceChanges, highLowPriceChanges, dataProvider]);