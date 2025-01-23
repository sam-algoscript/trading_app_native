import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  memo,
  useMemo,
} from 'react';
import {View, Text, StyleSheet, Alert} from 'react-native';
import * as signalR from '@microsoft/signalr';
import 'react-native-url-polyfill/auto';
import MarqueeText from 'react-native-marquee';
import {WIN_HEIGHT, WIN_WIDTH} from '../constant/constant';
import * as signalRMsgPack from '@microsoft/signalr-protocol-msgpack';
import {RecyclerListView, DataProvider, LayoutProvider} from 'recyclerlistview';

const WatchListItem = memo(
  ({item, priceChanges, highLowPriceChanges, blink}) => {
    const askPriceColor = priceChanges[item?.s]?.askPriceColor;
    const bidPriceColor = priceChanges[item?.s]?.bidPriceColor;
    const highPriceColor = highLowPriceChanges[item?.s]?.highPriceColor;
    return (
      <View
        style={{
          width: (WIN_WIDTH * 98) / 100,

          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <View
          style={{
            flexDirection: 'row',
            height: (WIN_HEIGHT * 9) / 100,
            marginTop: 1,
            width: (WIN_WIDTH * 98) / 100,
            backgroundColor:
              highPriceColor === undefined ? '#F2F2F2' : highPriceColor,
            paddingVertical: (WIN_HEIGHT * 0.5) / 100,
          }}>
          <View
            style={{
              flexDirection: 'column',
              width: (WIN_WIDTH * 40) / 100,
              marginLeft: (WIN_WIDTH * 3) / 100,
            }}>
            <View style={{flexDirection: 'row'}}>
              <Text style={{fontSize: 15, fontWeight: '700'}}>{item?.es}</Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                }}>{`(${item?.ed})`}</Text>
            </View>
            <Text
              style={{
                marginTop: (WIN_HEIGHT * 1) / 100,
                fontSize: 14,
              }}>{`${item?.ch} (${item?.chp}%)`}</Text>
            <Text style={{fontSize: 13, marginTop: (WIN_HEIGHT * 1.2) / 100}}>
              {'15:33:37'}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'column',
              marginLeft: (WIN_WIDTH * 1) / 100,
              width: (WIN_WIDTH * 28) / 100,
            }}>
            <View style={{flexDirection: 'row'}}>
              <Text style={{fontSize: 13, alignSelf: 'center'}}>{'LTP: '}</Text>
              <Text
                style={{
                  fontWeight: '700',
                  fontSize: 14,
                }}>{`${item?.ltp}`}</Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                marginTop: (WIN_HEIGHT * 0.8) / 100,
              }}>
              <Text style={{fontSize: 13, alignSelf: 'center'}}>{'S: '}</Text>
              <Text
                style={{
                  fontWeight: '700',
                  fontSize: 15,
                  padding: 2,
                  color: bidPriceColor,
                }}>{`${item?.bp}`}</Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                marginTop: (WIN_HEIGHT * 0.8) / 100,
              }}>
              <Text style={{fontSize: 13, alignSelf: 'center'}}>{'L: '}</Text>
              <Text
                style={{
                  fontWeight: '700',
                  fontSize: 15,
                }}>{`${item?.lp}`}</Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: 'column',
              marginLeft: (WIN_WIDTH * 1) / 100,
              width: (WIN_WIDTH * 27.5) / 100,
            }}>
            <View style={{flexDirection: 'row'}}>
              <Text style={{fontSize: 13, alignSelf: 'center'}}>{'Qty: '}</Text>
              <Text style={{fontWeight: '700', fontSize: 13}}>{`0.00`}</Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                marginTop: (WIN_HEIGHT * 0.8) / 100,
              }}>
              <Text style={{fontSize: 13, alignSelf: 'center'}}>{'B: '}</Text>
              <Text
                style={{
                  fontWeight: '700',
                  fontSize: 15,
                  padding: 2,
                  color: askPriceColor,
                }}>{`${item?.ap}`}</Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                marginTop: (WIN_HEIGHT * 0.8) / 100,
              }}>
              <Text style={{fontSize: 13, alignSelf: 'center'}}>{'H: '}</Text>
              <Text
                style={{
                  fontWeight: '700',
                  fontSize: 14,
                }}>{`${item?.hp}`}</Text>
            </View>
          </View>
        </View>
        <View
          style={{
            borderWidth: 0.5,
            width: (WIN_WIDTH * 98) / 100,
            marginVertical: (WIN_HEIGHT * 1) / 100,
          }}
        />
      </View>
    );
  },
);

