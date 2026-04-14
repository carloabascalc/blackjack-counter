'use client';

import { useState } from 'react';
import Setup from '@/components/Setup';
import GameBoard from '@/components/GameBoard';
import { GameState, Player } from '@/lib/types';

let playerIdSeed = 1;
let handIdSeed = 1;

function makeHand() {
  return { id: `hand-${handIdSeed++}`, cards: [] };
}

function createInitialState(numDecks: number, numPlayers: number, youSeat: number): GameState {
  playerIdSeed = 1;
  handIdSeed = 1;

  const players: Player[] = Array.from({ length: numPlayers }, (_, i) => {
    const id = `player-${playerIdSeed++}`;
    return {
      id,
      name: `P${i + 1}`,
      isYou: i + 1 === youSeat,
      hands: [makeHand()],
    };
  });

  const dealerHand = makeHand();
  const dealer: Player = { id: 'dealer', name: 'Dealer', isYou: false, hands: [dealerHand] };

  const firstPlayerId = players[0]?.id ?? 'dealer';
  const firstHandId = players[0]?.hands[0]?.id ?? dealerHand.id;

  return {
    numDecks,
    totalCards: numDecks * 52,
    cardsDealt: 0,
    runningCount: 0,
    players,
    dealer,
    activePlayerId: firstPlayerId,
    activeHandId: firstHandId,
    youPlayerId: players.find(p => p.isYou)?.id ?? firstPlayerId,
  };
}

export default function Home() {
  const [gameState, setGameState] = useState<GameState | null>(null);

  function handleStart(numDecks: number, numPlayers: number, youSeat: number) {
    setGameState(createInitialState(numDecks, numPlayers, youSeat));
  }

  function handleReset() {
    setGameState(null);
  }

  if (!gameState) {
    return <Setup onStart={handleStart} />;
  }

  return <GameBoard initialState={gameState} onReset={handleReset} />;
}
