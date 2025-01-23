import * as SignalR from '@microsoft/signalr';
import * as signalRMsgPack from "@microsoft/signalr-protocol-msgpack";
import "react-native-url-polyfill/auto";
import { getToken } from '../helper/AuthTokenHelper';

// const token = saveToken;
// console.log("token",token);


const ConnectSignalR = new SignalR.HubConnectionBuilder()
  .withUrl("https://trade.clustersofttech.com/signalRHub", {

    // accessTokenFactory: () => token,
    accessTokenFactory: async () => {
      const token = await getToken();
      if (!token) {
        console.error("Failed to retrieve token. Connection may fail.");
      }
      return token || "";
    },
    skipNegotiation: true,
    transport: SignalR.HttpTransportType.WebSockets,
  })
  .withAutomaticReconnect([0, 2000, 10000, 30000])
  .withHubProtocol(new signalRMsgPack.MessagePackHubProtocol())
  .build();

ConnectSignalR.onclose(() => {
  console.log("Connection closed. Attempting to reconnect...");
});

ConnectSignalR.onreconnecting(() => {
  console.log("signalr is recoonecting");
});
ConnectSignalR.onreconnected(() => {
  console.log("signalr is reconnected");
});

export default ConnectSignalR;
