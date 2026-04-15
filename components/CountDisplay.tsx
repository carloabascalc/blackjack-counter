'use client';

import { calcTrueCount, getBetAdvice, getCountColor, calcBaselineEdge } from '@/lib/cardCounting';
import { RuleSet, KellyConfig } from '@/lib/types';

interface CountDisplayProps {
  runningCount: number;
  cardsDealt: number;
  totalCards: number;
  ruleSet: RuleSet;
  kellyConfig: KellyConfig;
  kellyBet: number;
  frozenTrueCount: number;
  casinoMode: boolean;
}

export default function CountDisplay({ runningCount, cardsDealt, totalCards, ruleSet, kellyConfig, kellyBet, frozenTrueCount, casinoMode }: CountDisplayProps) {
  const remaining = Math.max(0, totalCards - cardsDealt);
  const trueCount = casinoMode ? 0 : calcTrueCount(runningCount, remaining);
  // Bet tile uses the frozen count so label/color/edge don't change mid-round
  const bet = getBetAdvice(frozenTrueCount, ruleSet);
  const units = Math.round(kellyBet / ruleSet.tableMin);
  const countColor = getCountColor(trueCount);
  const penetration = totalCards > 0 ? (cardsDealt / totalCards) * 100 : 0;
  const baseEdge = calcBaselineEdge(ruleSet);
  const underbankrolled = kellyConfig.bankroll < ruleSet.tableMin * 20;

  if (casinoMode) {
    return (
      <div className="bg-gray-950 border-b border-gray-800 px-4 py-3">
        <div className="max-w-4xl mx-auto">
          {ruleSet.blackjackPayout === '6:5' && (
            <div className="mb-2 text-red-400 text-xs font-semibold text-center bg-red-950/60 rounded-lg py-1.5 border border-red-900/60">
              ⚠️ 6:5 payout — house edge +1.39%
            </div>
          )}
          <div className="flex items-center justify-between bg-gray-900 rounded-xl px-4 py-3 border border-gray-800">
            <div>
              <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-0.5">Casino Mode</div>
              <div className="text-gray-400 text-xs">Basic strategy only · No count tracking</div>
            </div>
            <div className="text-right">
              <div className="text-gray-500 text-xs uppercase tracking-wider mb-0.5">House Edge</div>
              <div className={`text-sm font-bold ${baseEdge >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {(baseEdge >= 0 ? '+' : '') + baseEdge.toFixed(2)}%
              </div>
            </div>
            <div className="text-right">
              <div className="text-gray-500 text-xs uppercase tracking-wider mb-0.5">Bet</div>
              <div className="text-sm font-bold text-gray-300">${ruleSet.tableMin} min</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-950 border-b border-gray-800 px-4 py-3">
      <div className="max-w-4xl mx-auto">
        {ruleSet.blackjackPayout === '6:5' && (
          <div className="mb-2 text-red-400 text-xs font-semibold text-center bg-red-950/60 rounded-lg py-1.5 border border-red-900/60">
            ⚠️ 6:5 payout — house edge +1.39%
          </div>
        )}

        <div className="grid grid-cols-4 gap-2 mb-3">
          <div className="bg-gray-900 rounded-xl p-3 text-center border border-gray-800">
            <div className="text-gray-500 text-xs uppercase tracking-wider mb-1 font-medium">Running</div>
            <div className={`text-2xl font-bold ${getCountColor(runningCount)}`}>
              {runningCount > 0 ? `+${runningCount}` : runningCount}
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-3 text-center border border-gray-800">
            <div className="text-gray-500 text-xs uppercase tracking-wider mb-1 font-medium">True</div>
            <div className={`text-2xl font-bold ${countColor}`}>
              {trueCount > 0 ? `+${trueCount.toFixed(1)}` : trueCount.toFixed(1)}
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-3 text-center border border-gray-800">
            <div className="text-gray-500 text-xs uppercase tracking-wider mb-1 font-medium">Cards</div>
            <div className="text-xl font-bold text-white">
              {remaining}<span className="text-sm text-gray-500">/{totalCards}</span>
            </div>
          </div>

          <div className={`rounded-xl p-3 text-center border border-gray-700/50 ${bet.bgColor}`}>
            <div className="text-gray-400 text-xs uppercase tracking-wider mb-1 font-medium">Bet</div>
            <div className={`text-xl font-bold ${bet.color}`}>${kellyBet}</div>
            <div className={`text-xs mt-0.5 ${bet.color} opacity-60`}>{units}u · {bet.edge}</div>
          </div>
        </div>

        {underbankrolled && (
          <div className="mb-2 text-orange-400 text-xs font-semibold text-center bg-orange-950/60 rounded-lg py-1.5 border border-orange-900/60">
            ⚠️ Low bankroll — spread limited. Recommended minimum: ${(ruleSet.tableMin * 20).toLocaleString()} MXN
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-gray-700 text-xs">{ruleSet.soft17} · {ruleSet.blackjackPayout}</span>
          <div className="flex-1 bg-gray-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                penetration > 75 ? 'bg-red-500' : penetration > 50 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${penetration}%` }}
            />
          </div>
          <span className="text-gray-700 text-xs">{penetration.toFixed(0)}%</span>
        </div>

      </div>
    </div>
  );
}
