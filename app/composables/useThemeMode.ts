export type ThemeMode = 'light' | 'dark' | 'system'

export function useThemeMode() {
  const cookie = useCookie<ThemeMode>('theme-mode', {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax'
  })
  const preference = useState<ThemeMode>('theme-mode', () => cookie.value ?? 'system')

  watch(preference, (value) => {
    cookie.value = value
  })

  const modes: ThemeMode[] = ['light', 'dark', 'system']
  function cycle() {
    preference.value = modes[(modes.indexOf(preference.value) + 1) % modes.length]
  }

  return { preference, cycle }
}
