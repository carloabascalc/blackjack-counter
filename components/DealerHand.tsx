'use client';

import { Player, CardRank } from '@/lib/types';
import { calcHandValue } from '@/lib/cardCounting';
import CardChip from './CardChip';

interface DealerHandProps {
  dealer: Player;
  isActive: boolean;
  onSelect: () => void;
}

export default function DealerHand({ dealer, isActive, onSelect }: DealerHandProps) {
  const { total, isBust } = calcHandValue(dealer.cards);
  const hasCards = dealer.cards.length > 0;
  const upCard: CardRank | null = dealer.cards[0]?.rank ?? null;

  return (
    <div
      onClick={onSelect}
      className={`rounded-xl p-4 cursor-pointer transition-all border-2 ${
        isActive
          ? 'border-red-400 bg-green-800/80 shadow-red-400/20 shadow-lg'
          : 'border-green-700 bg-green-900/60 hover:border-green-500'
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-bold text-red-400">Dealer</span>
        {upCard && (
          <span className="text-xs text-green-400">
            Up card: <span className="text-white font-bold">{upCard}</span>
          </span>
        )}
        {isActive && (
          <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded font-bold ml-auto">ACTIVE</span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 min-h-[4rem]">
        {dealer.cards.map((card, i) => (
          <CardChip key={i} card={card} />
        ))}
        {!hasCards && (
          <div className="flex items-center text-green-600 text-sm italic">
            No cards yet
          </div>
        )}
      </div>

      {hasCards && (
        <div className="mt-3 text-sm">
          <span className={`font-bold text-lg ${isBust ? 'text-red-400' : 'text-white'}`}>
            {total}{isBust ? ' BUST' : ''}
          </span>
        </div>
      )}
    </div>
  );
}
