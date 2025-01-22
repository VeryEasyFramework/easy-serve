import { EasyRequest } from "../../../mod.ts";
class SocketRoom {
  roomName: string;

  clients: string[] = [];
  users: User[] = [];
  constructor(roomName: string) {
    this.roomName = roomName;
  }
}

interface User {
  id: string;
  // name: string;
  // email: string;
}
export interface RealtimeClient {
  id: string;
  socket: WebSocket;
  user: User;
  rooms: string[];
}

export interface RealtimeRoomDef {
  roomName: string;
  description?: string;
}
export interface RealtimeMessage {
  room: string;
  event: string;
  data: Record<string, any>;
}

export interface RealtimeClientMessage extends RealtimeMessage {
  type: "join" | "leave" | "message";
}

export class RealtimeHandler {
  clients: Map<string, RealtimeClient>;

  channel: BroadcastChannel;
  rooms: Record<string, SocketRoom> = {};

  roomHandlers: Map<
    string,
    (client: RealtimeClient, message: RealtimeMessage) => void
  >;
  info: {
    rooms: Array<RealtimeRoomDef>;
  } = {
    rooms: [],
  };
  constructor() {
    this.roomHandlers = new Map();
    this.clients = new Map();
    this.channel = new BroadcastChannel("realtime");
    this.channel.addEventListener(
      "message",
      (
        messageEvent: MessageEvent<RealtimeMessage>,
      ) => {
        const { room, event, data } = messageEvent.data;
        this.sendToRoom(room, event, data);
      },
    );
  }

  addRoomHandler(
    room: string,
    handler: (client: RealtimeClient, message: RealtimeMessage) => void,
  ) {
    this.roomHandlers.set(room, handler);
  }
  handleUpgrade(inRequest: EasyRequest): Response {
    if (inRequest.upgradeSocket) {
      const { socket, response } = Deno.upgradeWebSocket(
        inRequest.request,
      );
      this.addClient(socket);
      return response;
    }

    return new Response("request isn't trying to upgrade to websocket.", {
      status: 400,
    });
  }

  private addClient(socket: WebSocket) {
    const id = Math.random().toString(36).substring(7);
    const client: RealtimeClient = {
      id,
      socket,
      user: {
        id,
      },
      rooms: [],
    };
    this.addListeners(client);
    return client.id;
  }
  private addListeners(client: RealtimeClient) {
    client.socket.onopen = () => {
      this.clients.set(client.id, client);
      this.handleConnection(client);
    };
    client.socket.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch (e) {
        console.error("Error parsing JSON data from client", e);
      }
      this.handleMessage(client, data);
    };
    client.socket.onclose = () => {
      this.handleClose(client);

      this.clients.delete(client.id);
    };
  }
  handleConnection(client: RealtimeClient) {
  }
  leave(room: string, client: RealtimeClient, data: any): void {
    this.validateRoom(room);
    const newClintsList = this.rooms[room].clients.filter((c) =>
      c !== client.id
    );
    this.notify(room, "leave", {
      room,
      user: client.user,
      users: newClintsList,
    });
    this.rooms[room].clients = this.rooms[room].clients.filter((c) =>
      c !== client.id
    );

    // this.rooms[room].users = this.rooms[room].users.filter((u) =>
    //   u?.id && u.id !== client.user?.id
    // );

    if (client) {
      if (client.rooms.includes(room)) {
        client.rooms = client.rooms.filter((r) => r !== room);
      }
    }
  }

  notify(room: string, event: string, data: Record<string, any>) {
    this.sendToRoom(
      room,
      event,
      data,
    );
    this.channel.postMessage({
      room,
      event,
      data,
    });
  }
  private validateRoom(room: string) {
    if (!this.rooms[room]) {
      this.addRoom({
        roomName: room,
      });
      return;
    }
  }

  addRoom(room: RealtimeRoomDef) {
    if (this.rooms[room.roomName]) {
      return;
    }
    this.rooms[room.roomName] = new SocketRoom(room.roomName);
    this.info.rooms.push(room);
  }

  addRooms(rooms: RealtimeRoomDef[]) {
    for (const room of rooms) {
      this.addRoom(room);
    }
  }
  private sendToRoom(room: string, event: string, data: Record<string, any>) {
    this.validateRoom(room);

    this.rooms[room].clients.forEach((clientId, index) => {
      const client = this.clients.get(clientId);
      if (!client) {
        this.rooms[room].clients.splice(index, 1);
        return;
      }
      if (client.socket.readyState !== WebSocket.OPEN) {
        return;
      }
      client.socket.send(JSON.stringify({
        room,
        event,
        data,
      }));
    });
  }

  join(room: string, client: RealtimeClient, data: any): void {
    this.validateRoom(room);

    if (!this.rooms[room].clients.includes(client.id)) {
      this.rooms[room].clients.push(client.id);
    }

    if (!client) {
      return;
    }

    if (!client.rooms.includes(room)) {
      client.rooms.push(room);
    }
    // if (!this.rooms[room].users.find((u) => u.id === client.user?.id)) {
    //   this.rooms[room].users.push(client.user!);
    // }

    this.notify(room, "join", {
      room,
      user: client.user,

      users: this.rooms[room].clients,
    });
  }

  handleMessage(
    client: RealtimeClient,
    data: RealtimeClientMessage,
  ): void {
    switch (data.type) {
      case "join":
        this.join(data.room, client, data);
        break;
      case "leave":
        this.leave(data.room, client, data);
        break;
      default:
        break;
    }
  }
  handleClose(client: RealtimeClient): void {
    const rooms = this.clients.get(client.id)?.rooms;
    if (rooms) {
      for (const room of rooms) {
        this.leave(room, client, {});
      }
    }
  }
}
