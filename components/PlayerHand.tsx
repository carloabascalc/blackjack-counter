'use client';

import { Player, CardRank } from '@/lib/types';
import { calcHandValue } from '@/lib/cardCounting';
import { getRecommendation } from '@/lib/recommendation';
import CardChip from './CardChip';
import ActionBadge from './ActionBadge';

interface PlayerHandProps {
  player: Player;
  dealerUpCard: CardRank | null;
  trueCount: number;
  isActive: boolean;
  isYou?: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

export default function PlayerHand({
  player,
  dealerUpCard,
  trueCount,
  isActive,
  isYou = false,
  onSelect,
  onRemove,
}: PlayerHandProps) {
  const { total, isSoft, isBust } = calcHandValue(player.cards);
  const recommendation = getRecommendation(player.cards, dealerUpCard, trueCount);

  const hasCards = player.cards.length > 0;

  return (
    <div
      onClick={onSelect}
      className={`relative rounded-xl p-4 cursor-pointer transition-all border-2 ${
        isActive
          ? 'border-yellow-400 bg-green-800/80 shadow-yellow-400/30 shadow-lg'
          : 'border-green-700 bg-green-900/60 hover:border-green-500'
      }`}
    >
      {/* Remove button */}
      {!isYou && (
        <button
          onClick={e => { e.stopPropagation(); onRemove(); }}
          className="absolute top-2 right-2 w-5 h-5 rounded-full bg-red-900/70 hover:bg-red-700 text-red-300 text-xs flex items-center justify-center transition-colors"
          title="Remove player"
        >
          ×
        </button>
      )}

      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-sm font-bold ${isYou ? 'text-yellow-400' : 'text-green-300'}`}>
          {player.name}
          {isYou && <span className="ml-1 text-xs text-yellow-500">(You)</span>}
        </span>
        {isActive && (
          <span className="text-xs bg-yellow-500 text-black px-1.5 py-0.5 rounded font-bold">ACTIVE</span>
        )}
      </div>

      {/* Cards */}
      <div className="flex flex-wrap gap-2 min-h-[4rem] mb-3">
        {player.cards.map((card, i) => (
          <CardChip key={i} card={card} />
        ))}
        {!hasCards && (
          <div className="flex items-center justify-center w-full text-green-600 text-sm italic">
            No cards yet
          </div>
        )}
      </div>

      {/* Footer: total + recommendation */}
      <div className="flex items-center justify-between">
        <div className="text-sm">
          {hasCards ? (
            <span className={`font-bold text-lg ${isBust ? 'text-red-400' : 'text-white'}`}>
              {isSoft && !isBust ? 'Soft ' : ''}{total}
              {isBust && ' BUST'}
            </span>
          ) : (
            <span className="text-green-600">—</span>
          )}
        </div>
        <ActionBadge action={recommendation} large={isActive} />
      </div>
    </div>
  );
}
