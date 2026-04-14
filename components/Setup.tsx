'use client';

import { useState } from 'react';
import { RuleSet, KellyConfig } from '@/lib/types';

interface SetupProps {
  onStart: (numDecks: number, numPlayers: number, youSeat: number, ruleSet: RuleSet, kellyConfig: KellyConfig) => void;
}

const DECK_OPTIONS = [1, 2, 4, 6, 8];
const PLAYER_OPTIONS = [1, 2, 3, 4, 5, 6, 7];

function ToggleButton({ active, onClick, children, danger }: { active: boolean; onClick: () => void; children: React.ReactNode; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
        active
          ? danger
            ? 'bg-red-600 text-white shadow-lg scale-105'
            : 'bg-yellow-500 text-black shadow-lg scale-105'
          : 'bg-green-800 text-green-200 hover:bg-green-700'
      }`}
    >
      {children}
    </button>
  );
}

export default function Setup({ onStart }: SetupProps) {
  const [numDecks, setNumDecks] = useState(6);
  const [numPlayers, setNumPlayers] = useState(3);
  const [youSeat, setYouSeat] = useState(1);

  // Rule set
  const [payout, setPayout] = useState<'3:2' | '6:5'>('3:2');
  const [soft17, setSoft17] = useState<'S17' | 'H17'>('H17');
  const [das, setDas] = useState(true);
  const [rsa, setRsa] = useState(false);
  const [surrender, setSurrender] = useState<'none' | 'late' | 'early'>('late');
  const [tableMin, setTableMin] = useState(15);
  const [tableMax, setTableMax] = useState(500);

  // Kelly
  const [bankroll, setBankroll] = useState(500);
  const [kellyFraction, setKellyFraction] = useState<'full' | 'half' | 'quarter'>('half');

  function handleNumPlayers(n: number) {
    setNumPlayers(n);
    if (youSeat > n) setYouSeat(n);
  }

  function handleStart() {
    const ruleSet: RuleSet = { blackjackPayout: payout, soft17, das, rsa, surrender, tableMin, tableMax };
    const kellyConfig: KellyConfig = { bankroll, fraction: kellyFraction };
    onStart(numDecks, numPlayers, youSeat, ruleSet, kellyConfig);
  }

  return (
    <div className="min-h-screen bg-green-950 flex items-center justify-center p-4">
      <div className="bg-green-900 border border-green-700 rounded-2xl p-8 w-full max-w-lg shadow-2xl">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🂡</div>
          <h1 className="text-3xl font-bold text-white tracking-wide">Blackjack Counter</h1>
          <p className="text-green-400 mt-2 text-sm">Hi-Lo Card Counting Assistant</p>
        </div>

        <div className="space-y-6">
          {/* Decks */}
          <div>
            <label className="block text-green-300 text-sm font-semibold mb-3 uppercase tracking-wider">
              Number of Decks
            </label>
            <div className="grid grid-cols-5 gap-2">
              {DECK_OPTIONS.map(d => (
                <button
                  key={d}
                  onClick={() => setNumDecks(d)}
                  className={`py-3 rounded-lg font-bold text-lg transition-all ${
                    numDecks === d
                      ? 'bg-yellow-500 text-black shadow-lg scale-105'
                      : 'bg-green-800 text-green-200 hover:bg-green-700'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Players */}
          <div>
            <label className="block text-green-300 text-sm font-semibold mb-3 uppercase tracking-wider">
              Players at Table
            </label>
            <div className="grid grid-cols-7 gap-2">
              {PLAYER_OPTIONS.map(p => (
                <button
                  key={p}
                  onClick={() => handleNumPlayers(p)}
                  className={`py-3 rounded-lg font-bold text-lg transition-all ${
                    numPlayers === p
                      ? 'bg-yellow-500 text-black shadow-lg scale-105'
                      : 'bg-green-800 text-green-200 hover:bg-green-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Your seat */}
          <div>
            <label className="block text-green-300 text-sm font-semibold mb-3 uppercase tracking-wider">
              Your Seat
            </label>
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: `repeat(${numPlayers}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: numPlayers }, (_, i) => i + 1).map(seat => (
                <button
                  key={seat}
                  onClick={() => setYouSeat(seat)}
                  className={`py-3 rounded-lg font-bold text-base transition-all ${
                    youSeat === seat
                      ? 'bg-blue-500 text-white shadow-lg scale-105'
                      : 'bg-green-800 text-green-200 hover:bg-green-700'
                  }`}
                >
                  P{seat}
                </button>
              ))}
            </div>
          </div>

          {/* Table Rules */}
          <div>
            <label className="block text-green-300 text-sm font-semibold mb-3 uppercase tracking-wider">
              Table Rules
            </label>
            <div className="space-y-3 bg-green-800/40 rounded-xl p-4 border border-green-700">
              {/* Payout */}
              <div className="flex items-center justify-between">
                <span className="text-green-300 text-sm">Blackjack Pays</span>
                <div className="flex gap-2">
                  <ToggleButton active={payout === '3:2'} onClick={() => setPayout('3:2')}>3:2</ToggleButton>
                  <ToggleButton active={payout === '6:5'} onClick={() => setPayout('6:5')} danger>6:5</ToggleButton>
                </div>
              </div>

              {/* Soft 17 */}
              <div className="flex items-center justify-between">
                <span className="text-green-300 text-sm">Dealer Soft 17</span>
                <div className="flex gap-2">
                  <ToggleButton active={soft17 === 'S17'} onClick={() => setSoft17('S17')}>S17</ToggleButton>
                  <ToggleButton active={soft17 === 'H17'} onClick={() => setSoft17('H17')} danger>H17</ToggleButton>
                </div>
              </div>

              {/* DAS */}
              <div className="flex items-center justify-between">
                <span className="text-green-300 text-sm">Double After Split</span>
                <div className="flex gap-2">
                  <ToggleButton active={das} onClick={() => setDas(true)}>Yes</ToggleButton>
                  <ToggleButton active={!das} onClick={() => setDas(false)} danger>No</ToggleButton>
                </div>
              </div>

              {/* RSA */}
              <div className="flex items-center justify-between">
                <span className="text-green-300 text-sm">Resplit Aces</span>
                <div className="flex gap-2">
                  <ToggleButton active={rsa} onClick={() => setRsa(true)}>Yes</ToggleButton>
                  <ToggleButton active={!rsa} onClick={() => setRsa(false)}>No</ToggleButton>
                </div>
              </div>

              {/* Surrender */}
              <div className="flex items-center justify-between">
                <span className="text-green-300 text-sm">Surrender</span>
                <div className="flex gap-2">
                  <ToggleButton active={surrender === 'early'} onClick={() => setSurrender('early')}>Early</ToggleButton>
                  <ToggleButton active={surrender === 'late'} onClick={() => setSurrender('late')}>Late</ToggleButton>
                  <ToggleButton active={surrender === 'none'} onClick={() => setSurrender('none')} danger>None</ToggleButton>
                </div>
              </div>

              {/* Table limits */}
              <div className="flex items-center justify-between gap-4 pt-1">
                <span className="text-green-300 text-sm">Table Min / Max</span>
                <div className="flex items-center gap-2">
                  <span className="text-green-500 text-sm">$</span>
                  <input
                    type="number"
                    value={tableMin}
                    min={1}
                    onChange={e => setTableMin(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 bg-green-900 border border-green-600 rounded-lg px-2 py-1.5 text-white text-sm text-center focus:outline-none focus:border-yellow-500"
                  />
                  <span className="text-green-500 text-sm">–</span>
                  <span className="text-green-500 text-sm">$</span>
                  <input
                    type="number"
                    value={tableMax}
                    min={tableMin}
                    onChange={e => setTableMax(Math.max(tableMin, parseInt(e.target.value) || tableMin))}
                    className="w-20 bg-green-900 border border-green-600 rounded-lg px-2 py-1.5 text-white text-sm text-center focus:outline-none focus:border-yellow-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Kelly Bankroll */}
          <div>
            <label className="block text-green-300 text-sm font-semibold mb-3 uppercase tracking-wider">
              Kelly Bet Sizing
            </label>
            <div className="space-y-3 bg-green-800/40 rounded-xl p-4 border border-green-700">
              <div className="flex items-center justify-between gap-4">
                <span className="text-green-300 text-sm">Session Bankroll</span>
                <div className="flex items-center gap-2">
                  <span className="text-green-500 text-sm">$</span>
                  <input
                    type="number"
                    value={bankroll}
                    min={1}
                    onChange={e => setBankroll(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-28 bg-green-900 border border-green-600 rounded-lg px-2 py-1.5 text-white text-sm text-center focus:outline-none focus:border-yellow-500"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-green-300 text-sm">Kelly Fraction</span>
                <div className="flex gap-2">
                  <ToggleButton active={kellyFraction === 'quarter'} onClick={() => setKellyFraction('quarter')}>¼</ToggleButton>
                  <ToggleButton active={kellyFraction === 'half'} onClick={() => setKellyFraction('half')}>½</ToggleButton>
                  <ToggleButton active={kellyFraction === 'full'} onClick={() => setKellyFraction('full')}>Full</ToggleButton>
                </div>
              </div>
              <p className="text-green-600 text-xs">
                ½ Kelly recommended — same growth rate, half the variance
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-green-800/50 rounded-xl p-4 text-sm text-green-300 border border-green-700 space-y-1">
            <div className="flex justify-between">
              <span>Shoe:</span>
              <span className="text-white font-bold">{numDecks} deck{numDecks > 1 ? 's' : ''} · {numDecks * 52} cards</span>
            </div>
            <div className="flex justify-between">
              <span>Players:</span>
              <span className="text-white font-bold">{numPlayers} · You are <span className="text-blue-400">P{youSeat}</span></span>
            </div>
            <div className="flex justify-between">
              <span>Rules:</span>
              <span className={`font-bold ${payout === '6:5' ? 'text-red-400' : 'text-white'}`}>
                {payout} · {soft17} · {surrender !== 'none' ? surrender.charAt(0).toUpperCase() + surrender.slice(1) + ' Sur.' : 'No Sur.'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Bankroll:</span>
              <span className="text-white font-bold">${bankroll} · {kellyFraction === 'quarter' ? '¼' : kellyFraction === 'half' ? '½' : 'Full'} Kelly</span>
            </div>
            {payout === '6:5' && (
              <div className="mt-2 text-red-400 text-xs font-semibold text-center bg-red-950/50 rounded-lg p-2">
                ⚠️ 6:5 payout costs −1.39% edge. Consider finding a 3:2 table.
              </div>
            )}
          </div>

          <button
            onClick={handleStart}
            className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xl rounded-xl transition-all shadow-lg hover:shadow-yellow-500/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
}
