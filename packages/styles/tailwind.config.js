/**
 * @type {import('tailwindcss').Config}
 */
const config = {
  prefix: 'wms-',
  content: [
    // Packages that render JSX (scan *source* and/or dist)
    '../ui/**/src/**/*.{js,ts,jsx,tsx}',  // Scan all nested src folders (core, gantt, etc.)
    '../ui/**/*.{js,jsx,ts,tsx}',         // Scan compiled dist files

    '../bundle/**/*.{js,ts,jsx,tsx}',
    // Include any apps that might use the styles
    '../apps/**/*.{js,ts,jsx,tsx}',
  ],
};

export default config;
