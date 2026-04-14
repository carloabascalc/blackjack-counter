'use client';

import { calcTrueCount, getBetAdvice, getCountColor, getKellyBet } from '@/lib/cardCounting';
import { RuleSet, KellyConfig } from '@/lib/types';

interface CountDisplayProps {
  runningCount: number;
  cardsDealt: number;
  totalCards: number;
  ruleSet: RuleSet;
  kellyConfig: KellyConfig;
}

export default function CountDisplay({ runningCount, cardsDealt, totalCards, ruleSet, kellyConfig }: CountDisplayProps) {
  const remaining = Math.max(0, totalCards - cardsDealt);
  const trueCount = calcTrueCount(runningCount, remaining);
  const bet = getBetAdvice(trueCount, ruleSet);
  const kellyBet = getKellyBet(trueCount, ruleSet, kellyConfig);
  const countColor = getCountColor(trueCount);
  const penetration = totalCards > 0 ? (cardsDealt / totalCards) * 100 : 0;
  const isNegativeEdge = trueCount < 1;

  return (
    <div className="bg-green-900 border-b border-green-700 px-4 py-3">
      <div className="max-w-4xl mx-auto">
        {ruleSet.blackjackPayout === '6:5' && (
          <div className="mb-2 text-red-400 text-xs font-semibold text-center bg-red-950/50 rounded-lg py-1.5 border border-red-900">
            ⚠️ 6:5 table — house edge +1.39%
          </div>
        )}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {/* Running Count */}
          <div className="bg-green-800 rounded-xl p-3 text-center">
            <div className="text-green-400 text-xs uppercase tracking-wider mb-1">Running</div>
            <div className={`text-2xl font-bold ${getCountColor(runningCount)}`}>
              {runningCount > 0 ? `+${runningCount}` : runningCount}
            </div>
          </div>

          {/* True Count */}
          <div className="bg-green-800 rounded-xl p-3 text-center">
            <div className="text-green-400 text-xs uppercase tracking-wider mb-1">True Count</div>
            <div className={`text-2xl font-bold ${countColor}`}>
              {trueCount > 0 ? `+${trueCount.toFixed(1)}` : trueCount.toFixed(1)}
            </div>
          </div>

          {/* Cards Remaining */}
          <div className="bg-green-800 rounded-xl p-3 text-center">
            <div className="text-green-400 text-xs uppercase tracking-wider mb-1">Cards Left</div>
            <div className="text-xl font-bold text-white">
              {remaining}<span className="text-sm text-green-400">/{totalCards}</span>
            </div>
          </div>

          {/* Bet Advice — Kelly amount */}
          <div className={`rounded-xl p-3 text-center ${bet.bgColor} border border-green-700/50`}>
            <div className="text-green-400 text-xs uppercase tracking-wider mb-1">Bet</div>
            <div className={`text-lg font-bold leading-tight ${isNegativeEdge ? 'text-red-400' : 'text-white'}`}>
              ${kellyBet}
            </div>
            <div className={`text-xs mt-0.5 ${bet.color} opacity-80`}>{bet.edge}</div>
          </div>
        </div>

        {/* Penetration bar */}
        <div className="flex items-center gap-2">
          <span className="text-green-500 text-xs">Shoe</span>
          <div className="flex-1 bg-green-950 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                penetration > 75 ? 'bg-red-500' : penetration > 50 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${penetration}%` }}
            />
          </div>
          <span className="text-green-500 text-xs">{penetration.toFixed(0)}% dealt</span>
        </div>
      </div>
    </div>
  );
}
