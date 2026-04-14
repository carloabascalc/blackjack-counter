export type CardRank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  rank: CardRank;
}

export interface Hand {
  id: string;
  cards: Card[];
  hasHiddenCard?: boolean; // dealer's face-down hole card — not counted until revealed
}

export interface Player {
  id: string;
  name: string;
  isYou: boolean;
  hands: Hand[];
}

export interface RuleSet {
  blackjackPayout: '3:2' | '6:5';
  soft17: 'S17' | 'H17';
  das: boolean;
  rsa: boolean;
  tableMin: number;
  tableMax: number;
}

export interface KellyConfig {
  bankroll: number;
  fraction: 'full' | 'half' | 'quarter';
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
  ruleSet: RuleSet;
  kellyConfig: KellyConfig;
}

export type Action = 'HIT' | 'STAND' | 'DOUBLE' | 'SPLIT' | 'INSURANCE' | '-';
