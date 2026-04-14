'use client';

import { useState } from 'react';
import { GameState, CardRank, Card, Hand, Player } from '@/lib/types';
import { getHiLoValue, calcTrueCount, calcRemainingCards } from '@/lib/cardCounting';
import { isPair } from '@/lib/cardCounting';
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

let _handIdCounter = 200;
function newHandId() { return `hand-${++_handIdCounter}`; }
let _playerIdCounter = 200;

function cloneHand(h: Hand): Hand {
  return { ...h, cards: [...h.cards] };
}

function clonePlayer(p: Player): Player {
  return { ...p, hands: p.hands.map(cloneHand) };
}

function cloneState(state: GameState): GameState {
  return {
    ...state,
    players: state.players.map(clonePlayer),
    dealer: clonePlayer(state.dealer),
  };
}

function getActiveLabel(state: GameState): string {
  if (state.activePlayerId === 'dealer') return 'Dealer';
  const player = state.players.find(p => p.id === state.activePlayerId);
  if (!player) return '?';
  if (player.hands.length === 1) return player.name;
  const handIdx = player.hands.findIndex(h => h.id === state.activeHandId);
  return `${player.name} — Hand ${handIdx + 1}`;
}

export default function GameBoard({ initialState, onReset }: GameBoardProps) {
  const [state, setState] = useState<GameState>(cloneState(initialState));
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const remaining = calcRemainingCards(state.totalCards, state.cardsDealt);
  const trueCount = calcTrueCount(state.runningCount, remaining);
  const dealerUpCard: CardRank | null = state.dealer.hands[0]?.cards[0]?.rank ?? null;

  function pushHistory(s: GameState) {
    setHistory(h => [...h.slice(-49), { state: cloneState(s) }]);
  }

  function addCard(rank: CardRank) {
    setState(prev => {
      pushHistory(prev);
      const next = cloneState(prev);
      const card: Card = { rank };

      if (next.activePlayerId === 'dealer') {
        next.dealer.hands[0].cards.push(card);
      } else {
        const player = next.players.find(p => p.id === next.activePlayerId);
        if (player) {
          const hand = player.hands.find(h => h.id === next.activeHandId) ?? player.hands[0];
          if (hand) hand.cards.push(card);
        }
      }

      next.runningCount += getHiLoValue(card);
      next.cardsDealt += 1;
      return next;
    });
  }

  function splitHand(playerId: string, handId: string) {
    setState(prev => {
      const player = prev.players.find(p => p.id === playerId);
      const hand = player?.hands.find(h => h.id === handId);
      if (!hand || hand.cards.length !== 2 || !isPair(hand.cards)) return prev;

      pushHistory(prev);
      const next = cloneState(prev);
      const nextPlayer = next.players.find(p => p.id === playerId)!;
      const handIdx = nextPlayer.hands.findIndex(h => h.id === handId);

      const hand1: Hand = { id: newHandId(), cards: [hand.cards[0]] };
      const hand2: Hand = { id: newHandId(), cards: [hand.cards[1]] };

      nextPlayer.hands.splice(handIdx, 1, hand1, hand2);
      next.activePlayerId = playerId;
      next.activeHandId = hand1.id;
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
      next.dealer.hands = [{ id: newHandId(), cards: [] }];
      next.players = next.players.map(p => ({
        ...p,
        hands: [{ id: newHandId(), cards: [] }],
      }));
      const firstPlayer = next.players[0];
      next.activePlayerId = firstPlayer?.id ?? 'dealer';
      next.activeHandId = firstPlayer?.hands[0]?.id ?? next.dealer.hands[0].id;
      return next;
    });
    setHistory([]);
  }

  function shuffleDeck() {
    setState(prev => {
      const next = cloneState(prev);
      next.runningCount = 0;
      next.cardsDealt = 0;
      next.dealer.hands = [{ id: newHandId(), cards: [] }];
      next.players = next.players.map(p => ({
        ...p,
        hands: [{ id: newHandId(), cards: [] }],
      }));
      const firstPlayer = next.players[0];
      next.activePlayerId = firstPlayer?.id ?? 'dealer';
      next.activeHandId = firstPlayer?.hands[0]?.id ?? next.dealer.hands[0].id;
      return next;
    });
    setHistory([]);
  }

  function addPlayer() {
    if (state.players.length >= 7) return;
    setState(prev => {
      const next = cloneState(prev);
      const id = `player-${++_playerIdCounter}`;
      const hand = { id: newHandId(), cards: [] };
      next.players.push({ id, name: `P${next.players.length + 1}`, isYou: false, hands: [hand] });
      return next;
    });
  }

  function removePlayer(id: string) {
    setState(prev => {
      const next = cloneState(prev);
      next.players = next.players.filter(p => p.id !== id);
      next.players.forEach((p, i) => { p.name = `P${i + 1}`; });
      if (next.activePlayerId === id) {
        const first = next.players[0];
        next.activePlayerId = first?.id ?? 'dealer';
        next.activeHandId = first?.hands[0]?.id ?? next.dealer.hands[0].id;
      }
      // If removed player was "you", unmark (fallback to no one)
      if (next.youPlayerId === id) {
        next.youPlayerId = '';
      }
      return next;
    });
  }

  function setYou(playerId: string) {
    setState(prev => ({ ...prev, youPlayerId: playerId }));
  }

  function setActive(playerId: string, handId?: string) {
    setState(prev => {
      if (playerId === 'dealer') {
        return { ...prev, activePlayerId: 'dealer', activeHandId: prev.dealer.hands[0]?.id ?? '' };
      }
      const player = prev.players.find(p => p.id === playerId);
      const targetHand = handId
        ? player?.hands.find(h => h.id === handId)
        : player?.hands[0];
      return {
        ...prev,
        activePlayerId: playerId,
        activeHandId: targetHand?.id ?? prev.activeHandId,
      };
    });
  }

  return (
    <div className="min-h-screen bg-green-950 flex flex-col">
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
            🔀 Shuffle
          </button>
          <button
            onClick={addPlayer}
            disabled={state.players.length >= 7}
            className="px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white text-sm rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            + Player
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
          <DealerHand
            dealer={state.dealer}
            isActive={state.activePlayerId === 'dealer'}
            onSelect={() => setActive('dealer')}
          />

          <div className={`grid gap-3 ${
            state.players.length === 1 ? 'grid-cols-1' :
            state.players.length <= 4 ? 'grid-cols-2' :
            'grid-cols-3'
          }`}>
            {state.players.map(player => (
              <PlayerHand
                key={player.id}
                player={player}
                dealerUpCard={dealerUpCard}
                trueCount={trueCount}
                isActive={state.activePlayerId === player.id}
                activeHandId={state.activePlayerId === player.id ? state.activeHandId : null}
                isYou={player.id === state.youPlayerId}
                onSelectHand={(handId) => setActive(player.id, handId)}
                onRemove={() => removePlayer(player.id)}
                onSplit={(handId) => splitHand(player.id, handId)}
                onSetYou={() => setYou(player.id)}
              />
            ))}
          </div>
        </div>
      </div>

      <CardInputPanel
        onCardSelect={addCard}
        onUndo={undo}
        canUndo={history.length > 0}
        activeLabel={getActiveLabel(state)}
      />
    </div>
  );
}
