'use client';

import { Player } from '@/lib/types';
import { calcHandValue } from '@/lib/cardCounting';
import CardChip from './CardChip';

interface DealerHandProps {
  dealer: Player;
  isActive: boolean;
  onSelect: () => void;
}

export default function DealerHand({ dealer, isActive, onSelect }: DealerHandProps) {
  const hand = dealer.hands[0];
  const cards = hand?.cards ?? [];
  const { total, isBust } = calcHandValue(cards);
  const hasCards = cards.length > 0;
  const upCard = cards[0]?.rank ?? null;

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
        {hasCards && (
          <span className={`ml-1 text-sm font-bold ${isBust ? 'text-red-400' : 'text-white'}`}>
            {isBust ? 'BUST' : total}
          </span>
        )}
        {isActive && (
          <span className="ml-auto text-xs bg-red-600 text-white px-2 py-0.5 rounded font-bold">ACTIVE</span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 min-h-[4rem] items-center">
        {cards.map((card, i) => (
          <CardChip key={i} card={card} />
        ))}
        {!hasCards && (
          <span className="text-gray-700 text-sm italic">No cards</span>
        )}
      </div>
    </div>
  );
}
