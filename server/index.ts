import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(cors());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

interface Participant {
  id: string;
  username: string;
  teamName: string;
  vote?: number;
}

interface Room {
  participants: Participant[];
  hostId: string;
  isVoting: boolean;
  teamName: string;
}

const rooms = new Map<string, Room>();

io.on('connection', (socket: Socket) => {
  console.log('Yeni bağlantı:', socket.id);

  socket.on('joinRoom', (data: { roomId: string; username: string; teamName: string }) => {
    const { roomId, username, teamName } = data;
    const participantId = uuidv4();
    const isFirstParticipant = !rooms.has(roomId);
    const existingRoom = rooms.get(roomId);

    // Odaya katıl
    socket.join(roomId);

    // Katılımcı bilgilerini sakla
    const participant: Participant = {
      id: participantId,
      username,
      teamName: isFirstParticipant ? teamName : existingRoom?.teamName || teamName
    };

    // Oda bilgilerini güncelle
    if (isFirstParticipant) {
      rooms.set(roomId, {
        participants: [],
        hostId: participantId,
        isVoting: false,
        teamName: teamName
      });
    }

    const room = rooms.get(roomId)!;
    room.participants.push(participant);

    // Katılımcıya mevcut ekip adını bildir
    if (!isFirstParticipant) {
      socket.emit('teamNameUpdate', { teamName: room.teamName });
    }

    // Katılımcı listesini güncelle
    io.to(roomId).emit('participantsUpdate', room.participants);

    // Yeni katılımcı bildirimi
    socket.to(roomId).emit('newParticipant', { username, teamName: participant.teamName });
  });

  socket.on('startVoting', ({ roomId }) => {
    const room = rooms.get(roomId);
    
    if (room) {
      // Tüm oyları sıfırla
      room.participants.forEach(participant => {
        participant.vote = undefined;
      });
      
      // Odadaki herkese oylama başladı bilgisi gönder
      io.to(roomId).emit('votingStarted');
      io.to(roomId).emit('participantsUpdate', room.participants);
    }
  });

  socket.on('newRound', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.isVoting = false;
      // Tüm katılımcıların oylarını sıfırla
      room.participants.forEach(p => p.vote = undefined);
      io.to(roomId).emit('participantsUpdate', room.participants);
      io.to(roomId).emit('roundStarted');
    }
  });

  socket.on('vote', ({ roomId, username, vote }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    // Katılımcının oyunu güncelle
    const participant = room.participants.find(p => p.username === username);
    if (participant) {
      participant.vote = vote;
      
      // Tüm katılımcılara oy güncellemesini bildir
      io.to(roomId).emit('voteUpdate', { username, vote });
      io.to(roomId).emit('participantsUpdate', room.participants);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    // Tüm odaları kontrol et ve katılımcıyı çıkar
    rooms.forEach((room, roomId) => {
      const participantIndex = room.participants.findIndex(p => p.id === socket.id);
      
      if (participantIndex !== -1) {
        const participant = room.participants[participantIndex];
        
        // Katılımcıyı odadan çıkar
        room.participants.splice(participantIndex, 1);
        
        // Odada kimse kalmadıysa odayı sil
        if (room.participants.length === 0) {
          rooms.delete(roomId);
        } else {
          // Katılımcı listesini güncelle
          io.to(roomId).emit('participantsUpdate', room.participants);
          // Ayrılan katılımcı bilgisini gönder
          io.to(roomId).emit('participantLeft', { username: participant.username });
        }
      }
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 