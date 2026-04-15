import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "http";
import { Server } from "http";
import jwt from "jsonwebtoken";
import config from "../config";
import { WsNotification } from "./ws.events";

// ── Connected client ka type
interface WsClient {
  ws: WebSocket;
  userId?: string;
  tenantId?: string;
  role?: string;
  isAlive: boolean;
}

// ── Global clients map
const clients = new Map<string, WsClient>();

// ── WebSocket Server create karo
export const createWsServer = (server: Server): WebSocketServer => {
  const wss = new WebSocketServer({ server, path: "/ws" });

  console.log("✅ WebSocket server initialized on /ws");

  // ── Ping/Pong heartbeat — dead connections remove karo
  const heartbeat = setInterval(() => {
    clients.forEach((client, id) => {
      if (!client.isAlive) {
        client.ws.terminate();
        clients.delete(id);
        return;
      }
      client.isAlive = false;
      client.ws.ping();
    });
  }, 30000);

  wss.on("close", () => clearInterval(heartbeat));

  // ── New connection
  wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
    const clientId = `client_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    // Token se user info nikalo
    let userId: string | undefined;
    let tenantId: string | undefined;
    let role: string | undefined;

    try {
      const url = new URL(req.url || "", `ws://${req.headers.host}`);
      const token = url.searchParams.get("token");

      if (token) {
        const decoded = jwt.verify(token, config.jwtSecret) as any;
        userId = decoded.userId;
        tenantId = decoded.tenantId;
        role = decoded.role;
      }
    } catch {
      // Token invalid — guest connection
    }

    // Client register karo
    clients.set(clientId, { ws, userId, tenantId, role, isAlive: true });

    console.log(`📡 WS Client connected: ${clientId} (${role || "guest"})`);

    // Welcome message bhejo
    sendToClient(ws, {
      id: clientId,
      type: "connected",
      title: "Connected",
      message: `Welcome! Real-time notifications active hain.`,
      severity: "info",
      timestamp: new Date().toISOString(),
    });

    // Pong handle karo
    ws.on("pong", () => {
      const client = clients.get(clientId);
      if (client) client.isAlive = true;
    });

    // Client messages handle karo
    ws.on("message", (data: Buffer) => {
      try {
        const msg = JSON.parse(data.toString());

        if (msg.type === "ping") {
          sendToClient(ws, {
            id: `pong_${Date.now()}`,
            type: "pong",
            title: "Pong",
            message: "alive",
            severity: "info",
            timestamp: new Date().toISOString(),
          });
        }
      } catch {
        // Invalid message — ignore
      }
    });

    // Disconnect handle karo
    ws.on("close", () => {
      clients.delete(clientId);
      console.log(`📡 WS Client disconnected: ${clientId}`);
    });

    ws.on("error", (err) => {
      console.error(`WS Error for ${clientId}:`, err.message);
      clients.delete(clientId);
    });
  });

  return wss;
};

// ── Helper: Ek client ko message bhejo
const sendToClient = (ws: WebSocket, notification: any): void => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(notification));
  }
};

// ── Sabko broadcast karo
export const broadcast = (notification: WsNotification): void => {
  let sent = 0;
  clients.forEach((client) => {
    if (
      client.ws.readyState === WebSocket.OPEN &&
      (!notification.tenantId || client.tenantId === notification.tenantId)
    ) {
      sendToClient(client.ws, notification);
      sent++;
    }
  });
  console.log(`📡 Broadcast sent to ${sent} clients: ${notification.type}`);
};

// ── Specific tenant ko bhejo
export const broadcastToTenant = (
  tenantId: string,
  notification: WsNotification,
): void => {
  notification.tenantId = tenantId;
  broadcast(notification);
};

// ── Specific user ko bhejo
export const sendToUser = (
  userId: string,
  notification: WsNotification,
): void => {
  clients.forEach((client) => {
    if (client.userId === userId && client.ws.readyState === WebSocket.OPEN) {
      sendToClient(client.ws, notification);
    }
  });
};

// ── Connected clients count
export const getConnectedCount = (): number => clients.size;

export default { createWsServer, broadcast, broadcastToTenant, sendToUser };
