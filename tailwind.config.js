/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'cyber-black': '#020617', // Slate 950
                'cyber-slate': '#0f172a', // Slate 900
                'neon-green': '#34d399', // Emerald 400
                'neon-dark': '#059669',  // Emerald 600
                'gold-light': '#fbbf24', // Amber 400
                'gold-dark': '#d97706',  // Amber 600
                'laser-red': '#e11d48',  // Rose 600
                'user-accent': 'rgb(var(--primary) / <alpha-value>)',
            },
            fontFamily: {
                sans: ['Rajdhani', 'sans-serif'],
                mono: ['"Chakra Petch"', 'monospace'],
                digital: ['"Chakra Petch"', 'monospace'], // Fallback if no specific digital font
            },
            boxShadow: {
                'glow-green': '0 0 20px rgba(52, 211, 153, 0.3)',
                'glow-gold': '0 0 20px rgba(251, 191, 36, 0.3)',
                'glow-red': '0 0 20px rgba(225, 29, 72, 0.4)',
                'glow-accent': '0 0 20px rgba(var(--primary-glow), 0.3)',
                'panel': '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
            },
            backgroundImage: {
                'scanlines': 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
            }
        },
    },
    plugins: [],
}
