/**
 * Light Theme Configuration
 * Contains all color styles and CSS variables for the light theme
 */

export const lightTheme = {
  name: 'light',
  
  // Base colors
  colors: {
    // Background colors
    background: '#B8DB80', // green background for pages in light mode
    body: '#ffffff', // white (default, but pages use green)
    // Homepage green color (leafy light green)
    homepageGreen: '#B8DB80',
    // Page background (green for posts and other pages in light mode)
    pageBackground: '#B8DB80',
    
    // Text colors
    text: {
      primary: '#000000', // black (for headings on green background)
      secondary: '#000000', // black (for body text on green background)
      muted: '#000000', // black (for muted text on green background)
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
        background: '#14b8a6', // teal-600 (for active filter buttons)
        text: '#ffffff',
        hover: '#0d9488', // teal-700
      },
      secondary: {
        background: '#ffffff', // white for inactive buttons
        border: '#d1d5db', // gray-300
        text: '#374151', // gray-700
        hover: {
          background: '#f9fafb', // gray-50
          border: '#d1d5db', // gray-300
          text: '#111827', // gray-900
        },
      },
    },
    
    // Card colors
    card: {
      background: '#ffffff', // white
      border: '#e5e7eb', // gray-200
      text: {
        primary: '#000000', // black for titles
        secondary: '#000000', // black for text
        muted: '#000000', // black for dates/author
      },
      link: '#1d4ed8', // blue-700 for "Read story →"
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
      default: '#1d4ed8', // blue-700 (for "Read story →" and "View all →")
      hover: '#1e40af', // blue-800
    },
    
    // Header colors
    header: {
      background: '#ffffff', // white
      border: '#e5e7eb', // gray-200
      text: '#000000', // black
      textMuted: '#6b7280', // gray-500
      search: {
        background: '#f9fafb', // gray-50
        border: '#000000', // black border (like homepage)
        text: '#000000', // black
        placeholder: '#9ca3af', // gray-400
        icon: '#6b7280', // gray-500
      },
      nav: {
        text: '#4b5563', // gray-600
        hover: '#111827', // gray-900
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
    '--leafy-green': '#B8DB80', // Homepage green color
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
    body: 'bg-white text-black',
    main: 'text-black', // black text on green background
    headings: 'text-black', // black headings on green background
    text: 'text-black', // black text on green background
    muted: 'text-black', // black muted text on green background
    borders: 'border-gray-200',
    links: 'text-blue-700 hover:text-blue-800', // blue-700 for links
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
      background: 'bg-white',
      border: 'border-gray-200',
      text: 'text-black',
      textMuted: 'text-gray-500',
      search: {
        background: 'bg-gray-50',
        border: 'border-black', // black border like homepage
        text: 'text-black',
        placeholder: 'text-gray-400',
        icon: 'text-gray-400',
      },
      nav: {
        text: 'text-gray-600',
        hover: 'hover:text-gray-900',
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
        background: 'bg-teal-600', // teal for active filter buttons
        text: 'text-white',
        hover: 'hover:bg-teal-700',
      },
      secondary: {
        background: 'bg-white', // white for inactive buttons
        border: 'border-gray-300',
        text: 'text-gray-700',
        hover: {
          background: 'hover:bg-gray-50',
          border: 'hover:border-gray-300',
          text: 'hover:text-gray-900',
        },
      },
    },
  },

  // Global CSS overrides
  globalStyles: {
    body: {
      color: '#000000', // black text
      background: '#ffffff', // white (but pages use green overlay)
    },
    headings: {
      color: '#000000', // black headings
    },
    text: {
      color: '#000000', // black text on green background
    },
    muted: {
      color: '#000000', // black muted text
    },
    borders: {
      borderColor: '#e5e7eb', // gray-200
    },
    whiteBackground: {
      color: '#000000', // black text on white cards
    },
    pageBackground: {
      backgroundColor: '#B8DB80', // green background for pages
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
    color: '#000000', // black text
    paragraph: {
      color: '#000000', // black paragraphs
    },
    headings: {
      color: '#000000', // black headings
    },
    link: {
      color: '#1d4ed8', // blue-700
    },
    placeholder: {
      color: '#9ca3af', // gray-400
    },
  },
} as const;

export type LightTheme = typeof lightTheme;



