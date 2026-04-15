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

// Bankroll percentage tiers based on effective edge.
// At negative/zero edge, bet minimum (table presence, not value).
// As edge grows, commit a larger slice of the session bankroll.
function getBankrollPct(edgePct: number): number {
  if (edgePct <= 0)   return 0.02;  // negative edge — min bet only
  if (edgePct <= 0.5) return 0.03;  // TC ~+1: slight positive, cautious
  if (edgePct <= 1.0) return 0.05;  // TC ~+2: meaningful edge
  if (edgePct <= 1.5) return 0.08;  // TC ~+3: good edge
  if (edgePct <= 2.0) return 0.12;  // TC ~+4: strong edge
  return 0.16;                       // TC ~+5+: max edge
}

// Returns recommended bet scaled to session bankroll.
// bet = bankroll × pct(edge) × fractionMultiplier, rounded to nearest increment,
// clamped to [tableMin, tableMax].
export function getKellyBet(trueCount: number, rules: RuleSet, kelly: KellyConfig): number {
  const baseEdge = calcBaselineEdge(rules);
  const edgePct = trueCount * 0.5 + baseEdge;
  // At zero or negative edge there is no value in betting more than the minimum
  if (edgePct <= 0) return rules.tableMin;
  const fractionVal = kelly.fraction === 'full' ? 1.5 : kelly.fraction === 'half' ? 1.0 : 0.6;
  const pct = getBankrollPct(edgePct) * fractionVal;
  const raw = kelly.bankroll * pct;
  const increment = Math.min(rules.tableMin, 50);
  const rounded = Math.round(raw / increment) * increment;
  return Math.min(Math.max(rounded, rules.tableMin), rules.tableMax);
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

  if (trueCount < 1)  return { label: 'BET MIN',       units: '1×', edge: edgeStr, color: 'text-red-400',    bgColor: 'bg-red-950/60' };
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
