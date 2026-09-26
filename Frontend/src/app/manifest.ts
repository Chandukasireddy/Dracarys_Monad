import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Dracarys — Social Habit Staking on Monad',
    short_name: 'Dracarys',
    description: 'Kindle your flame. Keep your streak. Sub-second habit staking on Monad.',
    start_url: '/',
    display: 'standalone',
    background_color: '#101013',
    theme_color: '#101013',
    orientation: 'portrait',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
