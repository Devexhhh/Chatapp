// ws/roomManager.ts

import { WebSocket } from "ws";

export interface CustomWebSocket extends WebSocket {
    roomId?: string;
    username?: string;
}

interface Room {
    clients: Set<CustomWebSocket>;
}

const rooms = new Map<string, Room>();

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

export function handleMessage(ws: CustomWebSocket, raw: string) {

    let data: any;
    try {
        data = JSON.parse(raw);
    } catch {
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
            message: `${ws.username} joined`
        });
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

}

export function handleDisconnect(ws: CustomWebSocket) {

    if (!ws.roomId) return;

    const room = rooms.get(ws.roomId);
    if (!room) return;

    room.clients.delete(ws);

    broadcast(room, {
        type: "system",
        message: `${ws.username} left`
    });

    if (room.clients.size === 0) {
        rooms.delete(ws.roomId);
    }
}
