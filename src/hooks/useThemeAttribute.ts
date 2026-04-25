import { useEffect } from 'react'
import { useStore } from '../store'

export function useThemeAttribute() {
  const theme = useStore((s) => s.theme)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])
}
