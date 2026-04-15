'use client';

import { useState } from 'react';
import { GameState, CardRank, Card, Hand, Player } from '@/lib/types';
import { getHiLoValue, calcTrueCount, calcRemainingCards, getKellyBet, calcBaselineEdge } from '@/lib/cardCounting';
import { isPair } from '@/lib/cardCounting';
import CountDisplay from './CountDisplay';
import DealerHand from './DealerHand';
import PlayerHand from './PlayerHand';
import CardInputPanel from './CardInputPanel';
import CardDrawer from './CardDrawer';
import StatsPanel from './StatsPanel';

interface GameBoardProps {
  initialState: GameState;
  onReset: () => void;
}

interface HistoryEntry {
  state: GameState;
}

interface SessionStats {
  hands: number;
  wins: number;
  losses: number;
  pushes: number;
  bjs: number;
  expectedEV: number;
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
  const [balance, setBalance] = useState(initialState.kellyConfig.bankroll);
  const [shuffleSignal, setShuffleSignal] = useState(0);
  const [casinoMode, setCasinoMode] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    hands: 0, wins: 0, losses: 0, pushes: 0, bjs: 0, expectedEV: 0,
  });

  const remaining = calcRemainingCards(state.totalCards, state.cardsDealt);
  const trueCount = casinoMode ? 0 : calcTrueCount(state.runningCount, remaining);
  const dealerUpCard: CardRank | null = state.dealer.hands[0]?.cards[0]?.rank ?? null;

  // Bet is frozen at the start of each round — only updates on New Round / Shuffle
  const [kellyBet, setKellyBet] = useState(() =>
    casinoMode ? state.ruleSet.tableMin : getKellyBet(trueCount, state.ruleSet, state.kellyConfig)
  );
  const [frozenTrueCount, setFrozenTrueCount] = useState(() => casinoMode ? 0 : trueCount);

  function recordResult(multiplier: number, type: 'win' | 'loss' | 'push' | 'bj') {
    const baseEdge = calcBaselineEdge(state.ruleSet);
    const edgePct = (trueCount * 0.5 + baseEdge) / 100;
    const ev = kellyBet * edgePct;

    setBalance(b => Math.round((b + kellyBet * multiplier) * 100) / 100);
    setSessionStats(s => ({
      hands: s.hands + 1,
      wins: s.wins + (type === 'win' ? 1 : 0),
      losses: s.losses + (type === 'loss' ? 1 : 0),
      pushes: s.pushes + (type === 'push' ? 1 : 0),
      bjs: s.bjs + (type === 'bj' ? 1 : 0),
      expectedEV: Math.round((s.expectedEV + ev) * 100) / 100,
    }));
  }

  function pushHistory(s: GameState) {
    setHistory(h => [...h.slice(-49), { state: cloneState(s) }]);
  }

  function addCard(rank: CardRank) {
    if (casinoMode) return; // no tracking in casino mode
    setState(prev => {
      pushHistory(prev);
      const next = cloneState(prev);
      const card: Card = { rank };

      if (next.activePlayerId === 'dealer') {
        const dealerHand = next.dealer.hands[0];
        dealerHand.cards.push(card);
        // If hole card was pending, this card reveals it — clear the flag
        if (dealerHand.hasHiddenCard) dealerHand.hasHiddenCard = false;
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

  function toggleDealerHiddenCard() {
    setState(prev => {
      const next = cloneState(prev);
      const hand = next.dealer.hands[0];
      hand.hasHiddenCard = !hand.hasHiddenCard;
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
      next.dealer.hands = [{ id: newHandId(), cards: [], hasHiddenCard: false }];
      next.players = next.players.map(p => ({
        ...p,
        hands: [{ id: newHandId(), cards: [] }],
      }));
      const firstPlayer = next.players[0];
      next.activePlayerId = firstPlayer?.id ?? 'dealer';
      next.activeHandId = firstPlayer?.hands[0]?.id ?? next.dealer.hands[0].id;
      return next;
    });
    // Snapshot bet for the upcoming round based on current count
    const nextBetTC = casinoMode ? 0 : trueCount;
    setKellyBet(casinoMode ? state.ruleSet.tableMin : getKellyBet(trueCount, state.ruleSet, state.kellyConfig));
    setFrozenTrueCount(nextBetTC);
    setHistory([]);
  }

  function shuffleDeck() {
    setState(prev => {
      const next = cloneState(prev);
      next.runningCount = 0;
      next.cardsDealt = 0;
      next.dealer.hands = [{ id: newHandId(), cards: [], hasHiddenCard: false }];
      next.players = next.players.map(p => ({
        ...p,
        hands: [{ id: newHandId(), cards: [] }],
      }));
      const firstPlayer = next.players[0];
      next.activePlayerId = firstPlayer?.id ?? 'dealer';
      next.activeHandId = firstPlayer?.hands[0]?.id ?? next.dealer.hands[0].id;
      return next;
    });
    // After shuffle, count resets to 0 → always table min
    setKellyBet(state.ruleSet.tableMin);
    setFrozenTrueCount(0);
    setHistory([]);
    setShuffleSignal(s => s + 1);
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
      if (next.youPlayerId === id) next.youPlayerId = '';
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

  const pnl = balance - initialState.kellyConfig.bankroll;

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <CountDisplay
        runningCount={state.runningCount}
        cardsDealt={state.cardsDealt}
        totalCards={state.totalCards}
        ruleSet={state.ruleSet}
        kellyConfig={state.kellyConfig}
        kellyBet={kellyBet}
        frozenTrueCount={frozenTrueCount}
        casinoMode={casinoMode}
      />

      {/* Action bar */}
      <div className="bg-gray-900 border-b border-gray-800 px-3 md:px-4 py-2">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center gap-2">

          {/* Row 1: game controls */}
          <div className="flex items-center gap-1.5 md:gap-2">
            <button onClick={newRound} className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white text-sm rounded-lg font-medium transition-colors">
              New Round
            </button>
            <button onClick={shuffleDeck} className="px-3 py-1.5 bg-orange-700 hover:bg-orange-600 text-white text-sm rounded-lg font-medium transition-colors">
              Shuffle
            </button>
            <button
              onClick={addPlayer}
              disabled={state.players.length >= 7}
              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              + Player
            </button>
            <button
              onClick={() => {
                const next = !casinoMode;
                setCasinoMode(next);
                setKellyBet(next ? state.ruleSet.tableMin : getKellyBet(trueCount, state.ruleSet, state.kellyConfig));
                setFrozenTrueCount(next ? 0 : trueCount);
              }}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors border ${
                casinoMode
                  ? 'bg-blue-900 border-blue-600 text-blue-300'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              {casinoMode ? 'Casino' : 'Count'} Mode
            </button>
            {/* Setup — mobile only, sits at end of row 1 */}
            <button onClick={onReset} className="md:hidden ml-auto px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-500 text-sm rounded-lg transition-colors border border-gray-700">
              ← Setup
            </button>
          </div>

          {/* Row 2 on mobile / right side on desktop */}
          <div className="flex items-center gap-1.5 md:gap-2 md:ml-auto">
            {/* Balance */}
            <button
              onClick={() => setShowStats(true)}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 rounded-lg px-3 py-1.5 border border-gray-700 transition-colors"
            >
              <span className="text-gray-500 text-xs">Balance</span>
              <span className={`text-sm font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${balance.toLocaleString()}
              </span>
              <span className="text-gray-600 text-xs">MXN</span>
              {sessionStats.hands > 0 && (
                <span className={`text-xs ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ({pnl >= 0 ? '+' : ''}${pnl.toLocaleString()})
                </span>
              )}
            </button>

            {/* Result buttons — taller on mobile for easier tapping */}
            <div className="flex items-center gap-1">
              <button onClick={() => recordResult(1.5, 'bj')} className="px-2 py-2.5 md:py-1.5 bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-bold rounded-lg transition-colors touch-manipulation" title="Blackjack (+1.5×)">BJ</button>
              <button onClick={() => recordResult(1, 'win')} className="px-2 py-2.5 md:py-1.5 bg-green-700 hover:bg-green-600 text-white text-xs font-bold rounded-lg transition-colors touch-manipulation" title="Win (+1×)">W</button>
              <button onClick={() => recordResult(-1, 'loss')} className="px-2 py-2.5 md:py-1.5 bg-red-800 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors touch-manipulation" title="Loss (−1×)">L</button>
              <button onClick={() => recordResult(0, 'push')} className="px-2 py-2.5 md:py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-bold rounded-lg transition-colors touch-manipulation" title="Push">P</button>
              <div className="w-px h-5 bg-gray-700 mx-0.5" />
              <button onClick={() => recordResult(2, 'win')} className="px-2 py-2.5 md:py-1.5 bg-green-900 hover:bg-green-800 text-green-300 text-xs font-bold rounded-lg transition-colors border border-green-700 touch-manipulation" title="Double Win (+2×)">DW</button>
              <button onClick={() => recordResult(-2, 'loss')} className="px-2 py-2.5 md:py-1.5 bg-red-950 hover:bg-red-900 text-red-300 text-xs font-bold rounded-lg transition-colors border border-red-800 touch-manipulation" title="Double Loss (−2×)">DL</button>
            </div>

            {/* Setup — desktop only */}
            <button onClick={onReset} className="hidden md:block px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-500 text-sm rounded-lg transition-colors border border-gray-700">
              ← Setup
            </button>
          </div>

        </div>
      </div>

      {/* Main play area */}
      <div className="flex-1 overflow-auto p-4 bg-gray-950">
        <div className="max-w-4xl mx-auto space-y-4">
          <DealerHand
            dealer={state.dealer}
            isActive={state.activePlayerId === 'dealer'}
            onSelect={() => setActive('dealer')}
            onToggleHiddenCard={toggleDealerHiddenCard}
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
                ruleSet={state.ruleSet}
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

      {!casinoMode && <CardDrawer numDecks={state.numDecks} shuffleSignal={shuffleSignal} />}

      {showStats && (
        <StatsPanel
          stats={sessionStats}
          balance={balance}
          startingBalance={initialState.kellyConfig.bankroll}
          kellyConfig={initialState.kellyConfig}
          onClose={() => setShowStats(false)}
        />
      )}
    </div>
  );
}
