'use client';

import { Player } from '@/lib/types';
import { calcHandValue } from '@/lib/cardCounting';
import CardChip from './CardChip';

interface DealerHandProps {
  dealer: Player;
  isActive: boolean;
  onSelect: () => void;
  onToggleHiddenCard: () => void;
}

export default function DealerHand({ dealer, isActive, onSelect, onToggleHiddenCard }: DealerHandProps) {
  const hand = dealer.hands[0];
  const cards = hand?.cards ?? [];
  const hasHidden = hand?.hasHiddenCard ?? false;
  const { total, isBust } = calcHandValue(cards);
  const hasCards = cards.length > 0;
  const upCard = cards[0]?.rank ?? null;

  // Shown total is based on visible cards only
  const visibleLabel = hasHidden
    ? `${total} + ?`
    : hasCards
      ? isBust ? 'BUST' : String(total)
      : null;

  return (
    <div
      onClick={onSelect}
      className={`rounded-xl p-4 cursor-pointer transition-all border ${
        isActive
          ? 'border-red-500/70 bg-gray-900 shadow-lg shadow-red-900/20'
          : 'border-gray-800 bg-gray-900/60 hover:border-gray-700'
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Dealer</span>
        {upCard && (
          <span className="text-xs text-gray-500">
            Up: <span className="text-gray-200 font-semibold">{upCard}</span>
          </span>
        )}
        {visibleLabel && (
          <span className={`ml-1 text-sm font-bold ${isBust && !hasHidden ? 'text-red-400' : 'text-white'}`}>
            {visibleLabel}
          </span>
        )}
        {isActive && (
          <span className="ml-auto text-xs bg-red-600 text-white px-2 py-0.5 rounded font-bold">ACTIVE</span>
        )}
      </div>

      {/* Cards row */}
      <div className="flex flex-wrap gap-2 min-h-[4rem] items-center">
        {/* Visible cards — first card is upcard, rest are revealed */}
        {cards.map((card, i) => (
          <CardChip key={i} card={card} />
        ))}

        {/* Hole card placeholder */}
        {hasHidden && (
          <div
            onClick={e => { e.stopPropagation(); onToggleHiddenCard(); }}
            className="w-12 h-16 rounded-lg bg-gray-700 border-2 border-gray-600 flex items-center justify-center cursor-pointer hover:border-yellow-500/60 hover:bg-gray-600 transition-all group"
            title="Hole card — click to remove"
          >
            <span className="text-gray-400 text-2xl group-hover:text-yellow-400 transition-colors">🂠</span>
          </div>
        )}

        {!hasCards && !hasHidden && (
          <span className="text-gray-700 text-sm italic">No cards</span>
        )}
      </div>

      {/* Hole card button — shown when dealer has at least one visible card */}
      {hasCards && (
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={e => { e.stopPropagation(); onToggleHiddenCard(); }}
            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all border ${
              hasHidden
                ? 'bg-yellow-900/40 border-yellow-700/60 text-yellow-400 hover:bg-yellow-900/60'
                : 'bg-gray-800 border-gray-700 text-gray-500 hover:border-gray-600 hover:text-gray-300'
            }`}
          >
            {hasHidden ? '🂠 Hole card set — tap to clear' : '+ Hole card'}
          </button>
          {hasHidden && (
            <span className="text-xs text-gray-600">Enter card below when dealer reveals</span>
          )}
        </div>
      )}
    </div>
  );
}
