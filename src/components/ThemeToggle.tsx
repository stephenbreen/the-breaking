import { useTheme } from '../theme'

export default function ThemeToggle() {
  const [theme, toggle] = useTheme()
  const dark = theme === 'dark'
  return (
    <button
      onClick={toggle}
      className="btn inline-flex items-center gap-1.5"
      title={`Switch to ${dark ? 'light' : 'dark'} mode`}
      aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`}
    >
      <span aria-hidden className="text-base leading-none">
        {dark ? '☀️' : '🌙'}
      </span>
      <span className="hidden sm:inline">{dark ? 'Light' : 'Dark'}</span>
    </button>
  )
}
