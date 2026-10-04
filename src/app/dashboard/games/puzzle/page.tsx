'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, RotateCcw } from 'lucide-react'

const GRID_SIZE = 4
const TOTAL_TILES = GRID_SIZE * GRID_SIZE // 16, last one is the blank (0)

function createShuffledTiles(): number[] {
  const tiles = Array.from({ length: TOTAL_TILES }, (_, i) => i) // [0, 1, 2, ..., 15] — 0 represents blank

  // Shuffle by making random valid moves from a solved state (guarantees the puzzle is always solvable)
  let current = [...tiles]
  for (let i = 0; i < 200; i++) {
    const blankIndex = current.indexOf(0)
    const neighbors = getNeighbors(blankIndex)
    const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)]
    ;[current[blankIndex], current[randomNeighbor]] = [current[randomNeighbor], current[blankIndex]]
  }
  return current
}

function getNeighbors(index: number): number[] {
  const row = Math.floor(index / GRID_SIZE)
  const col = index % GRID_SIZE
  const neighbors: number[] = []

  if (row > 0) neighbors.push(index - GRID_SIZE) // up
  if (row < GRID_SIZE - 1) neighbors.push(index + GRID_SIZE) // down
  if (col > 0) neighbors.push(index - 1) // left
  if (col < GRID_SIZE - 1) neighbors.push(index + 1) // right

  return neighbors
}

function isSolved(tiles: number[]): boolean {
  for (let i = 0; i < TOTAL_TILES - 1; i++) {
    if (tiles[i] !== i + 1) return false
  }
  return tiles[TOTAL_TILES - 1] === 0
}

export default function SlidingPuzzlePage() {
  const [tiles, setTiles] = useState<number[]>(() => createShuffledTiles())
  const [moves, setMoves] = useState(0)
  const [won, setWon] = useState(false)

  const handleTileClick = (index: number) => {
    if (won) return

    const blankIndex = tiles.indexOf(0)
    const neighbors = getNeighbors(blankIndex)

    if (!neighbors.includes(index)) return // clicked tile isn't adjacent to the blank — ignore

    const newTiles = [...tiles]
    ;[newTiles[blankIndex], newTiles[index]] = [newTiles[index], newTiles[blankIndex]]
    setTiles(newTiles)
    setMoves((m) => m + 1)

    if (isSolved(newTiles)) {
      setWon(true)
    }
  }

  const startNewGame = () => {
    setTiles(createShuffledTiles())
    setMoves(0)
    setWon(false)
  }

  return (
    <div className="p-6 md:p-10 max-w-lg">
      <Link href="/dashboard/games" className="inline-flex items-center gap-1.5 text-sm text-[#6B776F] hover:text-[#3F7268] mb-4">
        <ArrowLeft size={15} /> Back to games
      </Link>

      <h2 className="text-2xl font-medium text-[#17241E] [font-family:var(--font-display)] mb-1">
        Sliding Puzzle
      </h2>
      <p className="text-sm text-[#6B776F] mb-1">
        Click a tile next to the empty space to slide it. Arrange 1-15 in order.
      </p>
      <p className="text-xs text-[#A7B0AB] mb-5">Moves: {moves}</p>

      {won && (
        <div className="bg-[#EEF4F2] border border-[#3F7268] rounded-lg px-4 py-3 mb-4 text-sm text-[#17241E] font-medium">
          🎉 Solved in {moves} moves! Want to try again?
        </div>
      )}

      <div className="grid grid-cols-4 gap-1.5 w-fit mb-5">
        {tiles.map((tile, index) => (
          <button
            key={index}
            onClick={() => handleTileClick(index)}
            disabled={tile === 0}
            className={`w-16 h-16 flex items-center justify-center rounded-lg text-lg font-semibold transition-colors
              ${tile === 0
                ? 'bg-transparent cursor-default'
                : 'bg-[#3F7268] text-white hover:bg-[#365f57] cursor-pointer'
              }
            `}
          >
            {tile !== 0 ? tile : ''}
          </button>
        ))}
      </div>

      <button
        onClick={startNewGame}
        className="inline-flex items-center gap-1.5 text-sm text-[#3F7268] hover:underline"
      >
        <RotateCcw size={14} /> Shuffle again
      </button>
    </div>
  )
}