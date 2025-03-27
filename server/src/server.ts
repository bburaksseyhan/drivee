import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3003']
}));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3003'],
    methods: ['GET', 'POST']
  }
});

interface Participant {
  id: string;
  username: string;
  vote?: number;
}

interface EffortItem {
  id: string;
  title: string;
  description: string;
  votes: Array<{ username: string; vote: number }>;
  status: 'pending' | 'voting' | 'completed';
}

interface Room {
  participants: Participant[];
  effortItems: EffortItem[];
  isVoting: boolean;
  showResults: boolean;
}

const rooms = new Map<string, Room>();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('joinRoom', ({ roomId, username }) => {
    console.log(`User ${username} joining room ${roomId}`);
    
    // Odaya katıl
    socket.join(roomId);

    // Oda yoksa oluştur
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        participants: [],
        effortItems: [],
        isVoting: false,
        showResults: false
      });
    }

    const room = rooms.get(roomId)!;
    const participant: Participant = {
      id: socket.id,
      username
    };

    // Katılımcıyı ekle
    room.participants.push(participant);

    // Tüm katılımcılara güncel listeyi gönder
    io.to(roomId).emit('participantsUpdate', room.participants);
    
    // Yeni katılımcı bildirimi
    socket.to(roomId).emit('newParticipant', { username });
  });

  socket.on('addEffortItem', ({ roomId, item }) => {
    console.log(`Adding new effort item to room ${roomId}`);
    
    const room = rooms.get(roomId);
    if (!room) return;

    room.effortItems.push(item);
    io.to(roomId).emit('newEffortItem', item);
  });

  socket.on('vote', ({ roomId, username, itemId, vote }) => {
    console.log(`Oy verildi:
      Kullanıcı: ${username}
      Oda: ${roomId}
      Eforlama Öğesi: ${itemId}
      Verilen Oy: ${vote}
    `);
    
    const room = rooms.get(roomId);
    if (!room) return;

    // Katılımcının oyunu güncelle
    const participant = room.participants.find(p => p.username === username);
    if (participant) {
      participant.vote = vote;
    }

    // Tüm katılımcılara oy güncellemesini bildir
    io.to(roomId).emit('voteUpdate', {
      username,
      vote
    });

    // Tüm katılımcıların oylarını kontrol et
    const allVoted = room.participants.every(p => p.vote !== undefined);
    if (allVoted) {
      console.log('Tüm katılımcılar oy verdi, sonuçlar gönderiliyor...');
      // Tüm oyları topla
      const results = room.participants.map(p => ({
        username: p.username,
        vote: p.vote
      }));

      // Sonuçları gönder
      io.to(roomId).emit('votingResults', itemId, results);
    }
  });

  socket.on('startVoting', ({ roomId, itemId }) => {
    console.log(`Starting voting for item ${itemId} in room ${roomId}`);
    
    const room = rooms.get(roomId);
    if (!room) return;

    const effortItem = room.effortItems.find(item => item.id === itemId);
    if (!effortItem) return;

    room.isVoting = true;
    room.showResults = false;
    effortItem.status = 'voting';
    effortItem.votes = [];

    // Tüm katılımcıların oylarını sıfırla
    room.participants.forEach(p => p.vote = undefined);
    io.to(roomId).emit('participantsUpdate', room.participants);

    io.to(roomId).emit('votingStart', itemId);
  });

  socket.on('showResults', ({ roomId, itemId }) => {
    console.log(`Showing results for item ${itemId} in room ${roomId}`);
    
    const room = rooms.get(roomId);
    if (!room) return;

    const effortItem = room.effortItems.find(item => item.id === itemId);
    if (!effortItem) return;

    room.isVoting = false;
    room.showResults = true;
    effortItem.status = 'completed';

    // Sonuçları gönder
    io.to(roomId).emit('votingResults', itemId, effortItem.votes);
  });

  socket.on('resetVoting', ({ roomId, itemId }) => {
    console.log(`Resetting voting for item ${itemId} in room ${roomId}`);
    
    const room = rooms.get(roomId);
    if (!room) return;

    const effortItem = room.effortItems.find(item => item.id === itemId);
    if (!effortItem) return;

    room.isVoting = false;
    room.showResults = false;
    effortItem.status = 'pending';
    effortItem.votes = [];

    // Tüm katılımcıların oylarını sıfırla
    room.participants.forEach(p => p.vote = undefined);
    io.to(roomId).emit('participantsUpdate', room.participants);
  });

  socket.on('leaveRoom', ({ roomId, username }) => {
    console.log(`User ${username} leaving room ${roomId}`);
    
    const room = rooms.get(roomId);
    if (room) {
      // Katılımcıyı listeden çıkar
      room.participants = room.participants.filter(p => p.username !== username);
      
      // Odada kimse kalmadıysa odayı sil
      if (room.participants.length === 0) {
        rooms.delete(roomId);
      } else {
        // Kalan katılımcılara güncel listeyi gönder
        io.to(roomId).emit('participantsUpdate', room.participants);
      }
    }

    // Katılımcı ayrılma bildirimi
    socket.to(roomId).emit('participantLeft', { username });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);

    // Tüm odaları kontrol et ve katılımcıyı bul
    rooms.forEach((room, roomId) => {
      const participant = room.participants.find(p => p.id === socket.id);
      if (participant) {
        // Katılımcıyı listeden çıkar
        room.participants = room.participants.filter(p => p.id !== socket.id);
        
        // Odada kimse kalmadıysa odayı sil
        if (room.participants.length === 0) {
          rooms.delete(roomId);
        } else {
          // Kalan katılımcılara güncel listeyi gönder
          io.to(roomId).emit('participantsUpdate', room.participants);
          // Katılımcı ayrılma bildirimi
          io.to(roomId).emit('participantLeft', { username: participant.username });
        }
      }
    });
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 