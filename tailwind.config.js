/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Terminal-green on deep navy — trading terminal meets code forge
        surface: {
          50:  '#0d1117',
          100: '#161b22',
          200: '#21262d',
          300: '#30363d',
          400: '#484f58',
          500: '#6e7681',
        },
        accent: {
          primary:  '#00d4aa',   // teal-green: live signal feel
          secondary:'#f0b429',   // amber: warnings, highlights
          danger:   '#e05252',   // muted red
          muted:    '#1a3a30',   // dark teal bg tint
        },
        text: {
          primary:  '#e6edf3',
          secondary:'#8b949e',
          muted:    '#484f58',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': '0.65rem',
      }
    },
  },
  plugins: [],
}
