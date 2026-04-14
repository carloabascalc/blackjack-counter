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
            ? 'border-blue-500/70 bg-blue-950/30'
            : 'border-yellow-500/60 bg-gray-800/60'
          : 'border-gray-800 bg-gray-900/40 hover:border-gray-700'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-medium ${isActiveHand ? 'text-gray-300' : 'text-gray-600'}`}>
          {handLabel}
          {isActiveHand && (
            <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold ${isYou ? 'bg-blue-600 text-white' : 'bg-yellow-500 text-black'}`}>
              ACTIVE
            </span>
          )}
        </span>
        {canSplit && (
          <button
            onClick={e => { e.stopPropagation(); onSplit(); }}
            className="text-xs px-2 py-0.5 rounded bg-purple-800 hover:bg-purple-700 text-purple-300 font-bold transition-colors border border-purple-700"
          >
            Split
          </button>
        )}
      </div>

      {/* Cards */}
      <div className="flex flex-wrap gap-1.5 min-h-[3.5rem] mb-2">
        {hand.cards.map((card, i) => (
          <CardChip key={i} card={card} />
        ))}
        {!hasCards && (
          <div className="flex items-center text-gray-700 text-xs italic">
            No cards
          </div>
        )}
      </div>

      {/* Total + action */}
      <div className="flex items-center justify-between">
        {hasCards ? (
          <span className={`font-bold ${isBust ? 'text-red-400 text-base' : 'text-white text-lg'}`}>
            {isSoft && !isBust ? <span className="text-xs text-gray-400 font-normal mr-0.5">soft</span> : null}
            {total}
            {isBust && <span className="text-sm ml-1">BUST</span>}
          </span>
        ) : (
          <span className="text-gray-700 text-sm">—</span>
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
    <div className={`relative rounded-xl p-3 transition-all border ${
      isActive
        ? isYou
          ? 'border-blue-500/60 bg-gray-900 shadow-lg shadow-blue-900/30'
          : 'border-yellow-500/50 bg-gray-900 shadow-lg shadow-yellow-900/20'
        : 'border-gray-800 bg-gray-900/50 hover:border-gray-700'
    }`}>
      {/* Header row */}
      <div className="flex items-center gap-1.5 mb-3">
        <span className={`text-sm font-bold ${isYou ? 'text-blue-400' : 'text-gray-300'}`}>
          {player.name}
        </span>
        {isYou && (
          <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold tracking-wide">YOU</span>
        )}
        {multiHand && (
          <span className="text-xs text-purple-400 font-medium ml-1">{player.hands.length} hands</span>
        )}

        {!isYou && (
          <button
            onClick={e => { e.stopPropagation(); onSetYou(); }}
            title="Set as my seat"
            className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-gray-800 hover:bg-blue-800 text-gray-500 hover:text-blue-300 transition-colors border border-gray-700 hover:border-blue-700"
          >
            Me
          </button>
        )}

        <div className="ml-auto">
          <button
            onClick={e => { e.stopPropagation(); onRemove(); }}
            className="w-5 h-5 rounded-full bg-gray-800 hover:bg-red-900 text-gray-600 hover:text-red-300 text-xs flex items-center justify-center transition-colors"
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
