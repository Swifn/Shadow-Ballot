import { useEffect, useState, useContext } from "react";
import { WebSocketContext } from "./index";

export const Notification = () => {
  const ws = useContext(WebSocketContext)?.ws;
  const [notification, setNotification] = useState("");

  useEffect(() => {
    if (ws) {
      ws.onmessage = event => {
        setNotification(event.data);
      };
    }
  }, [ws]);

  return <div>{notification}</div>;
};
