const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Redis } = require('@upstash/redis');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

io.on('connection', (socket) => {
  socket.on('join_queue', async () => {
    try {
      const waitingUser = await redis.lpop('chat_queue');
      
      if (waitingUser && waitingUser !== socket.id) {
        const roomId = `room_${socket.id}_${waitingUser}`;
        socket.join(roomId);
        
        const partnerSocket = io.sockets.sockets.get(waitingUser);
        if (partnerSocket) {
          partnerSocket.join(roomId);
          socket.roomId = roomId;
          partnerSocket.roomId = roomId;

          io.to(roomId).emit('chat_matched', { roomId });
        } else {
          await redis.rpush('chat_queue', socket.id);
          socket.emit('waiting');
        }
      } else {
        await redis.rpush('chat_queue', socket.id);
        socket.emit('waiting');
      }
    } catch (err) {
      console.error(err);
    }
  });

  socket.on('send_message', ({ roomId, message }) => {
    socket.to(roomId).emit('receive_message', { message });
  });

  socket.on('leave_room', () => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('partner_disconnected');
      socket.leave(socket.roomId);
      socket.roomId = null;
    }
  });

  socket.on('disconnect', () => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('partner_disconnected');
    }
  });
});

app.get('/', (req, res) => res.send('Backend Server is Running'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server live on port ${PORT}`));
