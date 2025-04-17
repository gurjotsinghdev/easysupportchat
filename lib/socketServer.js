// lib/socketServer.js

import { Server } from 'socket.io';

let io;

export default function getSocketServer(res) {
  if (!res.socket.server.io) {
    io = new Server(res.socket.server, {
      path: '/api/socket_io',
      addTrailingSlash: false,
    });

    res.socket.server.io = io;

    let messages = {}; // { roomId: [ { name, text, file, fileName } ] }

    io.on('connection', (socket) => {
      socket.on('join-room', ({ roomId, name }) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-joined', name);
        socket.emit('message-history', messages[roomId] || []);
      });

      socket.on('chat-message', ({ roomId, message }) => {
        if (!messages[roomId]) messages[roomId] = [];
        messages[roomId].push(message);
        socket.to(roomId).emit('chat-message', message);
      });

      socket.on('disconnect', () => {
        // optionally broadcast leave or cleanup
      });
    });
  }
}