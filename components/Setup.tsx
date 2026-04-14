'use client';

import { useState } from 'react';

interface SetupProps {
  onStart: (numDecks: number, numPlayers: number) => void;
}

const DECK_OPTIONS = [1, 2, 4, 6, 8];
const PLAYER_OPTIONS = [1, 2, 3, 4, 5, 6, 7];

export default function Setup({ onStart }: SetupProps) {
  const [numDecks, setNumDecks] = useState(6);
  const [numPlayers, setNumPlayers] = useState(3);

  return (
    <div className="min-h-screen bg-green-950 flex items-center justify-center p-4">
      <div className="bg-green-900 border border-green-700 rounded-2xl p-8 w-full max-w-md shadow-2xl">
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
                  onClick={() => setNumPlayers(p)}
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

          {/* Summary */}
          <div className="bg-green-800/50 rounded-xl p-4 text-sm text-green-300 border border-green-700">
            <div className="flex justify-between">
              <span>Total cards in shoe:</span>
              <span className="text-white font-bold">{numDecks * 52}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Players (you + others):</span>
              <span className="text-white font-bold">{numPlayers}</span>
            </div>
          </div>

          <button
            onClick={() => onStart(numDecks, numPlayers)}
            className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xl rounded-xl transition-all shadow-lg hover:shadow-yellow-500/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
}
