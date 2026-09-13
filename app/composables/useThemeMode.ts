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

  const systemDark = ref(false)
  if (import.meta.client) {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    systemDark.value = media.matches
    const onChange = (e: MediaQueryListEvent) => {
      systemDark.value = e.matches
    }
    media.addEventListener('change', onChange)
    onScopeDispose(() => media.removeEventListener('change', onChange))
  }

  const isDark = computed(() =>
    preference.value === 'dark' || (preference.value === 'system' && systemDark.value)
  )

  const modes: ThemeMode[] = ['light', 'dark', 'system']
  function cycle() {
    const next = modes[(modes.indexOf(preference.value) + 1) % modes.length]
    preference.value = next
  }

  return { preference, isDark, cycle }
}
