import { useEffect } from 'react'
import type { Statblock } from '../types'
import StatblockView from './StatblockView'

export default function StatblockModal({
  sb,
  onClose,
}: {
  sb: Statblock | null
  onClose: () => void
}) {
  useEffect(() => {
    if (!sb) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sb, onClose])

  if (!sb) return null

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border-2 border-[color:rgb(var(--sb-heading)/0.6)] rounded-lg shadow-2xl w-[32rem] max-w-full max-h-[90vh] overflow-y-auto p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end -mt-2 -mr-1 mb-1">
          <button onClick={onClose} className="btn text-xs" aria-label="Close statblock">
            ✕
          </button>
        </div>
        <StatblockView sb={sb} />
      </div>
    </div>
  )
}
