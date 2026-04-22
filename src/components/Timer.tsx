import { useEffect } from 'react'
import { useStore } from '../store'

export default function Timer() {
  const timerRemaining = useStore((s) => s.timerRemaining)
  const timerRunning = useStore((s) => s.timerRunning)
  const timerSeconds = useStore((s) => s.timerSeconds)
  const setRunning = useStore((s) => s.setTimerRunning)
  const tick = useStore((s) => s.tickTimer)
  const reset = useStore((s) => s.resetTimer)
  const setSeconds = useStore((s) => s.setTimerSeconds)

  useEffect(() => {
    if (!timerRunning) return
    const id = setInterval(() => tick(), 1000)
    return () => clearInterval(id)
  }, [timerRunning, tick])

  const danger = timerRemaining <= 10 && timerRunning

  return (
    <div
      className={`flex items-center gap-2 rounded px-3 py-1 ${
        danger ? 'bg-red-700 animate-pulse' : 'bg-slate-800'
      }`}
    >
      <span className="text-2xl font-mono font-bold w-14 text-center">
        {timerRemaining}s
      </span>
      <button onClick={() => setRunning(!timerRunning)} className="btn">
        {timerRunning ? '⏸' : '▶'}
      </button>
      <button onClick={reset} className="btn" title="Reset timer">
        ↺
      </button>
      <input
        type="number"
        min={5}
        max={600}
        value={timerSeconds}
        onChange={(e) => setSeconds(Math.max(5, parseInt(e.target.value, 10) || 60))}
        className="input w-16"
        title="Seconds per turn"
      />
    </div>
  )
}
