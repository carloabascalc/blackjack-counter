'use client';

import { Player, Hand, CardRank, RuleSet } from '@/lib/types';
import { calcHandValue, isPair } from '@/lib/cardCounting';
import { getRecommendation } from '@/lib/recommendation';
import CardChip from './CardChip';
import ActionBadge from './ActionBadge';

interface PlayerHandProps {
  player: Player;
  dealerUpCard: CardRank | null;
  trueCount: number;
  ruleSet: RuleSet;
  isActive: boolean;
  activeHandId: string | null;
  isYou: boolean;
  onSelectHand: (handId: string) => void;
  onRemove: () => void;
  onSplit: (handId: string) => void;
  onSetYou: () => void;
}

function HandSection({
  hand,
  dealerUpCard,
  trueCount,
  ruleSet,
  isActiveHand,
  isYou,
  handLabel,
  onSelect,
  onSplit,
}: {
  hand: Hand;
  dealerUpCard: CardRank | null;
  trueCount: number;
  ruleSet: RuleSet;
  isActiveHand: boolean;
  isYou: boolean;
  handLabel: string;
  onSelect: () => void;
  onSplit: () => void;
}) {
  const { total, isSoft, isBust } = calcHandValue(hand.cards);
  const recommendation = getRecommendation(hand.cards, dealerUpCard, trueCount, ruleSet);
  const canSplit = hand.cards.length === 2 && isPair(hand.cards);
  const hasCards = hand.cards.length > 0;

  return (
    <div
      onClick={onSelect}
      className={`rounded-lg p-3 cursor-pointer transition-all border ${
        isActiveHand
          ? isYou
            ? 'border-blue-400 bg-blue-950/40'
            : 'border-yellow-400 bg-green-800/60'
          : 'border-green-800/60 bg-green-900/30 hover:border-green-600'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-semibold ${isActiveHand ? 'text-green-300' : 'text-green-600'}`}>
          {handLabel}
          {isActiveHand && (
            <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold ${isYou ? 'bg-blue-500 text-white' : 'bg-yellow-500 text-black'}`}>
              ACTIVE
            </span>
          )}
        </span>
        {canSplit && (
          <button
            onClick={e => { e.stopPropagation(); onSplit(); }}
            className="text-xs px-2 py-0.5 rounded bg-purple-700 hover:bg-purple-600 text-purple-200 font-bold transition-colors border border-purple-600"
          >
            ✂️ Split
          </button>
        )}
      </div>

      {/* Cards */}
      <div className="flex flex-wrap gap-1.5 min-h-[3.5rem] mb-2">
        {hand.cards.map((card, i) => (
          <CardChip key={i} card={card} />
        ))}
        {!hasCards && (
          <div className="flex items-center text-green-700 text-xs italic">
            No cards
          </div>
        )}
      </div>

      {/* Total + action */}
      <div className="flex items-center justify-between">
        {hasCards ? (
          <span className={`font-bold ${isBust ? 'text-red-400 text-base' : 'text-white text-lg'}`}>
            {isSoft && !isBust ? 'Soft ' : ''}{total}
            {isBust && ' BUST'}
          </span>
        ) : (
          <span className="text-green-700 text-sm">—</span>
        )}
        <ActionBadge action={recommendation} large={isActiveHand && isYou} />
      </div>
    </div>
  );
}

export default function PlayerHand({
  player,
  dealerUpCard,
  trueCount,
  ruleSet,
  isActive,
  activeHandId,
  isYou,
  onSelectHand,
  onRemove,
  onSplit,
  onSetYou,
}: PlayerHandProps) {
  const multiHand = player.hands.length > 1;

  return (
    <div className={`relative rounded-xl p-3 transition-all border-2 ${
      isActive
        ? isYou
          ? 'border-blue-400 bg-green-900/70 shadow-blue-400/20 shadow-lg'
          : 'border-yellow-400 bg-green-800/80 shadow-yellow-400/20 shadow-lg'
        : 'border-green-700 bg-green-900/60 hover:border-green-600'
    }`}>
      {/* Header row */}
      <div className="flex items-center gap-1.5 mb-3">
        <span className={`text-sm font-bold ${isYou ? 'text-blue-400' : 'text-green-300'}`}>
          {player.name}
        </span>
        {isYou && (
          <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded font-bold">You</span>
        )}
        {multiHand && (
          <span className="text-xs text-purple-400 font-semibold ml-1">{player.hands.length} hands</span>
        )}

        {/* Set as me button — shown on non-you players */}
        {!isYou && (
          <button
            onClick={e => { e.stopPropagation(); onSetYou(); }}
            title="Set as my seat"
            className="ml-1 text-xs px-1.5 py-0.5 rounded bg-green-800 hover:bg-blue-700 text-green-400 hover:text-white transition-colors border border-green-700 hover:border-blue-500"
          >
            👤 Me
          </button>
        )}

        <div className="ml-auto flex items-center gap-1">
          {/* Remove player */}
          <button
            onClick={e => { e.stopPropagation(); onRemove(); }}
            className="w-5 h-5 rounded-full bg-red-900/70 hover:bg-red-700 text-red-300 text-xs flex items-center justify-center transition-colors"
            title="Remove player"
          >
            ×
          </button>
        </div>
      </div>

      {/* Hand(s) */}
      <div className={multiHand ? 'space-y-2' : ''}>
        {player.hands.map((hand, i) => (
          <HandSection
            key={hand.id}
            hand={hand}
            dealerUpCard={dealerUpCard}
            trueCount={trueCount}
            ruleSet={ruleSet}
            isActiveHand={isActive && hand.id === activeHandId}
            isYou={isYou}
            handLabel={multiHand ? `Hand ${i + 1}` : 'Hand'}
            onSelect={() => onSelectHand(hand.id)}
            onSplit={() => onSplit(hand.id)}
          />
        ))}
      </div>
    </div>
  );
}
