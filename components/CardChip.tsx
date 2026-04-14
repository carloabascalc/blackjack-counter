'use client';

import { Card } from '@/lib/types';
import { HI_LO_VALUES } from '@/lib/cardCounting';

interface CardChipProps {
  card: Card;
  small?: boolean;
}

const SUIT_SYMBOLS = ['♠', '♥', '♦', '♣'];

function getSuit(index: number) {
  return SUIT_SYMBOLS[index % 4];
}

// Deterministic pseudo-suit based on card rank to make display consistent
function rankToSuitIndex(rank: string): number {
  const map: Record<string, number> = {
    'A': 0, '2': 1, '3': 2, '4': 3, '5': 0,
    '6': 1, '7': 2, '8': 3, '9': 0,
    '10': 1, 'J': 2, 'Q': 3, 'K': 0
  };
  return map[rank] ?? 0;
}

export default function CardChip({ card, small = false }: CardChipProps) {
  const hiloVal = HI_LO_VALUES[card.rank];
  const isRed = [1, 2].includes(rankToSuitIndex(card.rank)); // hearts, diamonds
  const suit = getSuit(rankToSuitIndex(card.rank));

  const valueBadge = hiloVal > 0 ? '+1' : hiloVal < 0 ? '-1' : '0';
  const valueBadgeColor = hiloVal > 0 ? 'bg-green-500' : hiloVal < 0 ? 'bg-red-500' : 'bg-gray-500';

  if (small) {
    return (
      <div className={`inline-flex items-center justify-center rounded-md bg-white border border-gray-200 shadow font-bold select-none
        ${isRed ? 'text-red-600' : 'text-gray-900'} text-sm w-9 h-12 flex-col leading-none`}
      >
        <span>{card.rank}</span>
        <span className="text-xs">{suit}</span>
      </div>
    );
  }

  return (
    <div className="relative inline-block">
      <div className={`flex items-center justify-center rounded-lg bg-white border-2 border-gray-200 shadow-md font-bold select-none
        ${isRed ? 'text-red-600' : 'text-gray-900'} w-12 h-16 flex-col leading-none`}
      >
        <span className="text-xl">{card.rank}</span>
        <span className="text-sm">{suit}</span>
      </div>
      <span className={`absolute -top-1.5 -right-1.5 text-white text-[10px] font-bold px-1 py-0.5 rounded-full ${valueBadgeColor}`}>
        {valueBadge}
      </span>
    </div>
  );
}
