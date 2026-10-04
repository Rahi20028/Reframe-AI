'use client'
import { useState } from 'react'
import { getSudoku } from 'sudoku-gen'
import Link from 'next/link'
import { ArrowLeft, RotateCcw } from 'lucide-react'

type Difficulty = 'easy' | 'medium' | 'hard'

export default function SudokuPage() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [puzzle, setPuzzle] = useState(() => getSudoku(difficulty))
  const [board, setBoard] = useState<string[]>(() => puzzle.puzzle.split(''))
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [status, setStatus] = useState<'playing' | 'won'>('playing')

  const startNewGame = (level: Difficulty) => {
    const fresh = getSudoku(level)
    setDifficulty(level)
    setPuzzle(fresh)
    setBoard(fresh.puzzle.split(''))
    setSelectedIndex(null)
    setStatus('playing')
  }

  const handleCellClick = (index: number) => {
    if (puzzle.puzzle[index] !== '-') return // original clue cells aren't editable
    setSelectedIndex(index)
  }

  const handleNumberInput = (num: string) => {
    if (selectedIndex === null) return

    const newBoard = [...board]
    newBoard[selectedIndex] = num
    setBoard(newBoard)

    // Check win condition
    const isComplete = newBoard.every((cell) => cell !== '-')
    if (isComplete) {
      const isCorrect = newBoard.join('') === puzzle.solution
      if (isCorrect) setStatus('won')
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-lg">
      <Link href="/dashboard/games" className="inline-flex items-center gap-1.5 text-sm text-[#6B776F] hover:text-[#3F7268] mb-4">
        <ArrowLeft size={15} /> Back to games
      </Link>

      <h2 className="text-2xl font-medium text-[#17241E] [font-family:var(--font-display)] mb-1">
        Sudoku
      </h2>
      <p className="text-sm text-[#6B776F] mb-5">
        Fill every row, column, and 3x3 box with numbers 1-9.
      </p>

      {/* Difficulty selector */}
      <div className="flex gap-2 mb-5">
        {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => (
          <button
            key={level}
            onClick={() => startNewGame(level)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
              difficulty === level
                ? 'bg-[#3F7268] text-white'
                : 'bg-white border border-[#D9E2DE] text-[#6B776F] hover:bg-[#EEF4F2]'
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      {status === 'won' && (
        <div className="bg-[#EEF4F2] border border-[#3F7268] rounded-lg px-4 py-3 mb-4 text-sm text-[#17241E] font-medium">
          🎉 Solved it! Want to try another?
        </div>
      )}

      {/* 9x9 grid */}
      <div className="grid grid-cols-9 w-fit border-2 border-[#17241E] mb-5">
        {board.map((cell, index) => {
          const row = Math.floor(index / 9)
          const col = index % 9
          const isClue = puzzle.puzzle[index] !== '-'
          const isSelected = selectedIndex === index

          return (
            <button
              key={index}
              onClick={() => handleCellClick(index)}
              disabled={isClue}
              className={`w-9 h-9 flex items-center justify-center text-sm font-medium border border-[#D9E2DE]
                ${col % 3 === 0 ? 'border-l-2 border-l-[#17241E]' : ''}
                ${row % 3 === 0 ? 'border-t-2 border-t-[#17241E]' : ''}
                ${isClue ? 'bg-[#EEF4F2] text-[#17241E] cursor-default' : 'bg-white text-[#3F7268] cursor-pointer hover:bg-[#EEF4F2]'}
                ${isSelected ? 'ring-2 ring-[#E2A83D] ring-inset' : ''}
              `}
            >
              {cell !== '-' ? cell : ''}
            </button>
          )
        })}
      </div>

      {/* Number input pad */}
      <div className="flex gap-2 flex-wrap mb-4">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
          <button
            key={num}
            onClick={() => handleNumberInput(num)}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-[#D9E2DE] text-sm font-medium text-[#17241E] hover:bg-[#EEF4F2]"
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => handleNumberInput('-')}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-[#D9E2DE] text-[#6B776F] hover:bg-[#EEF4F2]"
        >
          ✕
        </button>
      </div>

      <button
        onClick={() => startNewGame(difficulty)}
        className="inline-flex items-center gap-1.5 text-sm text-[#3F7268] hover:underline"
      >
        <RotateCcw size={14} /> New puzzle
      </button>
    </div>
  )
}