const RecyclerView = () => {
  const [data, setData] = useState([]);
  const [priceChanges, setPriceChanges] = useState({});
  const [highLowPriceChanges, setHighLowPriceChanges] = useState({});
  const [dataProvider, setDataProvider] = useState(
    new DataProvider((r1, r2) => r1 !== r2),
  );
  const dataRef = useRef(data);
  const pendingUpdates = useRef([]);

  dataRef.current = data;

  const layoutProvider = useMemo(
    () =>
      new LayoutProvider(
        index => 0,
        (type, dim) => {
          dim.width = WIN_WIDTH;
          dim.height = (WIN_HEIGHT * 11) / 100;
        },
      ),
    [],
  );

  const connectSignalR = useCallback(() => {
    const startConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://202.47.118.159:9292/signalRHub', {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect([0, 2000, 10000, 30000])
      .withHubProtocol(new signalRMsgPack.MessagePackHubProtocol())
      .build();

    startConnection.serverTimeoutInMilliseconds = 30000;

    const retryConnection = () => {
      setTimeout(() => {
        connectSignalR();
      }, 100);
    };

    const handleNewData = newData => {
      pendingUpdates.current.push(newData);
    };

    startConnection.on('ReceiveScripUpdate', handleNewData);

    startConnection
      .start()
      .then(() => {
        alert('Connected to SignalR');
      })
      .catch(err => {
        alert(`err in signalR: ${JSON.stringify(err)}`);
        console.error('Failed to start connection:', err.toString());
        retryConnection();
      });

    startConnection.onclose(error => {
      console.error('Connection closed with error:', error);
      retryConnection();
    });

    return () => {
      startConnection.stop();
    };
  }, []);

  useEffect(() => {
    connectSignalR();
  }, [connectSignalR]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (pendingUpdates.current.length > 0) {
        setData(prevData => {
          const updatedData = [...prevData];
          const newPriceChanges = {...priceChanges};
          const newHighLowPriceChanges = {...highLowPriceChanges};
          pendingUpdates.current.forEach(newData => {
            const existingIndex = updatedData.findIndex(
              item => item?.s === newData?.s,
            );

            // console.log(newData);

            if (existingIndex !== -1) {
              const prevAskPrice = updatedData[existingIndex]?.ap;
              const newAskPrice = newData?.ap;
              const prevBidPrice = updatedData[existingIndex]?.bp;
              const newBidPrice = newData?.bp;
              const prevLowPrice = updatedData[existingIndex]?.lp;
              const newLowPrice = newData?.lp;
              const prevHighPrice = updatedData[existingIndex]?.hp;
              const newHighPrice = newData?.hp;

              if (newAskPrice > prevAskPrice) {
                newPriceChanges[newData.s] = {
                  ...newPriceChanges[newData.s],
                  askPriceColor: 'green',
                };
              } else if (newAskPrice < prevAskPrice) {
                newPriceChanges[newData.s] = {
                  ...newPriceChanges[newData.s],
                  askPriceColor: 'red',
                };

              }

              if (newBidPrice > prevBidPrice) {
                newPriceChanges[newData.s] = {
                  ...newPriceChanges[newData.s],
                  bidPriceColor: 'green',
                };
              } else if (newBidPrice < prevBidPrice) {
                newPriceChanges[newData.s] = {
                  ...newPriceChanges[newData.s],
                  bidPriceColor: 'red',
                };
              }

              if (newHighPrice > prevHighPrice) {
                newHighLowPriceChanges[newData.s] = {
                  ...newHighLowPriceChanges[newData.s],
                  highPriceColor: '#e6ffe6',
                };
                setTimeout(() => {
                  setHighLowPriceChanges(prev => ({
                    ...prev,
                    [newData.s]: {
                      ...prev[newData.s],
                      highPriceColor: undefined,
                    },
                  }));
                }, 500); 
              } else if (newLowPrice < prevLowPrice) {
                newHighLowPriceChanges[newData.s] = {
                  ...newHighLowPriceChanges[newData.s],
                  highPriceColor: '#FFD6D7',
                };
                setTimeout(() => {
                  setHighLowPriceChanges(prev => ({
                    ...prev,
                    [newData.s]: {
                      ...prev[newData.s],
                      highPriceColor: undefined,
                    },
                  }));
                }, 500); 
              }

              updatedData[existingIndex] = newData;
            } else {
              updatedData.push(newData);
            }
          });

          setPriceChanges(newPriceChanges);
          setHighLowPriceChanges(newHighLowPriceChanges);
          setDataProvider(dataProvider.cloneWithRows(updatedData));
          pendingUpdates.current = [];
          return updatedData;
        });
      }
    }, 1);

    return () => clearInterval(interval);
  }, [dataProvider, priceChanges, highLowPriceChanges]);

  const rowRenderer = useCallback(
    (type, data) => (
      <WatchListItem
        item={data}
        priceChanges={priceChanges}
        highLowPriceChanges={highLowPriceChanges}
      />
    ),
    [priceChanges, highLowPriceChanges],
  );

  return (
    <View style={{flex: 1}}>
      <View style={{height: 150, backgroundColor: '#1C355D'}}>
        <MarqueeText
          style={{fontSize: 20, marginTop: 40}}
          speed={1}
          marqueeOnStart={true}
          loop={true}
          delay={10}>
          This app is only for paper trading not used real money in this app
        </MarqueeText>
      </View>

      <RecyclerListView
        style={{flex: 1}}
        contentContainerStyle={{margin: 3}}
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
  },
});

export default RecyclerView;
