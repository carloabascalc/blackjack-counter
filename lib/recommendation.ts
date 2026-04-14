import { Card, CardRank, Action } from './types';
import { calcHandValue, isPair } from './cardCounting';
import { getBasicStrategyAction } from './basicStrategy';
import { getIndexPlayDeviation } from './indexPlays';

function pairCardValue(rank: CardRank): number {
  if (rank === 'A') return 11;
  if (['J', 'Q', 'K', '10'].includes(rank)) return 10;
  return parseInt(rank);
}

export function getRecommendation(
  playerCards: Card[],
  dealerUpCard: CardRank | null,
  trueCount: number
): Action {
  if (!dealerUpCard || playerCards.length < 2) return '-';

  const { total, isSoft, isBust } = calcHandValue(playerCards);
  if (isBust) return 'STAND';
  if (total === 21) return 'STAND';

  const pair = isPair(playerCards);
  const pairValue = pair ? pairCardValue(playerCards[0].rank) : 0;

  // Check index plays first (they override basic strategy)
  const deviation = getIndexPlayDeviation(total, isSoft, pair, dealerUpCard, trueCount);
  if (deviation) return deviation;

  // Fall back to basic strategy
  return getBasicStrategyAction(total, isSoft, pair, pairValue, dealerUpCard);
}
