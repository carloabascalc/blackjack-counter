import { CardRank, Action } from './types';

// Illustrious 18 — the 18 most valuable basic strategy deviations based on true count
// Each entry: [playerTotal, isSoft, dealerRank, threshold, action_at_or_above_threshold]
// Source: Stanford Wong's "Professional Blackjack"

interface IndexPlay {
  condition: (playerTotal: number, isSoft: boolean, isPair: boolean, dealerRank: CardRank, trueCount: number) => boolean;
  action: Action;
}

const INDEX_PLAYS: IndexPlay[] = [
  // Insurance: take at TC >= +3 (dealer A)
  {
    condition: (t, s, p, d, tc) => d === 'A' && tc >= 3,
    action: 'INSURANCE',
  },
  // 16 vs 10: stand at TC >= 0
  {
    condition: (t, s, p, d, tc) => t === 16 && !s && !p && ['10','J','Q','K'].includes(d) && tc >= 0,
    action: 'STAND',
  },
  // 15 vs 10: stand at TC >= +4
  {
    condition: (t, s, p, d, tc) => t === 15 && !s && !p && ['10','J','Q','K'].includes(d) && tc >= 4,
    action: 'STAND',
  },
  // 10 vs A: double at TC >= +4
  {
    condition: (t, s, p, d, tc) => t === 10 && !s && !p && d === 'A' && tc >= 4,
    action: 'DOUBLE',
  },
  // 10 vs 10: double at TC >= +4
  {
    condition: (t, s, p, d, tc) => t === 10 && !s && !p && ['10','J','Q','K'].includes(d) && tc >= 4,
    action: 'DOUBLE',
  },
  // 9 vs 2: double at TC >= +1
  {
    condition: (t, s, p, d, tc) => t === 9 && !s && !p && d === '2' && tc >= 1,
    action: 'DOUBLE',
  },
  // 9 vs 7: double at TC >= +3
  {
    condition: (t, s, p, d, tc) => t === 9 && !s && !p && d === '7' && tc >= 3,
    action: 'DOUBLE',
  },
  // 16 vs 9: stand at TC >= +5
  {
    condition: (t, s, p, d, tc) => t === 16 && !s && !p && d === '9' && tc >= 5,
    action: 'STAND',
  },
  // 13 vs 2: stand at TC >= -1
  {
    condition: (t, s, p, d, tc) => t === 13 && !s && !p && d === '2' && tc >= -1,
    action: 'STAND',
  },
  // 12 vs 2: stand at TC >= +3
  {
    condition: (t, s, p, d, tc) => t === 12 && !s && !p && d === '2' && tc >= 3,
    action: 'STAND',
  },
  // 12 vs 3: stand at TC >= +2
  {
    condition: (t, s, p, d, tc) => t === 12 && !s && !p && d === '3' && tc >= 2,
    action: 'STAND',
  },
  // 12 vs 4: stand at TC >= 0
  {
    condition: (t, s, p, d, tc) => t === 12 && !s && !p && d === '4' && tc >= 0,
    action: 'STAND',
  },
  // 11 vs A: double at TC >= +1
  {
    condition: (t, s, p, d, tc) => t === 11 && !s && !p && d === 'A' && tc >= 1,
    action: 'DOUBLE',
  },
  // Soft 19 (A+8) vs 4: double at TC >= +3
  {
    condition: (t, s, p, d, tc) => t === 19 && s && !p && d === '4' && tc >= 3,
    action: 'DOUBLE',
  },
  // Soft 19 (A+8) vs 5: double at TC >= +1
  {
    condition: (t, s, p, d, tc) => t === 19 && s && !p && d === '5' && tc >= 1,
    action: 'DOUBLE',
  },
  // Soft 19 (A+8) vs 6: double at TC >= -1
  {
    condition: (t, s, p, d, tc) => t === 19 && s && !p && d === '6' && tc >= -1,
    action: 'DOUBLE',
  },
  // 13 vs 3: stand at TC >= -2
  {
    condition: (t, s, p, d, tc) => t === 13 && !s && !p && d === '3' && tc >= -2,
    action: 'STAND',
  },
  // 15 vs A: surrender at TC >= +2 (instead of hit)
  {
    condition: (t, s, p, d, tc) => t === 15 && !s && !p && d === 'A' && tc >= 2,
    action: 'SURRENDER',
  },
];

export function getIndexPlayDeviation(
  playerTotal: number,
  isSoft: boolean,
  isPairHand: boolean,
  dealerUpCard: CardRank,
  trueCount: number
): Action | null {
  for (const play of INDEX_PLAYS) {
    if (play.condition(playerTotal, isSoft, isPairHand, dealerUpCard, trueCount)) {
      return play.action;
    }
  }
  return null;
}
