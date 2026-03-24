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

export interface WalkCheckpoint {
  id: string;
  time: string;
  label: string;
  lat: number;
  lng: number;
}

export interface WalkSession {
  id: string;
  sitterName: string;
  sitterAvatar: string;
  petName: string;
  status: 'u_tijeku' | 'zavrseno';
  startTime: string;
  endTime?: string;
  duration: string;
  distance: string;
  avgSpeed: string;
  checkpoints: WalkCheckpoint[];
  route: { lat: number; lng: number }[];
}

export interface PhotoUpdate {
  id: string;
  sitterName: string;
  sitterAvatar: string;
  petName: string;
  image: string;
  caption: string;
  timestamp: string;
  liked: boolean;
}

export interface Vaccination {
  id: string;
  name: string;
  date: string;
  nextDate: string;
  vet: string;
}

export interface PetPassport {
  id: string;
  petId: string;
  petName: string;
  petImage: string;
  breed: string;
  type: string;
  birthDate: string;
  weight: string;
  microchipId: string;
  vaccinations: Vaccination[];
  allergies: string[];
  medications: { name: string; dosage: string; frequency: string }[];
  vetContact: {
    name: string;
    clinic: string;
    phone: string;
    address: string;
  };
}

export interface GroomingService {
  id: string;
  name: string;
  description: string;
  price: string;
  duration: string;
  icon: string;
}

export interface TrainingProgram {
  id: string;
  name: string;
  description: string;
  price: string;
  duration: string;
  sessions: number;
  icon: string;
}
