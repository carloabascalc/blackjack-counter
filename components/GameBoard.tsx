'use client';

import { useState } from 'react';
import { GameState, CardRank, Card } from '@/lib/types';
import { getHiLoValue, calcTrueCount, calcRemainingCards } from '@/lib/cardCounting';
import CountDisplay from './CountDisplay';
import DealerHand from './DealerHand';
import PlayerHand from './PlayerHand';
import CardInputPanel from './CardInputPanel';

interface GameBoardProps {
  initialState: GameState;
  onReset: () => void;
}

interface HistoryEntry {
  state: GameState;
}

function cloneState(state: GameState): GameState {
  return {
    ...state,
    players: state.players.map(p => ({ ...p, cards: [...p.cards] })),
    dealer: { ...state.dealer, cards: [...state.dealer.cards] },
  };
}

let playerIdCounter = 100;

export default function GameBoard({ initialState, onReset }: GameBoardProps) {
  const [state, setState] = useState<GameState>(cloneState(initialState));
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const remaining = calcRemainingCards(state.totalCards, state.cardsDealt);
  const trueCount = calcTrueCount(state.runningCount, remaining);
  const dealerUpCard: CardRank | null = state.dealer.cards[0]?.rank ?? null;

  const activePlayer = state.activePlayerId === 'dealer'
    ? state.dealer
    : state.players.find(p => p.id === state.activePlayerId) ?? state.players[0];

  function pushHistory(s: GameState) {
    setHistory(h => [...h.slice(-49), { state: cloneState(s) }]);
  }

  function addCard(rank: CardRank) {
    setState(prev => {
      pushHistory(prev);
      const next = cloneState(prev);
      const card: Card = { rank };
      const hiloVal = getHiLoValue(card);

      if (next.activePlayerId === 'dealer') {
        next.dealer.cards.push(card);
      } else {
        const p = next.players.find(p => p.id === next.activePlayerId);
        if (p) p.cards.push(card);
      }

      next.runningCount += hiloVal;
      next.cardsDealt += 1;
      return next;
    });
  }

  function undo() {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setState(cloneState(prev.state));
  }

  function newRound() {
    setState(prev => {
      const next = cloneState(prev);
      next.dealer = { ...next.dealer, cards: [] };
      next.players = next.players.map(p => ({ ...p, cards: [] }));
      // keep running count — same shoe
      return next;
    });
    setHistory([]);
  }

  function shuffleDeck() {
    setState(prev => {
      const next = cloneState(prev);
      next.runningCount = 0;
      next.cardsDealt = 0;
      next.dealer = { ...next.dealer, cards: [] };
      next.players = next.players.map(p => ({ ...p, cards: [] }));
      return next;
    });
    setHistory([]);
  }

  function addPlayer() {
    if (state.players.length >= 7) return;
    setState(prev => {
      const next = cloneState(prev);
      const id = `player-${++playerIdCounter}`;
      next.players.push({ id, name: `P${next.players.length + 1}`, cards: [] });
      return next;
    });
  }

  function removePlayer(id: string) {
    setState(prev => {
      const next = cloneState(prev);
      next.players = next.players.filter(p => p.id !== id);
      // Renumber
      next.players.forEach((p, i) => { p.name = `P${i + 1}`; });
      // If removed active, fall back to first player
      if (next.activePlayerId === id) {
        next.activePlayerId = next.players[0]?.id ?? 'dealer';
      }
      return next;
    });
  }

  function setActive(id: string) {
    setState(prev => ({ ...prev, activePlayerId: id }));
  }

  return (
    <div className="min-h-screen bg-green-950 flex flex-col">
      {/* Top count bar */}
      <CountDisplay
        runningCount={state.runningCount}
        cardsDealt={state.cardsDealt}
        totalCards={state.totalCards}
      />

      {/* Action bar */}
      <div className="bg-green-900/80 border-b border-green-800 px-4 py-2">
        <div className="max-w-4xl mx-auto flex items-center gap-2 flex-wrap">
          <button
            onClick={newRound}
            className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white text-sm rounded-lg font-medium transition-colors"
          >
            New Round
          </button>
          <button
            onClick={shuffleDeck}
            className="px-3 py-1.5 bg-orange-700 hover:bg-orange-600 text-white text-sm rounded-lg font-medium transition-colors"
          >
            🔀 Shuffle Deck
          </button>
          <button
            onClick={addPlayer}
            disabled={state.players.length >= 7}
            className="px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white text-sm rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            + Add Player
          </button>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-green-500 text-xs">{state.numDecks} deck{state.numDecks > 1 ? 's' : ''}</span>
            <button
              onClick={onReset}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors border border-gray-700"
            >
              ← Setup
            </button>
          </div>
        </div>
      </div>

      {/* Main play area */}
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Dealer */}
          <DealerHand
            dealer={state.dealer}
            isActive={state.activePlayerId === 'dealer'}
            onSelect={() => setActive('dealer')}
          />

          {/* Players grid */}
          <div className={`grid gap-3 ${
            state.players.length === 1 ? 'grid-cols-1' :
            state.players.length <= 2 ? 'grid-cols-2' :
            state.players.length <= 4 ? 'grid-cols-2' :
            'grid-cols-3'
          }`}>
            {state.players.map((player, i) => (
              <PlayerHand
                key={player.id}
                player={player}
                dealerUpCard={dealerUpCard}
                trueCount={trueCount}
                isActive={state.activePlayerId === player.id}
                isYou={i === 0}
                onSelect={() => setActive(player.id)}
                onRemove={() => removePlayer(player.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Card input panel — fixed bottom */}
      <CardInputPanel
        onCardSelect={addCard}
        onUndo={undo}
        canUndo={history.length > 0}
        activePlayerName={activePlayer?.name ?? 'Dealer'}
      />
    </div>
  );
}
