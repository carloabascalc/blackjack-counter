import { Card, CardRank } from './types';

// Hi-Lo system: statistically strongest balanced counting system
// Betting Correlation: 0.97, Playing Efficiency: 0.51, Insurance Correlation: 0.76
export const HI_LO_VALUES: Record<CardRank, number> = {
  '2': 1, '3': 1, '4': 1, '5': 1, '6': 1,
  '7': 0, '8': 0, '9': 0,
  '10': -1, 'J': -1, 'Q': -1, 'K': -1, 'A': -1,
};

export function getHiLoValue(card: Card): number {
  return HI_LO_VALUES[card.rank];
}

export function calcTrueCount(runningCount: number, remainingCards: number): number {
  const remainingDecks = remainingCards / 52;
  if (remainingDecks <= 0) return runningCount;
  return runningCount / remainingDecks;
}

export function calcRemainingCards(totalCards: number, cardsDealt: number): number {
  return Math.max(0, totalCards - cardsDealt);
}

// Bet advice based on true count (Kelly-informed Hi-Lo bet spread)
export function getBetAdvice(trueCount: number): { label: string; multiplier: string; color: string } {
  if (trueCount <= 1)  return { label: 'MIN BET',  multiplier: '1x', color: 'text-gray-400' };
  if (trueCount <= 2)  return { label: 'RAISE',     multiplier: '2x', color: 'text-yellow-400' };
  if (trueCount <= 4)  return { label: 'HIGH BET',  multiplier: '4x', color: 'text-orange-400' };
  return               { label: 'MAX BET',           multiplier: '8x', color: 'text-green-400' };
}

export function getCountColor(trueCount: number): string {
  if (trueCount >= 3)  return 'text-green-400';
  if (trueCount >= 1)  return 'text-yellow-400';
  if (trueCount >= -1) return 'text-gray-300';
  return 'text-red-400';
}

// Hand evaluation
export function calcHandValue(cards: Card[]): { total: number; isSoft: boolean; isBust: boolean } {
  let total = 0;
  let aces = 0;

  for (const card of cards) {
    if (card.rank === 'A') {
      aces++;
      total += 11;
    } else if (['J', 'Q', 'K', '10'].includes(card.rank)) {
      total += 10;
    } else {
      total += parseInt(card.rank);
    }
  }

  let isSoft = aces > 0 && total <= 21;

  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }

  isSoft = aces > 0 && total <= 21;

  return { total, isSoft, isBust: total > 21 };
}

export function isPair(cards: Card[]): boolean {
  if (cards.length !== 2) return false;
  const val = (r: CardRank) => ['10', 'J', 'Q', 'K'].includes(r) ? '10' : r;
  return val(cards[0].rank) === val(cards[1].rank);
}
