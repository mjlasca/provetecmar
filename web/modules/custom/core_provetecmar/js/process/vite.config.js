export default {
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/app.js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: assetInfo => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'assets/app.css';
          }
          return 'assets/[name].[ext]';
        }
      }
    }
  }
}
