import type { Theme, ThemeId } from './types'

export const THEMES: Theme[] = [
  {
    id: 'default',
    name: 'Default',
    surface0: '#ffffff', surface1: '#f5f5f7', surface2: '#ebebed',
    border: '#d1d1d8', borderSubtle: '#e8e8ee',
    ink: '#0a0a14', ink2: '#52525e', ink3: '#a0a0aa',
    accent: '#1a1a2e', accentFg: '#e0e0ff',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    surface0: '#16161e', surface1: '#1e1e2a', surface2: '#111118',
    border: '#2e2e40', borderSubtle: '#232330',
    ink: '#e8e8f4', ink2: '#9898b8', ink3: '#4a4a62',
    accent: '#7c6af7', accentFg: '#ffffff',
  },
  {
    id: 'forest',
    name: 'Forest',
    surface0: '#f5f7f2', surface1: '#eaf0e6', surface2: '#dde8d8',
    border: '#b8ccb0', borderSubtle: '#cfddc8',
    ink: '#1a2e18', ink2: '#3d5c3a', ink3: '#7a9c77',
    accent: '#2d6a27', accentFg: '#f0f7ee',
  },
  {
    id: 'rose',
    name: 'Rose',
    surface0: '#fff8f8', surface1: '#fdf0f0', surface2: '#fae6e6',
    border: '#f0c0c0', borderSubtle: '#f8d8d8',
    ink: '#2e1010', ink2: '#7a3030', ink3: '#c08080',
    accent: '#c0392b', accentFg: '#fff8f8',
  },
  {
    id: 'slate',
    name: 'Slate',
    surface0: '#f8f9fb', surface1: '#edf0f4', surface2: '#dde2ea',
    border: '#b8c4d0', borderSubtle: '#cdd5df',
    ink: '#0f1923', ink2: '#3a4a5c', ink3: '#7a8fa4',
    accent: '#1e3a5f', accentFg: '#e8f0f8',
  },
  {
    id: 'amber',
    name: 'Amber',
    surface0: '#fffcf5', surface1: '#fef6e4', surface2: '#fdedc8',
    border: '#e8c870', borderSubtle: '#f0dfa0',
    ink: '#1e1400', ink2: '#5a4010', ink3: '#a07830',
    accent: '#b45309', accentFg: '#fffcf5',
  },
]

export function getTheme(id: ThemeId): Theme {
  return THEMES.find(t => t.id === id) ?? THEMES[0]
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.style.setProperty('--surface-0', theme.surface0)
  root.style.setProperty('--surface-1', theme.surface1)
  root.style.setProperty('--surface-2', theme.surface2)
  root.style.setProperty('--border', theme.border)
  root.style.setProperty('--border-subtle', theme.borderSubtle)
  root.style.setProperty('--ink', theme.ink)
  root.style.setProperty('--ink-2', theme.ink2)
  root.style.setProperty('--ink-3', theme.ink3)
  root.style.setProperty('--accent', theme.accent)
  root.style.setProperty('--accent-fg', theme.accentFg)
}
