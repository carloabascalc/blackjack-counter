'use client';

import { CardRank } from '@/lib/types';
import { HI_LO_VALUES } from '@/lib/cardCounting';

interface CardInputPanelProps {
  onCardSelect: (rank: CardRank) => void;
  onUndo: () => void;
  canUndo: boolean;
  activeLabel: string;
}

const RANKS: CardRank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const RANK_COLORS: Record<string, string> = {
  '-1': 'bg-red-900/60 hover:bg-red-800 border-red-700 text-red-200',
  '0':  'bg-gray-800/60 hover:bg-gray-700 border-gray-600 text-gray-200',
  '1':  'bg-green-900/60 hover:bg-green-800 border-green-700 text-green-200',
};

function getHiLoLabel(rank: CardRank): string {
  const v = HI_LO_VALUES[rank];
  return v > 0 ? '+1' : v < 0 ? '-1' : '0';
}

function getRankColor(rank: CardRank): string {
  const v = HI_LO_VALUES[rank];
  return RANK_COLORS[String(v)];
}

export default function CardInputPanel({
  onCardSelect,
  onUndo,
  canUndo,
  activeLabel,
}: CardInputPanelProps) {
  return (
    <div className="bg-gray-900 border-t border-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-500 text-sm">
            Assigning to: <span className="text-gray-200 font-semibold">{activeLabel}</span>
          </span>
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="text-xs px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-gray-700"
          >
            ↩ Undo last
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {RANKS.map(rank => (
            <button
              key={rank}
              onClick={() => onCardSelect(rank)}
              className={`relative py-3 rounded-xl font-bold text-xl border-2 transition-all active:scale-95 ${getRankColor(rank)}`}
            >
              {rank}
              <span className="absolute bottom-1 right-1 text-[9px] font-normal opacity-70">
                {getHiLoLabel(rank)}
              </span>
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-3 justify-center text-xs">
          <span className="text-green-400">■ +1 (count goes up)</span>
          <span className="text-gray-400">■ 0 (neutral)</span>
          <span className="text-red-400">■ −1 (count goes down)</span>
        </div>
      </div>
    </div>
  );
}
