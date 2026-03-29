// Mock realtime sustav s EventEmitter patternom — simulira WebSocket

type MessageHandler = (message: MockMessage) => void;
type TypingHandler = (data: { partnerId: string; isTyping: boolean }) => void;

export interface MockMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  booking_id: string | null;
  content: string;
  image_url: string | null;
  created_at: string;
  read: boolean;
}

const MOCK_RESPONSES = [
  'Naravno, to mogu napraviti! 🐾',
  'Super, veselim se! Vaš ljubimac je u dobrim rukama.',
  'Hvala na poruci! Javim vam se uskoro s detaljima.',
  'Može, dogovoreno! 😊',
  'Imam iskustva s tom pasminom, bit će odlično!',
  'Da, slobodna sam taj termin. Pošaljite mi više detalja.',
  'Upravo sam s vašim ljubimcem, sve je super! 🐶',
  'Naravno! Imate li još kakvih pitanja?',
  'Zvuči odlično, jedva čekam upoznati vašeg ljubimca!',
  'Poslat ću vam fotke čim budem mogla. 📸',
];

class RealtimeManager {
  private messageHandlers: Set<MessageHandler> = new Set();
  private typingHandlers: Set<TypingHandler> = new Set();
  private typingTimeouts: Map<string, ReturnType<typeof setTimeout>> = new Map();

  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onTyping(handler: TypingHandler): () => void {
    this.typingHandlers.add(handler);
    return () => this.typingHandlers.delete(handler);
  }

  /**
   * Simulira dolaznu poruku od partnera nakon 3-5 sekundi.
   * Prvo šalje typing indicator, pa poruku.
   */
  simulateIncomingMessage(partnerId: string, receiverId: string): void {
    // Typing indicator — počinje nakon 1s
    const typingDelay = 1000;
    const messageDelay = 3000 + Math.random() * 2000; // 3-5s

    setTimeout(() => {
      this.typingHandlers.forEach((h) =>
        h({ partnerId, isTyping: true })
      );
    }, typingDelay);

    // Poruka stiže nakon 3-5s
    setTimeout(() => {
      // Prestani typing
      this.typingHandlers.forEach((h) =>
        h({ partnerId, isTyping: false })
      );

      const msg: MockMessage = {
        id: `mock-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        sender_id: partnerId,
        receiver_id: receiverId,
        booking_id: null,
        content:
          MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)],
        image_url: null,
        created_at: new Date().toISOString(),
        read: false,
      };

      this.messageHandlers.forEach((h) => h(msg));
    }, messageDelay);
  }

  /** Simulira typing indicator za određeno trajanje */
  simulateTyping(partnerId: string, durationMs: number = 2000): void {
    // Očisti prethodni timeout
    const existing = this.typingTimeouts.get(partnerId);
    if (existing) clearTimeout(existing);

    this.typingHandlers.forEach((h) =>
      h({ partnerId, isTyping: true })
    );

    const timeout = setTimeout(() => {
      this.typingHandlers.forEach((h) =>
        h({ partnerId, isTyping: false })
      );
      this.typingTimeouts.delete(partnerId);
    }, durationMs);

    this.typingTimeouts.set(partnerId, timeout);
  }

  destroy(): void {
    this.messageHandlers.clear();
    this.typingHandlers.clear();
    this.typingTimeouts.forEach((t) => clearTimeout(t));
    this.typingTimeouts.clear();
  }
}

// Singleton instanca
let instance: RealtimeManager | null = null;

export function getRealtimeManager(): RealtimeManager {
  if (!instance) {
    instance = new RealtimeManager();
  }
  return instance;
}
