<template>
  <div class="grain" style="min-height:100dvh;background:#0a0a0a;">
    <div class="app-header" style="position:fixed;top:0;left:0;right:0;z-index:100;">
      <button class="app-header-back" @click="$router.push('/')" aria-label="Voltar">
        <span style="font-size:14px;">←</span> Voltar
      </button>
      <div class="flex items-center gap-3 flex-1 justify-center">
        <div class="land-logo" style="font-size:18px;">RevelaI</div>
      </div>
      <div style="width:60px;"></div>
    </div>

    <div style="max-width:700px;margin:0 auto;padding:100px 24px 60px;">
      <p class="text-xs mb-2" style="color:var(--accent3);letter-spacing:2.5px;font-weight:700;text-transform:uppercase;">Legal</p>
      <h1 class="serif text-3xl mb-2" style="background:linear-gradient(135deg,var(--accent3),var(--accent) 50%,var(--accent2));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;">Política de Privacidade</h1>
      <p class="text-sm mb-8" style="color:rgba(248,244,235,0.42);">Última atualização: 24 de julho de 2026</p>

      <div class="prose">
        <h2>1. Informações que Coletamos</h2>
        <p>Ao utilizar o RevelaI, coletamos as seguintes informações:</p>
        <ul>
          <li><strong>Dados de identificação:</strong> E-mail gerado automaticamente pelo dispositivo (não coletamos dados pessoais identificáveis)</li>
          <li><strong>Dados do dispositivo:</strong> Identificador único do dispositivo (UUID) para autenticação</li>
          <li><strong>Fotos:</strong> Imagens capturadas pela câmera durante eventos</li>
          <li><strong>Dados de pagamento:</strong> Processados integralmente pelo Stripe. Não armazenamos dados de cartão de crédito</li>
        </ul>

        <h2>2. Como Usamos suas Informações</h2>
        <ul>
          <li>Gerenciar eventos e controle de acesso</li>
          <li>Armazenar e exibir fotos durante o evento</li>
          <li>Processar pagamentos (via Stripe)</li>
          <li>Garantir a segurança da plataforma</li>
        </ul>

        <h2>3. Armazenamento de Fotos</h2>
        <p>As fotos são armazenadas de forma segura em servidores na região configurada. Politica de retenção:</p>
        <ul>
          <li>Fotos são mantidas enquanto o evento estiver ativo</li>
          <li>Após o encerramento do evento, as fotos são mantidas por até <strong>90 dias</strong></li>
          <li>Após este período, as fotos são permanentemente excluídas</li>
          <li>Anfitriões podem deletar fotos manualmente a qualquer momento</li>
        </ul>

        <h2>4. Compartilhamento de Dados</h2>
        <p>Não compartilhamos seus dados com terceiros, exceto:</p>
        <ul>
          <li><strong>Stripe:</strong> Para processamento de pagamentos</li>
          <li><strong>Convidados do evento:</strong> Fotos são visíveis para participantes do evento</li>
          <li><strong>Requisições legais:</strong> Quando exigido por lei</li>
        </ul>

        <h2>5. Segurança</h2>
        <ul>
          <li>Autenticação por dispositivo com tokens JWT</li>
          <li>Políticas de acesso (RLS) em todas as tabelas</li>
          <li>Criptografia de trânsito (TLS/SSL)</li>
          <li>Acesso restrito a dados por dispositivo</li>
        </ul>

        <h2>6. Seus Direitos</h2>
        <p>Você tem direito a:</p>
        <ul>
          <li>Solicitar acesso aos seus dados</li>
          <li>Solicitar exclusão de seus dados</li>
          <li>Solicitar correção de dados incorretos</li>
          <li>Exportar suas fotos</li>
        </ul>

        <h2>7. Cookies e Rastreamento</h2>
        <p>O RevelaI não utiliza cookies de rastreamento. Utilizamos apenas cookies essenciais para o funcionamento da aplicação.</p>

        <h2>8. Menores de Idade</h2>
        <p>O RevelaI não é direcionado a menores de 16 anos. Não coletamos intencionalmente dados de menores.</p>

        <h2>9. Alterações nesta Política</h2>
        <p>Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças significativas através da plataforma.</p>

        <h2>10. Contato</h2>
        <p>Em caso de dúvidas sobre esta política de privacidade, entre em contato conosco através do e-mail: <span style="color:var(--accent);">privacidade@revelai.com.br</span></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.prose h2 {
  font-size: 18px;
  font-weight: 600;
  color: var(--cream);
  margin: 32px 0 12px;
}
.prose p {
  font-size: 14px;
  line-height: 1.7;
  color: rgba(248, 244, 235, 0.65);
  margin-bottom: 12px;
}
.prose ul {
  list-style: disc;
  padding-left: 20px;
  margin-bottom: 16px;
}
.prose li {
  font-size: 14px;
  line-height: 1.7;
  color: rgba(248, 244, 235, 0.65);
  margin-bottom: 6px;
}
</style>
