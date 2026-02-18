// ws/wsHandler.ts

import { WebSocketServer } from "ws";
import { handleMessage, handleDisconnect, CustomWebSocket } from "./roomManager";

export function attachWebSocketHandlers(wss: WebSocketServer) {

    wss.on("connection", (ws: CustomWebSocket) => {

        console.log("Client connected");

        ws.on("message", (message) => {
            handleMessage(ws, message.toString());
        });

        ws.on("close", () => {
            handleDisconnect(ws);
        });

    });

}
