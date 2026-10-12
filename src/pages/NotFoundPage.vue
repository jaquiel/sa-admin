<template>
  <div class="nfp">
    <div class="nfp__inner">
      <div class="nfp__code">404</div>
      <h2>Página não encontrada</h2>
      <p>A página que você tentou acessar não existe ou não está disponível.</p>
      <q-btn unelevated no-caps class="sa-btn sa-btn--primary" :to="{ name: 'customers' }" label="Voltar ao início" />
    </div>
  </div>
</template>

<style scoped lang="scss">
// 404 dentro do MainLayout (mantém o menu lateral); o ErrorNotFound cobre rotas fora do layout.
.nfp {
  flex: 1;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;

  &__inner {
    text-align: center;
    max-width: 520px;
  }

  &__code {
    font-size: 96px;
    font-weight: 700;
    line-height: 1;
    color: var(--slate-300);
    margin-bottom: 16px;
  }

  h2 {
    font-size: 24px;
    line-height: 32px;
    font-weight: 700;
    color: var(--slate-900);
    margin: 0 0 8px;
  }

  p {
    color: var(--slate-600);
    margin: 0 0 24px;
  }
}
</style>
