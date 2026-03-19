// // import { defineConfig } from 'vite'
// // import react from '@vitejs/plugin-react'
// // import tailwindcss from '@tailwindcss/vite'

// // // https://vite.dev/config/
// // export default defineConfig({

// //   plugins: [react(), tailwindcss()],
// //   server: {
// //     port: 5173,
// //     open: true,
// //     proxy: {
// //       '/api': {
// //         target: 'https://michaelmahberbackend.onrender.com',
// //         changeOrigin: true,
// //       },
// //     },
// //   },
// // })

// // vite.config.js





// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'

// export default defineConfig({
//   plugins: [react(), tailwindcss()],
//   server: {
//     port: 5173,
//     open: true,
//     proxy: {
//       '/api': {
//         target: 'https://michaelmahberbackend.onrender.com',
//         changeOrigin: true,
//         secure: false,
//       },
//     },
//   },
// })
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist', // Make sure this is set
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://michaelmahberbackend.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})