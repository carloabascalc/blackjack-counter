import { Card, CardRank, Action } from './types';
import { calcHandValue, isPair } from './cardCounting';

function containsTenValue(cards: Card[]): boolean {
  return cards.some(c => ['10', 'J', 'Q', 'K'].includes(c.rank));
}

// Composition-dependent deviations — silent refinements based on exact cards in hand.
// These run after index plays (TC-based) and before basic strategy.
// Only affects stiff hard hands where one card being a 10 shifts EV.
export function getCompositionDeviation(
  playerCards: Card[],
  dealerUpCard: CardRank
): Action | null {
  const { total, isSoft } = calcHandValue(playerCards);
  if (isSoft || isPair(playerCards)) return null;

  const hasTen = containsTenValue(playerCards);
  const dealerTen = ['10', 'J', 'Q', 'K'].includes(dealerUpCard);

  // Hard 16 with a 10-value card in hand vs dealer 10 → Stand
  // One 10 is already "used" in your hand, dealer slightly less likely to have 20,
  // and you're marginally less likely to bust on the draw.
  // (Index play covers TC >= 0 already; this covers negative TC situations.)
  if (total === 16 && hasTen && dealerTen) return 'STAND';

  // Hard 16 with a 10-value card in hand vs dealer 9 → Stand
  // Same composition logic applies vs 9 — index play only covers TC >= 5.
  if (total === 16 && hasTen && dealerUpCard === '9') return 'STAND';

  return null;
}
