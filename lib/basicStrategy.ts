import { CardRank, Action } from './types';

// Dealer up card index: 2,3,4,5,6,7,8,9,10,A
type DealerIdx = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

function dealerIndex(rank: CardRank): DealerIdx {
  if (rank === 'A') return 9;
  if (['J', 'Q', 'K', '10'].includes(rank)) return 8;
  return (parseInt(rank) - 2) as DealerIdx;
}

type S = 'H' | 'S' | 'D' | 'P'; // shorthand: Hit, Stand, Double, sPlit

const S_TO_ACTION: Record<S, Action> = {
  H: 'HIT', S: 'STAND', D: 'DOUBLE', P: 'SPLIT',
};

// Hard totals 5–21 vs dealer 2–A
const HARD: Record<number, S[]> = {
  5:  ['H','H','H','H','H','H','H','H','H','H'],
  6:  ['H','H','H','H','H','H','H','H','H','H'],
  7:  ['H','H','H','H','H','H','H','H','H','H'],
  8:  ['H','H','H','H','H','H','H','H','H','H'],
  9:  ['H','D','D','D','D','H','H','H','H','H'],
  10: ['D','D','D','D','D','D','D','D','H','H'],
  11: ['D','D','D','D','D','D','D','D','D','H'],
  12: ['H','H','S','S','S','H','H','H','H','H'],
  13: ['S','S','S','S','S','H','H','H','H','H'],
  14: ['S','S','S','S','S','H','H','H','H','H'],
  15: ['S','S','S','S','S','H','H','H','H','H'],
  16: ['S','S','S','S','S','H','H','H','H','H'],
  17: ['S','S','S','S','S','S','S','S','S','S'],
  18: ['S','S','S','S','S','S','S','S','S','S'],
  19: ['S','S','S','S','S','S','S','S','S','S'],
  20: ['S','S','S','S','S','S','S','S','S','S'],
  21: ['S','S','S','S','S','S','S','S','S','S'],
};

// Soft totals: keyed by total (13=A+2 … 21=A+10)
const SOFT: Record<number, S[]> = {
  13: ['H','H','H','D','D','H','H','H','H','H'],
  14: ['H','H','H','D','D','H','H','H','H','H'],
  15: ['H','H','D','D','D','H','H','H','H','H'],
  16: ['H','H','D','D','D','H','H','H','H','H'],
  17: ['H','D','D','D','D','H','H','H','H','H'],
  18: ['S','D','D','D','D','S','S','H','H','H'],
  19: ['S','S','S','S','D','S','S','S','S','S'],
  20: ['S','S','S','S','S','S','S','S','S','S'],
  21: ['S','S','S','S','S','S','S','S','S','S'],
};

// Pairs: keyed by pair card value (2–10, 11=Ace)
const PAIRS: Record<number, S[]> = {
  2:  ['P','P','P','P','P','P','H','H','H','H'],
  3:  ['P','P','P','P','P','P','H','H','H','H'],
  4:  ['H','H','H','P','P','H','H','H','H','H'],
  5:  ['D','D','D','D','D','D','D','D','H','H'],
  6:  ['P','P','P','P','P','H','H','H','H','H'],
  7:  ['P','P','P','P','P','P','H','H','H','H'],
  8:  ['P','P','P','P','P','P','P','P','P','P'],
  9:  ['P','P','P','P','P','S','P','P','S','S'],
  10: ['S','S','S','S','S','S','S','S','S','S'],
  11: ['P','P','P','P','P','P','P','P','P','P'],
};

export function getBasicStrategyAction(
  playerTotal: number,
  isSoft: boolean,
  isPairHand: boolean,
  pairCardValue: number,
  dealerUpCard: CardRank
): Action {
  const di = dealerIndex(dealerUpCard);

  if (isPairHand) {
    const row = PAIRS[pairCardValue];
    if (row) return S_TO_ACTION[row[di]];
  }

  if (isSoft && SOFT[playerTotal]) {
    return S_TO_ACTION[SOFT[playerTotal][di]];
  }

  const clampedTotal = Math.min(Math.max(playerTotal, 5), 21);
  const row = HARD[clampedTotal];
  if (row) return S_TO_ACTION[row[di]];

  return playerTotal >= 17 ? 'STAND' : 'HIT';
}

export { dealerIndex };
