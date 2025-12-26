/**
 * Dark Theme Configuration
 * Contains all color styles and CSS variables for the dark theme
 * This is the current default theme styling
 */

export const darkTheme = {
  name: 'dark',
  
  // Base colors
  colors: {
    // Background colors
    background: '#0f0f0f',
    body: '#0f0f0f',
    
    // Text colors
    text: {
      primary: '#ffffff',
      secondary: '#e5e5e5',
      muted: '#a3a3a3',
      placeholder: '#9ca3af',
    },
    
    // Border colors
    border: {
      default: 'rgba(255, 255, 255, 0.2)',
      slate200: 'rgba(255, 255, 255, 0.2)',
      slate300: 'rgba(255, 255, 255, 0.2)',
      slate600: '#475569',
      slate700: '#334155',
    },
    
    // Button colors
    button: {
      primary: {
        background: '#ffffff',
        text: '#000000',
        hover: '#f1f5f9',
      },
      secondary: {
        background: 'rgba(255, 255, 255, 0.1)',
        border: 'rgba(255, 255, 255, 0.6)',
        text: '#ffffff',
        hover: {
          background: 'rgba(255, 255, 255, 0.2)',
          border: 'rgba(255, 255, 255, 0.8)',
        },
      },
    },
    
    // Card colors
    card: {
      background: 'rgba(30, 41, 59, 0.5)',
      border: 'rgba(255, 255, 255, 0.1)',
    },
    
    // Hero section
    hero: {
      gradient: 'from-slate-950 via-slate-900 to-slate-800',
      text: {
        primary: '#ffffff',
        subtitle: '#cbd5e1', // slate-300
        description: '#e2e8f0', // slate-200
      },
    },
    
    // Link colors
    link: {
      default: '#60a5fa', // blue-400
      hover: '#3b82f6', // blue-300
    },
    
    // Header colors
    header: {
      background: 'rgba(15, 23, 42, 0.95)', // slate-900/95
      border: '#334155', // slate-700
      text: '#ffffff',
      textMuted: '#cbd5e1', // slate-300
      search: {
        background: 'rgba(30, 41, 59, 0.5)', // slate-800/50
        border: '#475569', // slate-600
        text: '#ffffff',
        placeholder: '#94a3b8', // slate-400
      },
    },
    
    // Scrollbar colors
    scrollbar: {
      track: '#f1f5f9',
      thumb: '#cbd5e1',
      thumbHover: '#94a3b8',
    },
    
    // Rich text editor colors
    editor: {
      background: 'rgba(30, 41, 59, 0.5)', // slate-800/50
      border: '#475569', // slate-600
      text: '#ffffff',
      textSecondary: '#e5e5e5',
      link: '#60a5fa', // blue-400
      placeholder: '#9ca3af',
      toolbar: {
        background: '#1e293b', // slate-800
        border: '#475569', // slate-600
        icon: '#ffffff',
      },
    },
  },

  // CSS Variables (from globals.css .dark class)
  cssVariables: {
    '--background': 'oklch(0.145 0 0)',
    '--foreground': 'oklch(0.985 0 0)',
    '--card': 'oklch(0.205 0 0)',
    '--card-foreground': 'oklch(0.985 0 0)',
    '--popover': 'oklch(0.205 0 0)',
    '--popover-foreground': 'oklch(0.985 0 0)',
    '--primary': 'oklch(0.922 0 0)',
    '--primary-foreground': 'oklch(0.205 0 0)',
    '--secondary': 'oklch(0.269 0 0)',
    '--secondary-foreground': 'oklch(0.985 0 0)',
    '--muted': 'oklch(0.269 0 0)',
    '--muted-foreground': 'oklch(0.708 0 0)',
    '--accent': 'oklch(0.269 0 0)',
    '--accent-foreground': 'oklch(0.985 0 0)',
    '--destructive': 'oklch(0.704 0.191 22.216)',
    '--border': 'oklch(1 0 0 / 10%)',
    '--input': 'oklch(1 0 0 / 15%)',
    '--ring': 'oklch(0.556 0 0)',
    '--chart-1': 'oklch(0.488 0.243 264.376)',
    '--chart-2': 'oklch(0.696 0.17 162.48)',
    '--chart-3': 'oklch(0.769 0.188 70.08)',
    '--chart-4': 'oklch(0.627 0.265 303.9)',
    '--chart-5': 'oklch(0.645 0.246 16.439)',
    '--sidebar': 'oklch(0.205 0 0)',
    '--sidebar-foreground': 'oklch(0.985 0 0)',
    '--sidebar-primary': 'oklch(0.488 0.243 264.376)',
    '--sidebar-primary-foreground': 'oklch(0.985 0 0)',
    '--sidebar-accent': 'oklch(0.269 0 0)',
    '--sidebar-accent-foreground': 'oklch(0.985 0 0)',
    '--sidebar-border': 'oklch(1 0 0 / 10%)',
    '--sidebar-ring': 'oklch(0.556 0 0)',
  },

  // Tailwind class overrides (for components)
  classOverrides: {
    body: 'bg-[#0f0f0f] text-white',
    main: 'text-white',
    headings: 'text-white',
    text: 'text-[#e5e5e5]',
    muted: 'text-[#a3a3a3]',
    borders: 'border-white/20',
    links: 'text-blue-400 hover:text-blue-300',
  },

  // Component-specific styles
  components: {
    hero: {
      background: 'bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800',
      text: 'text-white',
      subtitle: 'text-slate-300',
      description: 'text-slate-200',
      buttonPrimary: 'bg-white text-black hover:bg-slate-100',
      buttonSecondary: 'border-2 border-white/60 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:border-white/80',
    },
    postCard: {
      background: 'bg-slate-800/50',
      border: 'border-slate-600',
      text: 'text-white',
      muted: 'text-slate-400',
    },
    header: {
      background: 'bg-slate-900/95 backdrop-blur',
      border: 'border-slate-700',
      text: 'text-white',
      textMuted: 'text-slate-300',
      search: {
        background: 'bg-slate-800/50',
        border: 'border-slate-600',
        text: 'text-white',
        placeholder: 'text-slate-400',
      },
    },
    editor: {
      background: 'bg-slate-800/50',
      border: 'border-slate-600',
      text: 'text-white',
      toolbar: {
        background: 'bg-slate-800',
        border: 'border-slate-600',
        icon: 'text-white',
      },
    },
    input: {
      background: 'bg-slate-800/50',
      border: 'border-slate-600',
      text: 'text-white',
      placeholder: 'text-slate-400',
    },
    button: {
      primary: {
        background: 'bg-white',
        text: 'text-black',
        hover: 'hover:bg-slate-100',
      },
      secondary: {
        background: 'bg-white/10',
        border: 'border-white/60',
        text: 'text-white',
        hover: {
          background: 'hover:bg-white/20',
          border: 'hover:border-white/80',
        },
      },
    },
  },

  // Global CSS overrides (from globals.css @layer base)
  globalStyles: {
    body: {
      color: '#ffffff',
      background: '#0f0f0f',
    },
    headings: {
      color: '#ffffff',
    },
    text: {
      color: '#e5e5e5',
    },
    muted: {
      color: '#a3a3a3',
    },
    borders: {
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    whiteBackground: {
      // Elements with white background should have black text
      color: '#000000',
    },
  },

  // Scrollbar styles
  scrollbar: {
    width: '8px',
    track: {
      background: '#f1f5f9',
      borderRadius: '4px',
    },
    thumb: {
      background: '#cbd5e1',
      borderRadius: '4px',
      hover: '#94a3b8',
    },
  },

  // Rich Text Editor styles
  proseMirror: {
    color: '#ffffff',
    paragraph: {
      color: '#e5e5e5',
    },
    headings: {
      color: '#ffffff',
    },
    link: {
      color: '#60a5fa',
    },
    placeholder: {
      color: '#9ca3af',
    },
  },
} as const;

export type DarkTheme = typeof darkTheme;


