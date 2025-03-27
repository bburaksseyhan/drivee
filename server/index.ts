import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
});

interface Room {
  participants: Map<string, Participant>;
  hostId: string;
  effortItems: Map<string, EffortItem>;
}

interface Participant {
  id: string;
  username: string;
  vote?: number;
  isHost: boolean;
}

interface EffortItem {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'voting' | 'completed';
  votes: Record<string, number>;
}

const rooms = new Map<string, Room>();

io.on('connection', (socket: Socket) => {
  console.log('Yeni bağlantı:', socket.id);

  socket.on('joinRoom', (data: { roomId: string; username: string }) => {
    const { roomId, username } = data;
    const participantId = uuidv4();

    // Odaya katıl
    socket.join(roomId);

    // Katılımcı bilgilerini sakla
    const participant: Participant = {
      id: participantId,
      username,
      isHost: !rooms.has(roomId) // İlk katılan kişi moderatör olur
    };

    // Oda bilgilerini güncelle
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        participants: new Map(),
        hostId: participantId,
        effortItems: new Map()
      });
    }

    const room = rooms.get(roomId)!;
    room.participants.set(participantId, participant);

    // Katılımcı listesini güncelle
    const participants = Array.from(room.participants.values());
    io.to(roomId).emit('participantsUpdate', participants);

    // Eforlama listesini gönder
    const effortItems = Array.from(room.effortItems.values());
    socket.emit('effortItemsUpdate', effortItems);

    // Yeni katılımcı bildirimi
    socket.to(roomId).emit('newParticipant', { username });
  });

  socket.on('addEffort', (data: { roomId: string; effort: EffortItem }) => {
    const { roomId, effort } = data;
    const room = rooms.get(roomId);

    if (room) {
      room.effortItems.set(effort.id, effort);
      const effortItems = Array.from(room.effortItems.values());
      io.to(roomId).emit('effortItemsUpdate', effortItems);
      io.to(roomId).emit('newEffort', effort);
    }
  });

  socket.on('startVoting', (data: { roomId: string; effortId: string }) => {
    const { roomId, effortId } = data;
    const room = rooms.get(roomId);

    if (room) {
      const effort = room.effortItems.get(effortId);
      if (effort) {
        effort.status = 'voting';
        const effortItems = Array.from(room.effortItems.values());
        io.to(roomId).emit('effortItemsUpdate', effortItems);
        io.to(roomId).emit('effortUpdate', effort);
      }
    }
  });

  socket.on('showResults', (data: { roomId: string; effortId: string }) => {
    const { roomId, effortId } = data;
    const room = rooms.get(roomId);

    if (room) {
      const effort = room.effortItems.get(effortId);
      if (effort) {
        effort.status = 'completed';
        const effortItems = Array.from(room.effortItems.values());
        io.to(roomId).emit('effortItemsUpdate', effortItems);
        io.to(roomId).emit('effortUpdate', effort);
      }
    }
  });

  socket.on('resetVoting', (data: { roomId: string; effortId: string }) => {
    const { roomId, effortId } = data;
    const room = rooms.get(roomId);

    if (room) {
      const effort = room.effortItems.get(effortId);
      if (effort) {
        effort.status = 'pending';
        effort.votes = {};
        const effortItems = Array.from(room.effortItems.values());
        io.to(roomId).emit('effortItemsUpdate', effortItems);
        io.to(roomId).emit('effortUpdate', effort);
      }
    }
  });

  socket.on('vote', (data: { roomId: string; username: string; vote: number }) => {
    const { roomId, username, vote } = data;
    const room = rooms.get(roomId);

    if (room) {
      const participant = Array.from(room.participants.values()).find(p => p.username === username);
      if (participant) {
        participant.vote = vote;
        const participants = Array.from(room.participants.values());
        io.to(roomId).emit('participantsUpdate', participants);
        io.to(roomId).emit('voteUpdate', { username, vote });
      }
    }
  });

  socket.on('leaveRoom', ({ roomId, username }) => {
    const room = rooms.get(roomId);
    if (room) {
      const participant = room.participants.find(p => p.username === username);
      if (participant) {
        // Eğer ayrılan kişi moderatör ise, tüm katılımcıları çıkart
        if (participant.isHost) {
          room.participants.forEach(p => {
            const participantSocket = connectedUsers.get(p.username);
            if (participantSocket) {
              participantSocket.emit('hostLeft');
            }
          });
          rooms.delete(roomId);
        } else {
          room.participants = room.participants.filter(p => p.username !== username);
          io.to(roomId).emit('participantsUpdate', room.participants);
          io.to(roomId).emit('participantLeft', { username });
        }
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('Bağlantı koptu:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 