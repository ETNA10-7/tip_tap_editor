/**
 * Light Theme Configuration
 * Contains all color styles and CSS variables for the light theme
 */

export const lightTheme = {
  name: 'light',
  
  // Base colors
  colors: {
    // Background colors
    background: '#ffffff',
    body: '#ffffff',
    
    // Text colors
    text: {
      primary: '#1f2937', // gray-800
      secondary: '#4b5563', // gray-600
      muted: '#6b7280', // gray-500
      placeholder: '#9ca3af', // gray-400
    },
    
    // Border colors
    border: {
      default: 'rgba(0, 0, 0, 0.1)',
      slate200: '#e2e8f0',
      slate300: '#cbd5e1',
      slate600: '#475569',
      slate700: '#334155',
    },
    
    // Button colors
    button: {
      primary: {
        background: '#1f2937', // gray-800
        text: '#ffffff',
        hover: '#111827', // gray-900
      },
      secondary: {
        background: 'rgba(0, 0, 0, 0.05)',
        border: 'rgba(0, 0, 0, 0.2)',
        text: '#1f2937',
        hover: {
          background: 'rgba(0, 0, 0, 0.1)',
          border: 'rgba(0, 0, 0, 0.3)',
        },
      },
    },
    
    // Card colors
    card: {
      background: '#ffffff',
      border: 'rgba(0, 0, 0, 0.1)',
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
      default: '#2563eb', // blue-600
      hover: '#1d4ed8', // blue-700
    },
    
    // Header colors
    header: {
      background: 'rgba(255, 255, 255, 0.95)',
      border: '#e5e7eb', // gray-200
      text: '#1f2937', // gray-800
      textMuted: '#6b7280', // gray-500
      search: {
        background: '#f9fafb', // gray-50
        border: '#e5e7eb', // gray-200
        text: '#1f2937', // gray-800
        placeholder: '#9ca3af', // gray-400
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
      background: '#ffffff',
      border: '#e5e7eb', // gray-200
      text: '#1f2937', // gray-800
      textSecondary: '#4b5563', // gray-600
      link: '#2563eb', // blue-600
      placeholder: '#9ca3af', // gray-400
      toolbar: {
        background: '#f9fafb', // gray-50
        border: '#e5e7eb', // gray-200
        icon: '#1f2937', // gray-800
      },
    },
  },

  // CSS Variables (light theme)
  cssVariables: {
    '--background': 'oklch(1 0 0)',
    '--foreground': 'oklch(0.145 0 0)',
    '--card': 'oklch(1 0 0)',
    '--card-foreground': 'oklch(0.145 0 0)',
    '--popover': 'oklch(1 0 0)',
    '--popover-foreground': 'oklch(0.145 0 0)',
    '--primary': 'oklch(0.205 0 0)',
    '--primary-foreground': 'oklch(0.985 0 0)',
    '--secondary': 'oklch(0.97 0 0)',
    '--secondary-foreground': 'oklch(0.205 0 0)',
    '--muted': 'oklch(0.97 0 0)',
    '--muted-foreground': 'oklch(0.556 0 0)',
    '--accent': 'oklch(0.97 0 0)',
    '--accent-foreground': 'oklch(0.205 0 0)',
    '--destructive': 'oklch(0.577 0.245 27.325)',
    '--border': 'oklch(0.922 0 0)',
    '--input': 'oklch(0.922 0 0)',
    '--ring': 'oklch(0.708 0 0)',
    '--chart-1': 'oklch(0.646 0.222 41.116)',
    '--chart-2': 'oklch(0.6 0.118 184.704)',
    '--chart-3': 'oklch(0.398 0.07 227.392)',
    '--chart-4': 'oklch(0.828 0.189 84.429)',
    '--chart-5': 'oklch(0.769 0.188 70.08)',
    '--sidebar': 'oklch(0.985 0 0)',
    '--sidebar-foreground': 'oklch(0.145 0 0)',
    '--sidebar-primary': 'oklch(0.205 0 0)',
    '--sidebar-primary-foreground': 'oklch(0.985 0 0)',
    '--sidebar-accent': 'oklch(0.97 0 0)',
    '--sidebar-accent-foreground': 'oklch(0.205 0 0)',
    '--sidebar-border': 'oklch(0.922 0 0)',
    '--sidebar-ring': 'oklch(0.708 0 0)',
  },

  // Tailwind class overrides (for components)
  classOverrides: {
    body: 'bg-white text-gray-800',
    main: 'text-gray-800',
    headings: 'text-gray-900',
    text: 'text-gray-600',
    muted: 'text-gray-500',
    borders: 'border-gray-200',
    links: 'text-blue-600 hover:text-blue-700',
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
      background: 'bg-white',
      border: 'border-gray-200',
      text: 'text-gray-900',
      muted: 'text-gray-600',
    },
    header: {
      background: 'bg-white/95 backdrop-blur',
      border: 'border-gray-200',
      text: 'text-gray-800',
      textMuted: 'text-gray-500',
      search: {
        background: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-800',
        placeholder: 'text-gray-400',
      },
    },
    editor: {
      background: 'bg-white',
      border: 'border-gray-200',
      text: 'text-gray-800',
      toolbar: {
        background: 'bg-gray-50',
        border: 'border-gray-200',
        icon: 'text-gray-800',
      },
    },
    input: {
      background: 'bg-white',
      border: 'border-gray-200',
      text: 'text-gray-800',
      placeholder: 'text-gray-400',
    },
    button: {
      primary: {
        background: 'bg-gray-800',
        text: 'text-white',
        hover: 'hover:bg-gray-900',
      },
      secondary: {
        background: 'bg-gray-100',
        border: 'border-gray-300',
        text: 'text-gray-800',
        hover: {
          background: 'hover:bg-gray-200',
          border: 'hover:border-gray-400',
        },
      },
    },
  },

  // Global CSS overrides
  globalStyles: {
    body: {
      color: '#1f2937',
      background: '#ffffff',
    },
    headings: {
      color: '#111827',
    },
    text: {
      color: '#4b5563',
    },
    muted: {
      color: '#6b7280',
    },
    borders: {
      borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    whiteBackground: {
      color: '#1f2937',
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
    color: '#1f2937',
    paragraph: {
      color: '#4b5563',
    },
    headings: {
      color: '#111827',
    },
    link: {
      color: '#2563eb',
    },
    placeholder: {
      color: '#9ca3af',
    },
  },
} as const;

export type LightTheme = typeof lightTheme;


