import { StudyRoom, Message } from '../types';
import { storageService } from './storageService';

// Simulated WebSocket connection state
type ConnectionState = 'disconnected' | 'connecting' | 'connected';

interface RoomParticipant {
  id: string;
  name: string;
  avatar?: string;
  isHost: boolean;
  joinedAt: string;
}

interface RoomState {
  room: StudyRoom;
  participants: RoomParticipant[];
  messages: Message[];
  currentPassage: {
    book: string;
    chapter: number;
    verses: number[];
  };
}

type MessageHandler = (message: Message) => void;
type ParticipantHandler = (participants: RoomParticipant[]) => void;
type ConnectionHandler = (state: ConnectionState) => void;

class StudyRoomService {
  private connectionState: ConnectionState = 'disconnected';
  private currentRoomId: string | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private participantHandlers: Set<ParticipantHandler> = new Set();
  private connectionHandlers: Set<ConnectionHandler> = new Set();
  private mockParticipants: RoomParticipant[] = [];
  private mockMessages: Message[] = [];
  private pollInterval: NodeJS.Timeout | null = null;

  /**
   * Connect to a study room
   * In production, this would establish a WebSocket connection
   */
  async joinRoom(roomId: string, userName: string): Promise<boolean> {
    try {
      this.setConnectionState('connecting');
      this.currentRoomId = roomId;

      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Initialize mock participants
      this.mockParticipants = [
        { id: 'user-1', name: userName, isHost: false, joinedAt: new Date().toISOString() },
        { id: 'host-1', name: 'Pastor Michael', isHost: true, joinedAt: new Date().toISOString() },
        { id: 'user-2', name: 'Sarah', isHost: false, joinedAt: new Date().toISOString() },
        { id: 'user-3', name: 'David', isHost: false, joinedAt: new Date().toISOString() },
      ];

      // Initialize mock messages
      this.mockMessages = [
        {
          id: 'msg-1',
          text: 'Welcome everyone! Let\'s begin our study of John 3.',
          sender: 'Pastor Michael',
          timestamp: new Date(Date.now() - 300000),
          isOwn: false,
        },
        {
          id: 'msg-2',
          text: 'The Greek word for "again" here is fascinating.',
          sender: 'Sarah',
          timestamp: new Date(Date.now() - 240000),
          isOwn: false,
        },
      ];

      this.setConnectionState('connected');
      this.notifyParticipantHandlers();
      
      // Start polling for updates (simulates real-time)
      this.startPolling();

      return true;
    } catch (error) {
      console.error('Error joining room:', error);
      this.setConnectionState('disconnected');
      return false;
    }
  }

  /**
   * Leave the current room
   */
  async leaveRoom(): Promise<void> {
    this.stopPolling();
    this.currentRoomId = null;
    this.mockParticipants = [];
    this.mockMessages = [];
    this.setConnectionState('disconnected');
  }

