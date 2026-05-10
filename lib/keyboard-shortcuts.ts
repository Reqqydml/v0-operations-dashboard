export const KEYBOARD_SHORTCUTS = [
  {
    category: 'Navigation',
    shortcuts: [
      { keys: ['Cmd', 'K'], description: 'Global search', action: 'openSearch' },
      { keys: ['Cmd', 'B'], description: 'Toggle sidebar', action: 'toggleSidebar' },
      { keys: ['Cmd', '?'], description: 'Show help', action: 'showHelp' },
    ],
  },
  {
    category: 'General',
    shortcuts: [
      { keys: ['Esc'], description: 'Close modals/popups', action: 'closeModal' },
      { keys: ['Cmd', 'S'], description: 'Save (context-dependent)', action: 'save' },
    ],
  },
  {
    category: 'Pages',
    shortcuts: [
      { keys: ['G', 'D'], description: 'Go to Dashboard', action: 'goDashboard' },
      { keys: ['G', 'P'], description: 'Go to Projects', action: 'goProjects' },
      { keys: ['G', 'T'], description: 'Go to Tasks', action: 'goTasks' },
    ],
  },
]

export const KEYBOARD_ACTIONS = {
  openSearch: () => {
    const event = new CustomEvent('openSearch')
    window.dispatchEvent(event)
  },
  toggleSidebar: () => {
    const event = new CustomEvent('toggleSidebar')
    window.dispatchEvent(event)
  },
  showHelp: () => {
    const event = new CustomEvent('showHelp')
    window.dispatchEvent(event)
  },
  closeModal: () => {
    const event = new CustomEvent('closeModal')
    window.dispatchEvent(event)
  },
}

export type KeyboardShortcutAction = keyof typeof KEYBOARD_ACTIONS
