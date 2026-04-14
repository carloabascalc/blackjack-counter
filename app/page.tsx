'use client';

import { useState } from 'react';
import Setup from '@/components/Setup';
import GameBoard from '@/components/GameBoard';
import { GameState } from '@/lib/types';

let playerIdSeed = 1;

function createInitialState(numDecks: number, numPlayers: number): GameState {
  playerIdSeed = 1;
  const players = Array.from({ length: numPlayers }, (_, i) => ({
    id: `player-${playerIdSeed++}`,
    name: `P${i + 1}`,
    cards: [],
  }));

  return {
    numDecks,
    totalCards: numDecks * 52,
    cardsDealt: 0,
    runningCount: 0,
    players,
    dealer: { id: 'dealer', name: 'Dealer', cards: [] },
    activePlayerId: players[0]?.id ?? 'dealer',
  };
}

export default function Home() {
  const [gameState, setGameState] = useState<GameState | null>(null);

  function handleStart(numDecks: number, numPlayers: number) {
    setGameState(createInitialState(numDecks, numPlayers));
  }

  function handleReset() {
    setGameState(null);
  }

  if (!gameState) {
    return <Setup onStart={handleStart} />;
  }

  return <GameBoard initialState={gameState} onReset={handleReset} />;
}
