'use client';

import { KellyConfig } from '@/lib/types';

interface SessionStats {
  hands: number;
  wins: number;
  losses: number;
  pushes: number;
  bjs: number;
  expectedEV: number;
}

interface StatsPanelProps {
  stats: SessionStats;
  balance: number;
  startingBalance: number;
  kellyConfig: KellyConfig;
  onClose: () => void;
}

// Risk of ruin based on Kelly fraction (theoretical infinite-session approximation).
// Derived from: RoR ≈ exp(-2 / (fraction × variance))
// Blackjack variance ≈ 1.33
function calcRoR(fraction: 'full' | 'half' | 'quarter'): number {
  const f = fraction === 'full' ? 1 : fraction === 'half' ? 0.5 : 0.25;
  return Math.exp(-2 / (f * 1.33));
}

function pct(n: number, total: number): string {
  if (total === 0) return '—';
  return ((n / total) * 100).toFixed(1) + '%';
}

function fmt(n: number): string {
  const sign = n >= 0 ? '+' : '';
  return sign + '$' + Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function StatsPanel({ stats, balance, startingBalance, kellyConfig, onClose }: StatsPanelProps) {
  const pnl = balance - startingBalance;
  const ror = calcRoR(kellyConfig.fraction);
  const rorPct = (ror * 100).toFixed(1) + '%';
  const expectedPnl = stats.expectedEV;
  const variance = pnl - expectedPnl;
  const fractionLabel = kellyConfig.fraction === 'full' ? 'Full' : kellyConfig.fraction === 'half' ? '½' : '¼';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-gray-900 border-t border-gray-700 rounded-t-2xl shadow-2xl p-6 pb-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-bold text-lg">Session Stats</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-xl w-7 h-7 flex items-center justify-center">×</button>
        </div>

        {/* Balance summary */}
        <div className="flex items-center justify-between bg-gray-800 rounded-xl p-4 mb-4 border border-gray-700">
          <div>
            <div className="text-gray-500 text-xs uppercase tracking-wider mb-1">Balance</div>
            <div className="text-2xl font-bold text-white">${balance.toLocaleString()}</div>
          </div>
          <div className="text-right">
            <div className="text-gray-500 text-xs uppercase tracking-wider mb-1">Net P&L</div>
            <div className={`text-2xl font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {fmt(pnl)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-gray-500 text-xs uppercase tracking-wider mb-1">Hands</div>
            <div className="text-2xl font-bold text-white">{stats.hands}</div>
          </div>
        </div>

        {/* Result breakdown */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: 'Win', value: stats.wins, color: 'text-green-400' },
            { label: 'BJ', value: stats.bjs, color: 'text-yellow-400' },
            { label: 'Loss', value: stats.losses, color: 'text-red-400' },
            { label: 'Push', value: stats.pushes, color: 'text-gray-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-gray-800 rounded-xl p-3 text-center border border-gray-700/50">
              <div className="text-gray-600 text-xs uppercase tracking-wider mb-1">{label}</div>
              <div className={`text-xl font-bold ${color}`}>{value}</div>
              <div className="text-gray-600 text-xs mt-0.5">{pct(value, stats.hands)}</div>
            </div>
          ))}
        </div>

        {/* EV & Variance */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-gray-800 rounded-xl p-3 border border-gray-700/50">
            <div className="text-gray-500 text-xs uppercase tracking-wider mb-1">Expected EV</div>
            <div className={`text-lg font-bold ${expectedPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {fmt(expectedPnl)}
            </div>
            <div className="text-gray-600 text-xs mt-0.5">based on count + rules</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-3 border border-gray-700/50">
            <div className="text-gray-500 text-xs uppercase tracking-wider mb-1">Variance</div>
            <div className={`text-lg font-bold ${variance >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
              {fmt(variance)}
            </div>
            <div className="text-gray-600 text-xs mt-0.5">actual − expected</div>
          </div>
        </div>

        {/* Risk of Ruin */}
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700/50 flex items-center justify-between">
          <div>
            <div className="text-gray-500 text-xs uppercase tracking-wider mb-1">Risk of Ruin</div>
            <div className={`text-2xl font-bold ${ror > 0.1 ? 'text-red-400' : ror > 0.03 ? 'text-yellow-400' : 'text-green-400'}`}>
              {rorPct}
            </div>
            <div className="text-gray-600 text-xs mt-0.5">{fractionLabel} Kelly · ${kellyConfig.bankroll} bankroll</div>
          </div>
          <div className="text-right text-gray-600 text-xs max-w-[140px]">
            Probability of losing your entire bankroll over infinite play at this Kelly fraction
          </div>
        </div>
      </div>
    </div>
  );
}
