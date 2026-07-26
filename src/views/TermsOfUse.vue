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
      <h1 class="serif text-3xl mb-2" style="background:linear-gradient(135deg,var(--accent3),var(--accent) 50%,var(--accent2));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;">Termos de Uso</h1>
      <p class="text-sm mb-8" style="color:rgba(248,244,235,0.42);">Última atualização: 25 de julho de 2026</p>

      <div class="prose">
        <h2>1. Aceitação dos Termos</h2>
        <p>Ao acessar e utilizar o RevelaI, você concorda com estes Termos de Uso. Se não concordar, não utilize a plataforma.</p>

        <h2>2. Descrição do Serviço</h2>
        <p>O RevelaI é uma plataforma de fotografia para eventos que permite:</p>
        <ul>
          <li>Criar eventos com controle de acesso</li>
          <li>Convidados tirarem fotos durante o evento</li>
          <li>Compartilhar álbum de fotos entre participantes</li>
          <li>Controlar o momento da revelação das fotos</li>
        </ul>

        <h2>3. Responsabilidades do Anfitrião</h2>
        <ul>
          <li>Responsável pela criação e gerenciamento do evento</li>
          <li>Responsável pela aprovação dos convidados</li>
          <li>Responsável pela veracidade das informações fornecidas</li>
          <li>Responsável pelo pagamento dos planos contratados</li>
        </ul>

        <h2>4. Responsabilidades do Convidado</h2>
        <ul>
          <li>Utilizar a câmera de forma responsável</li>
          <li>Não capturar conteúdo impróprio ou ilegal</li>
          <li>Respeitar os limites de fotos definidos pelo plano</li>
          <li>Não compartilhar o link de acesso com pessoas não autorizadas</li>
        </ul>

        <h2>5. Propriedade Intelectual</h2>
        <ul>
          <li>Fotos são de propriedade de quem as capturou</li>
          <li>Anfitrião tem direito ao álbum completo do evento</li>
          <li>O RevelaI não reivindica direitos sobre as fotos</li>
          <li>Convidados podem fazer download de suas próprias fotos</li>
        </ul>

        <h2>6. Pagamentos</h2>
        <ul>
          <li>Planos são pagos antecipadamente</li>
          <li>Valores são apresentados em Reais (BRL)</li>
          <li>Pagamentos processados pelo Stripe</li>
          <li>Reembolso de 7 dias para primeiros pagamentos</li>
        </ul>

        <h2>7. Limitação de Responsabilidade</h2>
        <p>O RevelaI não se responsabiliza por:</p>
        <ul>
          <li>Perda de fotos por falhas técnicas</li>
          <li>Uso indevido da plataforma por terceiros</li>
          <li>Interrupções temporárias do serviço</li>
          <li>Danos indiretos decorrentes do uso</li>
        </ul>

        <h2>8. Retenção e Exclusão de Dados</h2>
        <ul>
          <li>As fotos são armazenadas durante o período de atividade do evento</li>
          <li>Após o encerramento do evento, as fotos são automaticamente excluídas após 10 dias</li>
          <li>É responsabilidade do anfitrião fazer o download das fotos antes do prazo de exclusão</li>
          <li>O RevelaI não se responsabiliza por fotos não baixadas antes da exclusão automática</li>
          <li>Dados de cadastro são mantidos enquanto a conta estiver ativa</li>
        </ul>

        <h2>9. Proibido</h2>
        <ul>
          <li>Violar leis ou regulamentos</li>
          <li>Interromper o funcionamento da plataforma</li>
          <li>Acessar dados de outros usuários não autorizadamente</li>
          <li>Utilizar para fins comerciais não autorizados</li>
        </ul>

        <h2>10. Modificações</h2>
        <p>Reservamo-nos o direito de modificar estes termos a qualquer momento. Usuários serão notificados de mudanças significativas.</p>

        <h2>11. Legislação Aplicável</h2>
        <p>Estes termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca de São Paulo/SP para dirimir quaisquer questões.</p>
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
