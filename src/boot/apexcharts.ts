import { defineBoot } from '#q-app/wrappers';
import { defineAsyncComponent } from 'vue';

// Registra <apexchart> globalmente como componente assíncrono: o ApexCharts (~500 kB)
// vira um chunk próprio e só é baixado quando alguma página renderiza um gráfico.
export default defineBoot(({ app }) => {
  app.component(
    'apexchart',
    defineAsyncComponent(() => import('vue3-apexcharts')),
  );
});
