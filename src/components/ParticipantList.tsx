import React from 'react';

interface Participant {
  id: string;
  username: string;
  teamName: string;
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
          className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center text-white font-medium shadow-sm">
                {participant.username.charAt(0).toUpperCase()}
              </div>
              {participant.isHost && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white" 
                     title="Moderatör" />
              )}
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {participant.username}
              </div>
              <div className="text-sm text-gray-500">
                {participant.teamName}
              </div>
            </div>
          </div>
          <div>
            {participant.vote !== undefined ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-sky-100 text-sky-800">
                {participant.vote}
              </span>
            ) : (
              <span className="text-sm text-gray-500">
                {participant.isHost ? "Moderatör oy kullanamaz" : "Henüz oy vermedi"}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}; 