import { useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import { InlineNotification } from "@carbon/react";
import styles from "./style.module.scss";

export const Notification = () => {
  const [notifications, setNotifications] = useState<string[]>([]);

  const { lastMessage } = useWebSocket("ws://localhost:8000", {
    shouldReconnect: closeEvent => true,
  });

  useEffect(() => {
    if (lastMessage !== null) {
      // setNotifications(lastMessage.data);
      setNotifications(notifications => [...notifications, lastMessage.data]);
    }
  }, [lastMessage]);

  return (
    <>
      {" "}
      <div className={styles.notificationContainer}>
        {notifications &&
          notifications.map((notification, index) => (
            <InlineNotification
              className={styles.notification}
              key={index}
              kind={"info"}
              title={notification}
              onClose={event => {
                // setNotification(notification => notification.filter());
              }}
            />
          ))}
      </div>
    </>
  );
};
