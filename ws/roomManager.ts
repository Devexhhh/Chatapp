import { WebSocket } from "ws";

//
// Extend WebSocket
//
export interface CustomWebSocket extends WebSocket {
    roomId?: string;
    username?: string;
    isAlive?: boolean;
}

//
// Client metadata
//
interface ClientMeta {
    username: string;
    roomId: string;
    joinedAt: number;
}

const clientMeta = new Map<CustomWebSocket, ClientMeta>();

//
// Room structure
//
interface Room {
    clients: Set<CustomWebSocket>;
}

const rooms = new Map<string, Room>();

//
// Helpers
//
function generateRoomId(): string {
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

function getRoomUsers(room: Room): string[] {
    return Array.from(room.clients)
        .map(ws => clientMeta.get(ws)?.username)
        .filter(Boolean) as string[];
}

//
// Message handler
//
export function handleMessage(ws: CustomWebSocket, raw: string) {

    let data: any;

    try {
        data = JSON.parse(raw);
    } catch {
        return;
    }

    //
    // CREATE ROOM
    //
    if (data.type === "create") {

        const roomId = generateRoomId();

        const room: Room = {
            clients: new Set([ws])
        };

        rooms.set(roomId, room);

        ws.roomId = roomId;
        ws.username = data.username;

        clientMeta.set(ws, {
            username: data.username,
            roomId,
            joinedAt: Date.now()
        });

        ws.send(JSON.stringify({
            type: "room_created",
            roomId
        }));

        broadcast(room, {
            type: "presence",
            users: getRoomUsers(room)
        });
    }

    //
    // JOIN ROOM
    //
    else if (data.type === "join") {

        const room = rooms.get(data.roomId);

        if (!room) {
            ws.send(JSON.stringify({
                type: "error",
                message: "Room not found"
            }));
            return;
        }

        // 🚨 Prevent duplicate join
        const existingMeta = clientMeta.get(ws);

        if (existingMeta && existingMeta.roomId === data.roomId) {
            console.log("User already in room, ignoring duplicate join");
            return;
        }

        room.clients.add(ws);

        ws.roomId = data.roomId;
        ws.username = data.username;

        clientMeta.set(ws, {
            username: data.username,
            roomId: data.roomId,
            joinedAt: Date.now()
        });

        broadcast(room, {
            type: "system",
            message: `${ws.username} joined`
        });

        broadcast(room, {
            type: "presence",
            users: getRoomUsers(room)
        });
    }
    //
    // MESSAGE
    //
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
}

//
// Disconnect handler
//
export function handleDisconnect(ws: CustomWebSocket) {

    const meta = clientMeta.get(ws);

    if (!meta) return;

    const room = rooms.get(meta.roomId);

    clientMeta.delete(ws);

    if (!room) return;

    room.clients.delete(ws);

    broadcast(room, {
        type: "system",
        message: `${meta.username} left`
    });

    broadcast(room, {
        type: "presence",
        users: getRoomUsers(room)
    });

    if (room.clients.size === 0) {
        rooms.delete(meta.roomId);
    }
}
