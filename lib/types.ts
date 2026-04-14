export type CardRank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  rank: CardRank;
}

export interface Hand {
  id: string;
  cards: Card[];
}

export interface Player {
  id: string;
  name: string;
  isYou: boolean;
  hands: Hand[];
}

export interface GameState {
  numDecks: number;
  totalCards: number;
  cardsDealt: number;
  runningCount: number;
  players: Player[];
  dealer: Player;
  activePlayerId: string; // 'dealer' or player.id
  activeHandId: string;   // hand.id within the active player
  youPlayerId: string;
}

export type Action = 'HIT' | 'STAND' | 'DOUBLE' | 'SPLIT' | 'SURRENDER' | 'INSURANCE' | '-';
