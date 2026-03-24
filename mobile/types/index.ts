export interface Sitter {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  city: string;
  services: string[];
  pricePerHour: number;
  description: string;
  verified: boolean;
}

export interface Pet {
  id: string;
  name: string;
  type: 'pas' | 'macka' | 'ptica' | 'ostalo';
  breed: string;
  age: number;
  image: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participantName: string;
  participantAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface LostPet {
  id: string;
  name: string;
  type: string;
  breed: string;
  image: string;
  lastSeen: string;
  lastSeenDate: string;
  city: string;
  description: string;
  contactPhone: string;
  found: boolean;
}

export interface Booking {
  id: string;
  sitterId: string;
  sitterName: string;
  service: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalPrice: number;
}

export interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  text: string;
  date: string;
}
