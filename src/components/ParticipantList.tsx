import React from 'react';

interface Participant {
  id: string;
  username: string;
  vote?: number;
  isHost?: boolean;
}

interface ParticipantListProps {
  participants: Participant[];
}

export const ParticipantList: React.FC<ParticipantListProps> = ({ participants }) => {
  return (
    <div className="space-y-2">
      {participants.map((participant) => (
        <div
          key={participant.id}
          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
        >
          <span className="text-gray-900">{participant.username}</span>
          {participant.vote !== undefined ? (
            <span className="px-2 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">
              {participant.vote}
            </span>
          ) : (
            <span className="text-sm text-gray-500">
              {participant.isHost ? "Moderatör oy kullanamaz" : "Henüz oy vermedi"}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}; 