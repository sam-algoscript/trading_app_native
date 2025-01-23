import * as SignalR from '@microsoft/signalr';
import * as signalRMsgPack from "@microsoft/signalr-protocol-msgpack";
import "react-native-url-polyfill/auto";

const ConnectSignalR = new SignalR.HubConnectionBuilder()
  .withUrl("http://202.47.118.159:9292/signalRHub", {
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
