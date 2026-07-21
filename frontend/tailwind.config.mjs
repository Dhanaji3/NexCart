import preset from './shared/tailwind.preset.js'

/** @type {import('tailwindcss').Config} */
export default {
  presets: [preset],
  content: [
    './host/index.html',
    './host/src/**/*.{vue,ts,js}',
    './mfe-auth/index.html',
    './mfe-auth/src/**/*.{vue,ts,js}',
    './mfe-products/index.html',
    './mfe-products/src/**/*.{vue,ts,js}',
    './mfe-cart/index.html',
    './mfe-cart/src/**/*.{vue,ts,js}',
    './mfe-checkout/index.html',
    './mfe-checkout/src/**/*.{vue,ts,js}',
    './mfe-orders/index.html',
    './mfe-orders/src/**/*.{vue,ts,js}',
    './mfe-admin/index.html',
    './mfe-admin/src/**/*.{vue,ts,js}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
