/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        pakGreen: {
          50: '#f0f9f0',
          100: '#dcf0dc',
          200: '#bce0bc',
          300: '#8dc98d',
          400: '#57ab57',
          500: '#3d8b3d',
          600: '#2f6f2f',
          700: '#275827',
          800: '#224622',
          900: '#1d3b1d',
        },
        // Add other custom colors if needed
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'zoom-in': 'zoomIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        zoomIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: theme('colors.gray.800'),
            lineHeight: '1.75',
            p: {
              marginTop: '1.25em',
              marginBottom: '1.25em',
              textAlign: 'justify',
            },
            h1: {
              color: theme('colors.pakGreen.900'),
              fontWeight: '700',
              marginTop: '2em',
              marginBottom: '1em',
            },
            h2: {
              color: theme('colors.pakGreen.800'),
              fontWeight: '600',
              marginTop: '2em',
              marginBottom: '1em',
            },
            h3: {
              color: theme('colors.gray.900'),
              fontWeight: '600',
              marginTop: '1.5em',
              marginBottom: '0.75em',
            },
            strong: {
              fontWeight: '600',
              color: theme('colors.gray.900'),
            },
            blockquote: {
              fontWeight: '500',
              fontStyle: 'italic',
              borderLeftWidth: '0.25rem',
              borderLeftColor: theme('colors.pakGreen.500'),
              quotes: '"\\201C""\\201D""\\2018""\\2019"',
            },
            ul: {
              marginTop: '1.25em',
              marginBottom: '1.25em',
              paddingLeft: '1.625em',
            },
            li: {
              marginTop: '0.5em',
              marginBottom: '0.5em',
            },
            'ul > li': {
              paddingLeft: '0.375em',
            },
            'ol > li': {
              paddingLeft: '0.375em',
            },
          },
        },
        sm: {
          css: {
            fontSize: '0.875rem',
            lineHeight: '1.714',
            p: {
              marginTop: '1.143em',
              marginBottom: '1.143em',
            },
            h1: {
              fontSize: '1.5rem',
              marginTop: '1.5em',
              marginBottom: '0.75em',
            },
            h2: {
              fontSize: '1.25rem',
              marginTop: '1.5em',
              marginBottom: '0.75em',
            },
            h3: {
              fontSize: '1.125rem',
              marginTop: '1.25em',
              marginBottom: '0.5em',
            },
          },
        },
        base: {
          css: {
            fontSize: '1rem',
            lineHeight: '1.75',
            p: {
              marginTop: '1.25em',
              marginBottom: '1.25em',
            },
            h1: {
              fontSize: '2.25rem',
              marginTop: '2em',
              marginBottom: '1em',
            },
            h2: {
              fontSize: '1.875rem',
              marginTop: '1.75em',
              marginBottom: '0.75em',
            },
            h3: {
              fontSize: '1.5rem',
              marginTop: '1.5em',
              marginBottom: '0.5em',
            },
          },
        },
        lg: {
          css: {
            fontSize: '1.125rem',
            lineHeight: '1.777',
            p: {
              marginTop: '1.333em',
              marginBottom: '1.333em',
            },
            h1: {
              fontSize: '2.5rem',
              marginTop: '2em',
              marginBottom: '1em',
            },
            h2: {
              fontSize: '2rem',
              marginTop: '1.75em',
              marginBottom: '0.75em',
            },
            h3: {
              fontSize: '1.5rem',
              marginTop: '1.5em',
              marginBottom: '0.5em',
            },
          },
        },
        xl: {
          css: {
            fontSize: '1.25rem',
            lineHeight: '1.8',
            p: {
              marginTop: '1.5em',
              marginBottom: '1.5em',
            },
            h1: {
              fontSize: '2.75rem',
              marginTop: '2em',
              marginBottom: '1em',
            },
            h2: {
              fontSize: '2.25rem',
              marginTop: '1.75em',
              marginBottom: '0.75em',
            },
            h3: {
              fontSize: '1.75rem',
              marginTop: '1.5em',
              marginBottom: '0.5em',
            },
          },
        },
        'pakGreen': {
          css: {
            '--tw-prose-body': theme('colors.gray.800'),
            '--tw-prose-headings': theme('colors.pakGreen.900'),
            '--tw-prose-lead': theme('colors.gray.600'),
            '--tw-prose-links': theme('colors.pakGreen.600'),
            '--tw-prose-bold': theme('colors.gray.900'),
            '--tw-prose-counters': theme('colors.gray.500'),
            '--tw-prose-bullets': theme('colors.gray.300'),
            '--tw-prose-hr': theme('colors.gray.200'),
            '--tw-prose-quotes': theme('colors.gray.900'),
            '--tw-prose-quote-borders': theme('colors.pakGreen.500'),
            '--tw-prose-captions': theme('colors.gray.500'),
            '--tw-prose-code': theme('colors.gray.900'),
            '--tw-prose-pre-code': theme('colors.gray.200'),
            '--tw-prose-pre-bg': theme('colors.gray.800'),
            '--tw-prose-th-borders': theme('colors.gray.300'),
            '--tw-prose-td-borders': theme('colors.gray.200'),
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    // Add other plugins if needed
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/aspect-ratio'),
  ],
}