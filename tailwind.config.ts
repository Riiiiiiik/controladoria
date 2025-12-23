import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: [
                    '-apple-system',
                    'BlinkMacSystemFont',
                    'SF Pro Text',
                    'Helvetica Neue',
                    'Arial',
                    'sans-serif'
                ],
            },
            colors: {
                apple: {
                    bg: {
                        primary: '#ffffff',
                        secondary: '#f5f5f7',
                    },
                    text: {
                        primary: '#1d1d1f',
                        secondary: '#6e6e73',
                    },
                    accent: '#0071e3',
                    border: '#d2d2d7',
                },
            },
        },
    },
    plugins: [],
};
export default config;
