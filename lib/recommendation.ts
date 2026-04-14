import { Card, CardRank, Action, RuleSet } from './types';
import { calcHandValue, isPair } from './cardCounting';
import { getBasicStrategyAction } from './basicStrategy';
import { getIndexPlayDeviation } from './indexPlays';
import { getCompositionDeviation } from './compositionStrategy';

function pairCardValue(rank: CardRank): number {
  if (rank === 'A') return 11;
  if (['J', 'Q', 'K', '10'].includes(rank)) return 10;
  return parseInt(rank);
}

// H17 strategy deviations — applies when dealer hits soft 17.
// Only covers situations where H17 changes the correct play vs S17.
function getH17Deviation(playerTotal: number, isSoft: boolean, dealerUpCard: CardRank): Action | null {
  // Hard 11 vs A → Double (S17 basic: Hit; index play covers TC >= 1, this fills TC < 1)
  if (playerTotal === 11 && !isSoft && dealerUpCard === 'A') return 'DOUBLE';
  // Soft 18 (A+7) vs 2 → Double (S17 basic: Stand)
  if (playerTotal === 18 && isSoft && dealerUpCard === '2') return 'DOUBLE';
  return null;
}

export function getRecommendation(
  playerCards: Card[],
  dealerUpCard: CardRank | null,
  trueCount: number,
  rules?: RuleSet
): Action {
  if (!dealerUpCard || playerCards.length < 2) return '-';

  const { total, isSoft, isBust } = calcHandValue(playerCards);
  if (isBust) return 'STAND';
  if (total === 21) return 'STAND';

  const pair = isPair(playerCards);
  const pairValue = pair ? pairCardValue(playerCards[0].rank) : 0;

  const noSurrender = rules?.surrender === 'none';

  // 1. Index plays — TC-based deviations, highest priority
  const deviation = getIndexPlayDeviation(total, isSoft, pair, dealerUpCard, trueCount);
  if (deviation) {
    if (deviation === 'SURRENDER' && noSurrender) return 'HIT';
    return deviation;
  }

  // 2. H17 deviations — rule-based corrections when dealer hits soft 17
  if (rules?.soft17 === 'H17') {
    const h17 = getH17Deviation(total, isSoft, dealerUpCard);
    if (h17) return h17;
  }

  // 3. Composition-dependent deviations — exact card composition refinements
  const compDeviation = getCompositionDeviation(playerCards, dealerUpCard);
  if (compDeviation) return compDeviation;

  // 4. Basic strategy fallback
  const action = getBasicStrategyAction(total, isSoft, pair, pairValue, dealerUpCard);

  // If surrender is not allowed at this table, fall back to hit
  if (action === 'SURRENDER' && rules?.surrender === 'none') return 'HIT';
  return action;
}
