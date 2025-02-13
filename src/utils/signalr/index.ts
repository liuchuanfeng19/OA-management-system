import * as signalR from "@microsoft/signalr";
import { getBaseUrl } from "@/utils/http";

//const reconnectTimeArray = [0, 2000, 10000, 30000];//withAutomaticReconnect开启重连，默认重连4次，分别时间间隔为：0、2、10和30秒
const reconnectTimeArray = [];
for (let i = 1; i < 10000; i++) {
  reconnectTimeArray.push(10000); //10s
}

const signalr = new signalR.HubConnectionBuilder()
  .withUrl(getBaseUrl("DOMAIN_BUS") + "/SignalR/Hubs/HomeNoticeHub")
  .withAutomaticReconnect(reconnectTimeArray)
  .configureLogging(signalR.LogLevel.Error)
  .build();

async function start() {
  try {
    //debugger;
    if (signalr.state != "Disconnected") return;

    await signalr.start();
    console.log("staffNoticeHub connected");
  } catch (err) {
    console.error("staffNoticeHub connected error: ", err);
    setTimeout(() => start(), 5000);
  }
}

// signalr.onreconnecting(() => {
//   console.log("staffNoticeHub reconnecting");
// });

// signalr.onreconnected(() => {
//   console.log("staffNoticeHub reconnected");
// });

signalr.onclose(async () => {
  await start();
});

async function register(staffId) {
  if (signalr.state != "Connected") {
    await start();
  }
  signalr.invoke("Register", staffId).catch(function (err) {
    return console.error("staffNoticeHub register error", err);
  });
}

//await start();

export default {
  signalr: signalr,
  start: start,
  register: register
};
