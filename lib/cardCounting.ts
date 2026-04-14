import { Card, CardRank, RuleSet, KellyConfig } from './types';

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

// Baseline house edge adjusted for table rules.
// Reference point: 6-deck, S17, 3:2, no DAS, no RSA, no surrender ≈ −0.55%
export function calcBaselineEdge(rules: RuleSet): number {
  let edge = -0.55;
  if (rules.blackjackPayout === '6:5') edge -= 1.39;
  if (rules.soft17 === 'H17') edge -= 0.22;
  if (rules.das) edge += 0.14;
  if (rules.rsa) edge += 0.08;
  return edge;
}

// Bet spread multiplier based on true count and Kelly fraction.
// Unit = tableMin. Fraction controls how aggressively the spread ramps.
//
// Full Kelly  — 1-8 spread (max aggression, fast ramp)
// Half Kelly  — 1-5 spread (balanced, standard counter approach)
// Quarter Kelly — 1-3 spread (conservative, lower variance)
//
// Pure Kelly formula (edge% × fraction × bankroll) requires a total AP
// bankroll of $3k–$10k to produce bets above typical table minimums.
// Unit-spread is what counters actually use at the table and correctly
// scales the bet with the count regardless of session buy-in size.
function getBetSpread(trueCount: number, fraction: 'full' | 'half' | 'quarter'): number {
  if (fraction === 'full') {
    if (trueCount < 1) return 1;
    if (trueCount < 2) return 2;
    if (trueCount < 3) return 4;
    if (trueCount < 4) return 6;
    return 8;
  }
  if (fraction === 'half') {
    if (trueCount < 1) return 1;
    if (trueCount < 2) return 1;
    if (trueCount < 3) return 2;
    if (trueCount < 4) return 3;
    return 5;
  }
  // quarter
  if (trueCount < 1) return 1;
  if (trueCount < 2) return 1;
  if (trueCount < 3) return 2;
  return 3;
}

// Returns recommended bet in dollars: tableMin × spread multiplier, clamped to table limits.
export function getKellyBet(trueCount: number, rules: RuleSet, kelly: KellyConfig): number {
  const baseEdge = calcBaselineEdge(rules);
  const edgePct = trueCount * 0.5 + baseEdge;
  if (edgePct <= 0) return rules.tableMin;
  const spread = getBetSpread(trueCount, kelly.fraction);
  return Math.min(rules.tableMin * spread, rules.tableMax);
}

// Minimum recommended bankroll for the configured table (100 units).
export function recommendedBankroll(rules: RuleSet): number {
  return rules.tableMin * 100;
}

// Bet advice based on true count.
// If rules provided, baseline edge is adjusted to actual table conditions.
export function getBetAdvice(trueCount: number, rules?: RuleSet): {
  label: string;
  units: string;
  edge: string;
  color: string;
  bgColor: string;
} {
  const baseEdge = rules ? calcBaselineEdge(rules) : -0.55;
  const edgePct = trueCount * 0.5 + baseEdge;
  const edgeStr = (edgePct >= 0 ? '+' : '') + edgePct.toFixed(2) + '%';

  if (trueCount < 1)  return { label: 'SIT OUT / MIN', units: '1×', edge: edgeStr, color: 'text-red-400',    bgColor: 'bg-red-950/60' };
  if (trueCount < 2)  return { label: 'TABLE MIN',     units: '1×', edge: edgeStr, color: 'text-gray-400',   bgColor: 'bg-gray-800/60' };
  if (trueCount < 3)  return { label: 'RAISE BET',     units: '2×', edge: edgeStr, color: 'text-yellow-400', bgColor: 'bg-yellow-950/60' };
  if (trueCount < 4)  return { label: 'HIGH BET',      units: '4×', edge: edgeStr, color: 'text-orange-400', bgColor: 'bg-orange-950/60' };
  if (trueCount < 5)  return { label: 'BIGGER BET',    units: '6×', edge: edgeStr, color: 'text-orange-300', bgColor: 'bg-orange-950/70' };
  return                     { label: 'MAX BET',        units: '8×', edge: edgeStr, color: 'text-green-400',  bgColor: 'bg-green-950/80' };
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
