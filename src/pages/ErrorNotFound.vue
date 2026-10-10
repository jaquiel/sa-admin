<template>
  <div class="nf">
    <div>
      <div class="nf__code">404</div>
      <p>Página não encontrada.</p>
      <q-btn unelevated no-caps color="primary" class="sa-btn" to="/" label="Voltar ao início" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.nf {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: var(--slate-900);
  color: #fff;

  &__code {
    font-size: 96px;
    font-weight: 700;
    line-height: 1;
  }

  p {
    color: var(--slate-400);
    margin: 16px 0 24px;
  }
}
</style>
