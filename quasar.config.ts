// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-file

import { defineConfig } from '#q-app/wrappers';

export default defineConfig((/* ctx */) => {
  return {
    // Ordem importa: axios precisa do router/pinia já instalados; gtag e apexcharts são independentes.
    boot: ['axios', 'apexcharts', 'gtag'],

    css: ['app.scss'],

    extras: ['roboto-font', 'material-icons'],

    build: {
      target: {
        browser: ['es2022', 'firefox115', 'chrome115', 'safari14'],
        node: 'node20',
      },
      typescript: {
        strict: true,
        vueShim: true,
      },
      vueRouterMode: 'history',
      env: {
        API_BASE_URL: process.env.API_BASE_URL ?? '/api',
        GA_MEASUREMENT_ID: process.env.GA_MEASUREMENT_ID ?? '',
        USE_MOCKS: process.env.USE_MOCKS ?? 'true',
      },
      // Cada página é um chunk separado (import() nas rotas); o Vite gera os hashes.
      extendViteConf(viteConf) {
        viteConf.build = viteConf.build ?? {};
        viteConf.build.chunkSizeWarningLimit = 900;
      },
    },

    devServer: {
      open: false,
      port: 9000,
      // O backend não envia headers CORS: em dev o navegador fala com localhost e o Vite repassa /api.
      proxy: process.env.API_PROXY_TARGET
        ? { '/api': { target: process.env.API_PROXY_TARGET, changeOrigin: true, secure: true } }
        : {},
    },

    framework: {
      config: {
        brand: {
          primary: '#2563eb',
          secondary: '#0f172a',
          accent: '#06b6d4',
          dark: '#0f172a',
          'dark-page': '#0f172a',
          positive: '#16a34a',
          negative: '#dc2626',
          info: '#0ea5e9',
          warning: '#d97706',
        },
        notify: { position: 'top-right', timeout: 2500 },
      },
      lang: 'pt-BR',
      iconSet: 'material-icons',
      plugins: ['Cookies', 'LocalStorage', 'Notify', 'Dialog', 'Loading'],
    },

    animations: [],
  };
});
