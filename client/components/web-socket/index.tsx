import { useEffect, createContext, useRef } from "react";

interface WebSocketContextType {
  ws: WebSocket | null;
}
export const WebSocketContext = createContext<WebSocketContextType | null>(
  null
);

export const WebSocketProvider = ({ children }) => {
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8000");
    ws.current.onopen = () => console.log("WebSocket opened");
    ws.current.onclose = () => console.log("WebSocket closed");
    ws.current.onmessage = event => {
      console.log("WebSocket message received:", event.data);
    };
    ws.current.onerror = error => {
      console.error("WebSocket error:", error);
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ ws: ws.current }}>
      {children}
    </WebSocketContext.Provider>
  );
};
