/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./popup.html"
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#3B82F6',
                    dark: '#2563EB',
                },
                success: {
                    DEFAULT: '#22C55E',
                    dark: '#16A34A',
                },
            },
        },
    },
    plugins: [],
}; 