import { WebSocketServer } from "ws";
import { handleMessage, handleDisconnect, CustomWebSocket } from "./roomManager";

export function attachWebSocketHandlers(wss: WebSocketServer) {

    wss.on("connection", (ws: CustomWebSocket) => {

        console.log("Client connected");

        ws.isAlive = true;

        ws.on("pong", () => {
            ws.isAlive = true;
        });

        ws.on("message", (message) => {
            handleMessage(ws, message.toString());
        });

        ws.on("close", () => {
            handleDisconnect(ws);
        });

    });

    //
    // Heartbeat loop
    //
    setInterval(() => {

        wss.clients.forEach((ws: CustomWebSocket) => {

            if (!ws.isAlive) {
                console.log("Terminating dead client");
                return ws.terminate();
            }

            ws.isAlive = false;
            ws.ping();

        });

    }, 30000);
}
