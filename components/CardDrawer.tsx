'use client';

import { useState, useEffect } from 'react';
import { CardRank } from '@/lib/types';
import { HI_LO_VALUES } from '@/lib/cardCounting';

const ALL_RANKS: CardRank[] = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const SUITS = ['♠','♥','♦','♣'];

function buildDeck(numDecks: number): CardRank[] {
  const deck: CardRank[] = [];
  for (let d = 0; d < numDecks; d++) {
    for (const rank of ALL_RANKS) {
      for (let i = 0; i < 4; i++) deck.push(rank);
    }
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

interface CardDrawerProps {
  numDecks: number;
  shuffleSignal: number;
}

export default function CardDrawer({ numDecks, shuffleSignal }: CardDrawerProps) {
  const [deck, setDeck] = useState<CardRank[]>(() => buildDeck(numDecks));
  const [pos, setPos] = useState(0);
  const [lastCard, setLastCard] = useState<{ rank: CardRank; suit: string } | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setDeck(buildDeck(numDecks));
    setPos(0);
    setLastCard(null);
  }, [shuffleSignal, numDecks]);

  function draw() {
    let currentDeck = deck;
    let currentPos = pos;

    if (currentPos >= currentDeck.length) {
      currentDeck = buildDeck(numDecks);
      setDeck(currentDeck);
      currentPos = 0;
    }

    const rank = currentDeck[currentPos];
    // Assign a varied suit based on position for visual variety
    const suit = SUITS[currentPos % 4];
    setLastCard({ rank, suit });
    setPos(currentPos + 1);
  }

  const remaining = deck.length - pos;
  const hiloVal = lastCard ? HI_LO_VALUES[lastCard.rank] : 0;
  const isRed = lastCard ? (lastCard.suit === '♥' || lastCard.suit === '♦') : false;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        title="Card Tester"
        className="fixed bottom-36 right-4 z-40 w-11 h-11 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-full shadow-xl flex items-center justify-center text-lg transition-all hover:scale-110"
      >
        🂠
      </button>
    );
  }

  return (
    <div className="fixed bottom-36 right-4 z-40 w-44 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800">
        <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Card Tester</span>
        <button onClick={() => setIsOpen(false)} className="text-gray-600 hover:text-gray-300 text-base leading-none w-5 h-5 flex items-center justify-center">×</button>
      </div>

      {/* Card display */}
      <div className="flex flex-col items-center py-4 gap-3">
        {lastCard ? (
          <div className="relative">
            <div className={`w-16 h-20 rounded-xl bg-white border border-gray-100 shadow-xl flex flex-col items-center justify-center select-none font-bold ${isRed ? 'text-red-600' : 'text-gray-900'}`}>
              <span className="text-2xl leading-none">{lastCard.rank}</span>
              <span className="text-base">{lastCard.suit}</span>
            </div>
            <span className={`absolute -top-1.5 -right-1.5 text-white text-[10px] font-bold px-1 py-0.5 rounded-full shadow ${
              hiloVal > 0 ? 'bg-green-500' : hiloVal < 0 ? 'bg-red-500' : 'bg-gray-500'
            }`}>
              {hiloVal > 0 ? '+1' : hiloVal < 0 ? '-1' : '0'}
            </span>
          </div>
        ) : (
          <div className="w-16 h-20 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-600 text-4xl">
            🂠
          </div>
        )}

        <button
          onClick={draw}
          className="w-32 py-2 bg-green-700 hover:bg-green-600 active:scale-95 text-white text-sm font-semibold rounded-lg transition-all"
        >
          Draw
        </button>

        <span className="text-gray-600 text-xs">{remaining} / {deck.length} left</span>
      </div>
    </div>
  );
}
