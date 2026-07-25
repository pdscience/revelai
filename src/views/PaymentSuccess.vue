<template>
  <div class="grain" style="min-height:100dvh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(ellipse 70% 60% at 50% 30%,rgba(255,122,46,0.06) 0%,transparent 60%),#0a0a0a;padding:24px;">
    <div v-if="loading" class="text-center">
      <p style="font-size:48px;filter:drop-shadow(0 0 20px rgba(255,122,46,0.45));">⏳</p>
      <p class="serif text-xl mt-4" style="color:rgba(248,244,235,0.65)">Confirmando pagamento...</p>
      <p class="text-xs mt-2" style="color:rgba(248,244,235,0.32)">aguarde alguns instantes</p>
    </div>

    <div v-else-if="error" class="text-center">
      <p style="font-size:48px;filter:drop-shadow(0 0 16px rgba(255,77,61,0.45));">❌</p>
      <p class="serif text-xl mt-4 mb-2" style="color:rgba(248,244,235,0.65)">Pagamento não confirmado</p>
      <p class="text-sm mb-6" style="color:rgba(248,244,235,0.42)">{{ error }}</p>
      <button class="btn-gold px-8 py-3" @click="goHome">Voltar ao início</button>
    </div>

    <div v-else class="text-center">
      <div class="success-icon" style="margin:0 auto 16px;">🎉</div>
      <p class="text-xs mb-2" style="color:var(--accent3);letter-spacing:2.5px;font-weight:700;text-transform:uppercase;">Sucesso</p>
      <p class="serif text-xl mt-2 mb-2" style="background:linear-gradient(135deg,var(--accent3),var(--accent) 50%,var(--accent2));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;">Pagamento confirmado!</p>
      <p class="text-sm mb-6" style="color:rgba(248,244,235,0.5)">Seu evento foi criado com sucesso.</p>
      <div v-if="accessCode" class="mb-6">
        <p class="text-xs mb-2" style="color:rgba(248,244,235,0.42);letter-spacing:1.4px;font-weight:600;">SEU CÓDIGO DE ACESSO</p>
        <div class="access-link-box" style="user-select:all;display:inline-block;">{{ accessCode }}</div>
      </div>
      <button class="btn-gold px-8 py-3" @click="goToApp">Acessar o app</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '../stores/app.js'
import { criarPagamento, atualizarEvento, buscarEventoPorCodigo, ensureAuth, verifyCheckoutSession, sendShareEmail } from '../composables/useInsForge.js'

const router = useRouter()
const route = useRoute()
const store = useAppStore()

const loading = ref(true)
const error = ref('')
const accessCode = ref('')

onMounted(async () => {
  const sessionId = route.query.session_id
  const eventoId = route.query.evento_id

  if (!sessionId || !eventoId) {
    error.value = 'Parâmetros de pagamento inválidos.'
    loading.value = false
    return
  }

  try {
    await ensureAuth()

    // Verificar pagamento no servidor Stripe (validação server-side)
    const verification = await verifyCheckoutSession(sessionId)

    if (!verification || !verification.verified) {
      error.value = verification?.error || 'Pagamento não confirmado pelo Stripe.'
      loading.value = false
      return
    }

    // Pagamento confirmado — registrar no banco
    await criarPagamento({
      eventoId: eventoId,
      gatewayId: sessionId,
      valorCentavos: verification.amountTotal || (store.plan?.price ? store.plan.price * 100 : 0),
      metodoPagamento: 'cartao'
    })

    await atualizarEvento(eventoId, { status: 'ativo' })

    const evento = await buscarEventoPorCodigo(store.accessCode || '')

    if (evento) {
      accessCode.value = evento.codigo_acesso
      store.setAccess(evento.codigo_acesso)
      store.currentEventoId = evento.id
      store.saveState()

      // Enviar link por email
      const shareLink = `${window.location.origin}/?join=${evento.share_code}`
      if (store.email) {
        sendShareEmail({
          email: store.email,
          eventName: evento.nome_evento || 'Meu Evento',
          shareUrl: shareLink
        }).catch(err => console.warn('Email send failed:', err))
      }
    }

    loading.value = false
  } catch (e) {
    console.error('Erro ao confirmar pagamento:', e)
    error.value = 'Erro ao processar pagamento.'
    loading.value = false
  }
})

function goHome() {
  router.push('/')
}

function goToApp() {
  router.push('/app')
}
</script>
