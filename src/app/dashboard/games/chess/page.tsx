'use client'
import { useState, useMemo } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import Link from 'next/link'
import { ArrowLeft, RotateCcw } from 'lucide-react'

export default function ChessPage() {
  const [fen, setFen] = useState(() => new Chess().fen())

  const game = useMemo(() => new Chess(fen), [fen])

  const status = useMemo(() => {
    if (game.isCheckmate()) return `Checkmate — ${game.turn() === 'w' ? 'Black' : 'White'} wins!`
    if (game.isDraw()) return 'Draw'
    if (game.isStalemate()) return 'Stalemate'
    if (game.isCheck()) return `${game.turn() === 'w' ? 'White' : 'Black'} is in check`
    return `${game.turn() === 'w' ? 'White' : 'Black'} to move`
  }, [game])

  const onPieceDrop = ({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string | null }): boolean => {
    if (!targetSquare) return false // dropped off the board

    const gameCopy = new Chess(fen) // fresh instance from current position

    try {
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q', // auto-promote to queen for simplicity
      })

      if (move === null) return false // illegal move

      setFen(gameCopy.fen()) // new state value — triggers a real re-render
      return true
    } catch {
      return false // illegal move threw an error
    }
  }

  const resetGame = () => {
    setFen(new Chess().fen())
  }

  const chessboardOptions = {
    position: fen,
    onPieceDrop,
    boardStyle: {
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    darkSquareStyle: { backgroundColor: '#3F7268' },
    lightSquareStyle: { backgroundColor: '#EEF4F2' },
  }

  return (
    <div className="p-6 md:p-10 max-w-lg">
      <Link href="/dashboard/games" className="inline-flex items-center gap-1.5 text-sm text-[#6B776F] hover:text-[#3F7268] mb-4">
        <ArrowLeft size={15} /> Back to games
      </Link>

      <h2 className="text-2xl font-medium text-[#17241E] [font-family:var(--font-display)] mb-1">
        Chess
      </h2>
      <p className="text-sm text-[#6B776F] mb-1">
        Play both sides — drag a piece to move it.
      </p>
      <p className="text-xs font-medium text-[#3F7268] mb-5">{status}</p>

      <div className="mb-5" style={{ maxWidth: '400px' }}>
        <Chessboard options={chessboardOptions} />
      </div>

      <button
        onClick={resetGame}
        className="inline-flex items-center gap-1.5 text-sm text-[#3F7268] hover:underline"
      >
        <RotateCcw size={14} /> New game
      </button>
    </div>
  )
}