  /**
   * Send a message to the room
   */
  async sendMessage(text: string, senderName: string): Promise<boolean> {
    if (this.connectionState !== 'connected') {
      return false;
    }

    try {
      const message: Message = {
        id: `msg-${Date.now()}`,
        text,
        sender: senderName,
        timestamp: new Date(),
        isOwn: true,
      };

      this.mockMessages.push(message);
      this.notifyMessageHandlers(message);

      // Simulate response from other participant after delay
      setTimeout(() => {
        this.simulateResponse();
      }, 2000 + Math.random() * 3000);

      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }

  /**
   * Subscribe to new messages
   */
  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  /**
   * Subscribe to participant updates
   */
  onParticipantsChange(handler: ParticipantHandler): () => void {
    this.participantHandlers.add(handler);
    // Send current state immediately
    handler(this.mockParticipants);
    return () => this.participantHandlers.delete(handler);
  }

  /**
   * Subscribe to connection state changes
   */
  onConnectionChange(handler: ConnectionHandler): () => void {
    this.connectionHandlers.add(handler);
    handler(this.connectionState);
    return () => this.connectionHandlers.delete(handler);
  }

  /**
   * Get current messages
   */
  getMessages(): Message[] {
    return [...this.mockMessages];
  }

  /**
   * Get current participants
   */
  getParticipants(): RoomParticipant[] {
    return [...this.mockParticipants];
  }

  /**
   * Get connection state
   */
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  // Private methods

  private setConnectionState(state: ConnectionState): void {
    this.connectionState = state;
    this.connectionHandlers.forEach(handler => handler(state));
  }

  private notifyMessageHandlers(message: Message): void {
    this.messageHandlers.forEach(handler => handler(message));
  }

  private notifyParticipantHandlers(): void {
    this.participantHandlers.forEach(handler => handler(this.mockParticipants));
  }

  private startPolling(): void {
    // Simulate real-time updates every 10 seconds
    this.pollInterval = setInterval(() => {
      // Occasionally add/remove participants
      if (Math.random() > 0.7) {
        this.simulateParticipantChange();
      }
    }, 10000);
  }

  private stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  private simulateResponse(): void {
    const responses = [
      'That\'s a great point!',
      'I never thought of it that way.',
      'Can you elaborate on that?',
      'The original Greek really clarifies this.',
      'This connects to what we studied last week.',
      'Amen to that!',
    ];

    const senders = ['Sarah', 'David', 'Pastor Michael'];
    const sender = senders[Math.floor(Math.random() * senders.length)];
    const text = responses[Math.floor(Math.random() * responses.length)];

    const message: Message = {
      id: `msg-${Date.now()}`,
      text,
      sender,
      timestamp: new Date(),
      isOwn: false,
    };

    this.mockMessages.push(message);
    this.notifyMessageHandlers(message);
  }

  private simulateParticipantChange(): void {
    const names = ['Ruth', 'James', 'Mary', 'Peter', 'John', 'Martha'];
    const action = Math.random() > 0.5 ? 'join' : 'leave';

    if (action === 'join' && this.mockParticipants.length < 15) {
      const name = names[Math.floor(Math.random() * names.length)];
      if (!this.mockParticipants.find(p => p.name === name)) {
        this.mockParticipants.push({
          id: `user-${Date.now()}`,
          name,
          isHost: false,
          joinedAt: new Date().toISOString(),
        });
        this.notifyParticipantHandlers();
      }
    } else if (action === 'leave' && this.mockParticipants.length > 3) {
      const nonHostParticipants = this.mockParticipants.filter(p => !p.isHost && p.id !== 'user-1');
      if (nonHostParticipants.length > 0) {
        const toRemove = nonHostParticipants[Math.floor(Math.random() * nonHostParticipants.length)];
        this.mockParticipants = this.mockParticipants.filter(p => p.id !== toRemove.id);
        this.notifyParticipantHandlers();
      }
    }
  }
}

export const studyRoomService = new StudyRoomService();

// Room management functions
export async function createStudyRoom(room: Omit<StudyRoom, 'id'>): Promise<StudyRoom> {
  const newRoom: StudyRoom = {
    ...room,
    id: `room-${Date.now()}`,
  };
  
  // In production, this would call an API
  // For now, we just return the created room
  return newRoom;
}

export async function getPublicRooms(): Promise<StudyRoom[]> {
  // Mock public rooms
  return [
    {
      id: 'room-1',
      name: 'Romans Deep Study',
      description: 'Exploring Paul\'s letter to the Romans',
      host: 'Pastor Michael',
      participants: 12,
      schedule: 'Mondays 7pm',
      isPublic: true,
    },
    {
      id: 'room-2',
      name: 'Psalms for Today',
      description: 'Finding comfort and wisdom in the Psalms',
      host: 'Sarah Johnson',
      participants: 8,
      schedule: 'Wednesdays 6pm',
      isPublic: true,
    },
    {
      id: 'room-3',
      name: 'Gospel of John',
      description: 'Verse by verse study of John\'s Gospel',
      host: 'David Chen',
      participants: 15,
      schedule: 'Fridays 8pm',
      isPublic: true,
    },
  ];
}

