import http from "http";
import next from "next";
import { WebSocketServer, WebSocket } from "ws";

interface CustomWebSocket extends WebSocket {
    roomId?: string;
    username?: string;
}

interface Room {
    clients: Set<CustomWebSocket>;
}

type RoomId = string;


const rooms = new Map<RoomId, Room>();

function generateRoomId(): RoomId {
    return Math.random().toString(36).substring(2, 8);
}

function broadcast(room: Room, data: any) {
    const msg = JSON.stringify(data);
    room.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(msg);
        }
    });
}

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {

    const server = http.createServer((req, res) => {
        handle(req, res);
    });

    const wss = new WebSocketServer({ noServer: true });

    server.on("upgrade", (req, socket, head) => {

        const url = new URL(req.url!, `http://${req.headers.host}`);

        if (url.pathname === "/ws") {

            wss.handleUpgrade(req, socket, head, (ws) => {
                wss.emit("connection", ws, req);
            });

        }
    });

    wss.on("connection", (ws: CustomWebSocket) => {

        console.log("✅ Client connected");

        ws.on("message", (message) => {

            console.log("📩 Received:", message.toString());

            let data: any;

            try {
                data = JSON.parse(message.toString());
            } catch {
                console.log("Invalid JSON");
                return;
            }

            if (data.type === "create") {

                const roomId = generateRoomId();

                const room: Room = {
                    clients: new Set([ws])
                };

                rooms.set(roomId, room);

                ws.roomId = roomId;
                ws.username = data.username;

                ws.send(JSON.stringify({
                    type: "room_created",
                    roomId
                }));

                console.log("🏠 Room created:", roomId);
            }

            else if (data.type === "join") {

                const room = rooms.get(data.roomId);

                if (!room) {
                    ws.send(JSON.stringify({
                        type: "error",
                        message: "Room not found"
                    }));
                    return;
                }

                room.clients.add(ws);

                ws.roomId = data.roomId;
                ws.username = data.username;

                broadcast(room, {
                    type: "system",
                    message: `${ws.username} joined`,
                    count: room.clients.size
                });

                console.log(`${ws.username} joined ${data.roomId}`);
            }

            else if (data.type === "message") {

                if (!ws.roomId) return;

                const room = rooms.get(ws.roomId);

                if (!room) return;

                broadcast(room, {
                    type: "message",
                    username: ws.username,
                    message: data.message
                });

            }

        });

        ws.on("close", () => {

            if (!ws.roomId) return;

            const room = rooms.get(ws.roomId);

            if (!room) return;

            room.clients.delete(ws);

            broadcast(room, {
                type: "system",
                message: `${ws.username} left`,
                count: room.clients.size
            });

            if (room.clients.size === 0) {
                rooms.delete(ws.roomId);
                console.log("🗑 Room deleted:", ws.roomId);
            }

        });

    });

    server.listen(3000, () => {
        console.log("🚀 Server running at http://localhost:3000");
        console.log("🔌 WebSocket endpoint at ws://localhost:3000/ws");
    });

});
