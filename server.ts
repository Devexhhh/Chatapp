import http from "http";
import next from "next";
import { WebSocketServer } from "ws";
import { attachWebSocketHandlers } from "./ws/wsHandler";

const PORT = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {

    const server = http.createServer((req, res) => {
        handle(req, res);
    });

    const wss = new WebSocketServer({ noServer: true });

    attachWebSocketHandlers(wss);

    server.on("upgrade", (req, socket, head) => {

        const url = new URL(req.url!, `http://${req.headers.host}`);

        if (url.pathname === "/ws") {

            wss.handleUpgrade(req, socket, head, (ws) => {
                wss.emit("connection", ws, req);
            });

        }

    });

    server.listen(PORT, "0.0.0.0", () => {
        console.log("Server running on port", PORT);
    });

});
