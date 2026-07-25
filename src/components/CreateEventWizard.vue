<template>
  <div class="payment-overlay" :class="{ open: true }">
    <div class="payment-sheet">
      <div class="flex items-center justify-between mb-5">
        <div>
          <p class="text-xs" style="color:var(--accent3);letter-spacing:2.5px;font-weight:700;text-transform:uppercase;margin-bottom:4px;">Novo evento</p>
          <h3 class="serif text-xl">Criar Evento</h3>
          <p style="font-size:13px;color:rgba(248,244,235,0.45);">Passo {{ wizardStep + 1 }} de 3</p>
        </div>
        <button @click="$emit('close')" style="color:rgba(248,244,235,0.4);font-size:24px;line-height:1;padding:4px;background:none;border:none;cursor:pointer;">✕</button>
      </div>

      <div class="wizard-progress">
        <div v-for="s in 3" :key="s" class="wiz-dot" :class="{ active: wizardStep >= s - 1, done: wizardStep > s - 1 }"></div>
      </div>

      <!-- STEP 0: Choose Plan -->
      <div v-show="wizardStep === 0" class="wizard-step">
        <div class="text-center mb-6">
          <p style="font-size:36px;filter:drop-shadow(0 0 16px rgba(255,122,46,0.4));">📋</p>
          <h4 class="serif text-lg mt-3">Escolha seu plano</h4>
          <p style="font-size:13px;color:rgba(248,244,235,0.42);">Selecione o plano ideal para o seu evento.</p>
        </div>

        <div v-if="loadingPlans" class="text-center py-6" style="color:rgba(248,244,235,0.42);">
          <p class="text-sm">Carregando planos...</p>
        </div>

        <div v-else class="flex flex-col gap-3">
          <div v-for="p in plans" :key="p.id" class="wiz-card" :class="{ selected: selectedPlan?.id === p.id }" @click="selectPlan(p)">
            <div class="flex items-center justify-between w-full">
              <div>
                <div class="font-semibold" style="color:var(--cream);">{{ p.nome }}</div>
                <div style="font-size:12px;color:rgba(248,244,235,0.42);">
                  {{ p.limite_convidados >= 9999 ? 'Ilimitado' : p.limite_convidados + ' convidados' }} · {{ p.limite_fotos_por_pessoa >= 9999 ? '∞' : p.limite_fotos_por_pessoa }} fotos/pessoa
                </div>
              </div>
              <div class="serif text-xl" style="background:linear-gradient(135deg,var(--accent3),var(--accent) 50%,var(--accent2));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;">
                {{ p.preco_centavos === 0 ? 'Grátis' : 'R$ ' + (p.preco_centavos / 100).toFixed(2).replace('.', ',') }}
              </div>
            </div>
          </div>
        </div>

        <button class="btn-primary w-full mt-6" style="width:100%;" :disabled="!selectedPlan" @click="nextStep">Continuar →</button>
      </div>

      <!-- STEP 1: Event Name + Reveal Timing + Date -->
      <div v-show="wizardStep === 1" class="wizard-step">
        <div class="text-center mb-6">
          <p style="font-size:36px;filter:drop-shadow(0 0 16px rgba(255,122,46,0.4));">📅</p>
          <h4 class="serif text-lg mt-3">Nome e revelação</h4>
          <p style="font-size:13px;color:rgba(248,244,235,0.42);">Dê um nome ao evento e escolha quando as fotos serão reveladas.</p>
        </div>
        <div style="display:flex;flex-direction:column;gap:16px;">
          <div>
            <label class="input-label">NOME DO EVENTO *</label>
            <input class="input-field" type="text" v-model="eventName" placeholder="Ex: Casamento Ana & João">
          </div>

          <div>
            <label class="input-label" style="margin-bottom:10px;display:block;">QUANDO REVELAR? *</label>
            <div class="flex flex-col gap-2">
              <div v-for="opt in revealOptions" :key="opt.value" class="wiz-card" :class="{ selected: revealTiming === opt.value }" @click="revealTiming = opt.value" style="padding:12px 14px;">
                <span style="font-size:20px;">{{ opt.icon }}</span>
                <div>
                  <div class="font-semibold" style="color:var(--cream);font-size:13px;">{{ opt.label }}</div>
                  <div style="font-size:11px;color:rgba(248,244,235,0.42);">{{ opt.desc }}</div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="revealTiming === 'during'">
            <label class="input-label">DATA DO EVENTO *</label>
            <input class="input-field" type="date" v-model="eventDate" :min="setTodayMin()">
          </div>
          <div v-if="revealTiming === 'after' || revealTiming === 'later'">
            <label class="input-label">DATA DA REVELAÇÃO *</label>
            <input class="input-field" type="date" v-model="revealDate" :min="setTodayMin()">
          </div>
          <div v-if="revealTiming === 'after'">
            <label class="input-label">HORÁRIO DA REVELAÇÃO</label>
            <input class="input-field" type="time" v-model="revealTime">
          </div>
        </div>
        <button class="btn-primary w-full mt-6" style="width:100%;" :disabled="!eventName || (revealTiming !== 'during' && !revealDate)" @click="nextStep">Continuar →</button>
      </div>

      <!-- STEP 2: Payment -->
      <div v-show="wizardStep === 2" class="wizard-step">
        <div class="order-summary" style="margin-bottom:20px;">
          <div class="flex justify-between">
            <div>
              <p style="font-size:12px;color:rgba(248,244,235,0.5);text-transform:uppercase;letter-spacing:0.8px;font-weight:600;">Resumo</p>
              <p class="font-semibold mt-1" style="color:var(--cream);">{{ eventName || 'Meu Evento' }}</p>
            </div>
            <div style="text-align:right;">
              <p style="font-size:12px;color:rgba(248,244,235,0.5);">Total</p>
              <p class="serif text-2xl" style="background:linear-gradient(135deg,var(--accent3),var(--accent) 50%,var(--accent2));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;">{{ planPrice }}</p>
            </div>
          </div>
          <div class="flex gap-3 mt-3 pt-3" style="border-top:1px solid var(--border-soft);">
            <div class="text-center flex-1">
              <p style="font-size:18px;font-weight:700;color:var(--accent3);">{{ selectedPlan?.limite_convidados >= 9999 ? '∞' : selectedPlan?.limite_convidados }}</p>
              <p style="font-size:11px;color:rgba(248,244,235,0.42);">convidados</p>
            </div>
            <div style="width:1px;background:var(--border-soft);"></div>
            <div class="text-center flex-1">
              <p style="font-size:18px;font-weight:700;color:var(--accent3);">{{ selectedPlan?.limite_fotos_por_pessoa >= 9999 ? '∞' : selectedPlan?.limite_fotos_por_pessoa }}</p>
              <p style="font-size:11px;color:rgba(248,244,235,0.42);">fotos/pessoa</p>
            </div>
            <div style="width:1px;background:var(--border-soft);"></div>
            <div class="text-center flex-1">
              <p style="font-size:18px;font-weight:700;color:var(--accent3);">{{ selectedPlan?.nome }}</p>
              <p style="font-size:11px;color:rgba(248,244,235,0.42);">plano</p>
            </div>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:14px;">
          <div><label class="input-label">NOME COMPLETO *</label><input class="input-field" type="text" v-model="payName" placeholder="Seu nome completo"></div>
          <div><label class="input-label">E-MAIL *</label><input class="input-field" type="email" v-model="payEmail" placeholder="seu@email.com"></div>
          <div><label class="input-label">TELEFONE (WHATSAPP)</label><input class="input-field" type="tel" v-model="payPhone" placeholder="(11) 99999-9999" @input="maskPhone"></div>
        </div>

        <div v-if="selectedPlan && selectedPlan.preco_centavos > 0" class="mt-4">
          <label class="input-label" style="margin-bottom:12px;display:block;">FORMA DE PAGAMENTO</label>
          <div class="payment-method-grid">
            <div class="payment-method-btn" :class="{ selected: selectedPayMethod === 'stripe' }" @click="selectedPayMethod = 'stripe'"><span>💳</span><span>Cartão</span></div>
            <div class="payment-method-btn" :class="{ selected: selectedPayMethod === 'pix' }" @click="selectedPayMethod = 'pix'"><span>⚡</span><span>Pix</span></div>
            <div class="payment-method-btn" :class="{ selected: selectedPayMethod === 'boleto' }" @click="selectedPayMethod = 'boleto'"><span>📄</span><span>Boleto</span></div>
          </div>
        </div>

        <div v-if="selectedPlan && selectedPlan.preco_centavos === 0" class="mt-4 p-4 text-center" style="background:linear-gradient(135deg,rgba(61,220,140,0.10),rgba(61,220,140,0.04));border:1px solid rgba(61,220,140,0.28);border-radius:14px;">
          <p class="text-sm" style="color:rgba(248,244,235,0.7)">🎉 Plano gratuito — sem pagamento necessário</p>
        </div>

        <div class="flex gap-3 mt-6">
          <button class="btn-app-outline flex-1" @click="prevStep">← Voltar</button>
          <button class="btn-primary flex-1" :disabled="processingPayment" @click="processPayment">
            {{ selectedPlan?.preco_centavos === 0 ? '🚀 Criar evento grátis' : '🔒 ' + (processingPayment ? 'Processando...' : 'Pagar ' + planPrice) }}
          </button>
        </div>
        <p v-if="selectedPlan && selectedPlan.preco_centavos > 0" style="text-align:center;font-size:11px;color:rgba(248,244,235,0.32);margin-top:12px;">🔒 Pagamento 100% seguro e criptografado</p>
      </div>

      <!-- STEP 3: Success -->
      <div v-show="wizardStep === 3" class="wizard-step text-center">
        <div class="success-icon">🎉</div>
        <h3 class="serif text-2xl mb-2">{{ selectedPlan?.preco_centavos === 0 ? 'Evento criado!' : 'Pagamento confirmado!' }}</h3>
        <p style="font-size:14px;color:rgba(248,244,235,0.55);margin-bottom:24px;">Seu evento foi criado. Compartilhe o link com os convidados para começarem a fotografar.</p>
        <div style="background:linear-gradient(135deg,rgba(233,162,75,0.10),rgba(255,122,46,0.04));border:1px solid var(--border-strong);border-radius:16px;padding:20px;margin-bottom:20px;">
          <p style="font-size:12px;color:rgba(248,244,235,0.5);letter-spacing:0.8px;margin-bottom:8px;text-transform:uppercase;font-weight:600;">📧 Enviado para</p>
          <p style="font-size:15px;font-weight:600;color:var(--cream);">{{ payEmail }}</p>
        </div>
        <p style="font-size:13px;color:rgba(248,244,235,0.55);margin-bottom:8px;">🔗 Link para convidados:</p>
        <div class="access-link-box" style="user-select:all;">{{ accessUrl }}</div>
        <div style="background:linear-gradient(160deg,var(--charcoal2),var(--charcoal));border:1px solid var(--border);border-radius:16px;padding:16px;margin-bottom:24px;text-align:left;">
          <p style="font-size:12px;font-weight:700;color:var(--accent);margin-bottom:10px;letter-spacing:0.6px;">SEU EVENTO</p>
          <div class="flex gap-4 flex-wrap">
            <div><span style="font-size:16px;font-weight:700;color:var(--cream);">{{ selectedPlan?.limite_convidados >= 9999 ? '∞' : selectedPlan?.limite_convidados }}</span><p style="font-size:11px;color:rgba(248,244,235,0.42);">convidados</p></div>
            <div><span style="font-size:16px;font-weight:700;color:var(--cream);">{{ selectedPlan?.limite_fotos_por_pessoa >= 9999 ? '∞' : selectedPlan?.limite_fotos_por_pessoa }}</span><p style="font-size:11px;color:rgba(248,244,235,0.42);">fotos/pessoa</p></div>
            <div><span style="font-size:16px;font-weight:700;color:var(--cream);">{{ selectedPlan?.nome }}</span><p style="font-size:11px;color:rgba(248,244,235,0.42);">plano</p></div>
          </div>
        </div>
        <div class="flex gap-3">
          <button class="btn-app-outline flex-1" @click="copyAccessLink">📋 Copiar link</button>
          <button class="btn-primary flex-1" @click="$emit('created')">🚀 Acessar app</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app.js'
import { createCheckoutSession, fetchPlans, sendShareEmail } from '../composables/useInsForge.js'

const emit = defineEmits(['close', 'created'])
const router = useRouter()
const store = useAppStore()

const wizardStep = ref(0)
const processingPayment = ref(false)
const loadingPlans = ref(true)
const accessUrl = ref('')

const plans = ref([])
const selectedPlan = ref(null)

const eventName = ref('')
const eventDate = ref('')
const revealDate = ref('')
const revealTime = ref('')
const revealTiming = ref('during')

const payName = ref('')
const payEmail = ref('')
const payPhone = ref('')
const selectedPayMethod = ref('stripe')

const revealOptions = [
  { value: 'during', label: 'Durante o evento', icon: '🎉', desc: 'As fotos aparecem imediatamente no álbum compartilhado durante o evento' },
  { value: 'after', label: 'Depois do evento', icon: '🎬', desc: 'As fotos ficam bloqueadas até a data/hora escolhida e são reveladas automaticamente' },
  { value: 'later', label: 'Adicionar depois', icon: '📅', desc: 'Crie agora e defina a revelação quando quiser pelo painel de controle' },
]

const planPrice = computed(() => {
  if (!selectedPlan.value) return 'R$ 0,00'
  if (selectedPlan.value.preco_centavos === 0) return 'Grátis'
  return 'R$ ' + (selectedPlan.value.preco_centavos / 100).toFixed(2).replace('.', ',')
})

onMounted(async () => {
  try {
    plans.value = await fetchPlans()
  } catch (e) {
    console.error('Erro ao carregar planos:', e)
  } finally {
    loadingPlans.value = false
  }
})

function selectPlan(plan) {
  selectedPlan.value = plan
}

function nextStep() {
  if (wizardStep.value < 3) wizardStep.value++
}

function prevStep() {
  if (wizardStep.value > 0) wizardStep.value--
}

function maskPhone(e) {
  let v = e.target.value.replace(/\D/g, '').slice(0, 11)
  v = v.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2')
  e.target.value = v
}

function setTodayMin() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

async function processPayment() {
  if (!payName.value || !payEmail.value) {
    alert('Preencha seu nome e e-mail!')
    return
  }
  if (!payEmail.value.includes('@')) {
    alert('E-mail inválido!')
    return
  }

  processingPayment.value = true

  try {
    // 1. Criar evento no banco primeiro
    const now = new Date().toISOString()
    const evento = await store.criarNovoEvento({
      nomeEvento: eventName.value || 'Meu Evento',
      planoId: selectedPlan.value.id,
      dataInicio: eventDate.value || now,
      dataFim: revealTiming.value === 'during'
        ? (eventDate.value ? new Date(eventDate.value + 'T23:59:59').toISOString() : new Date(Date.now() + 7 * 86400000).toISOString())
        : (revealDate.value ? new Date(revealDate.value + 'T23:59:59').toISOString() : new Date(Date.now() + 7 * 86400000).toISOString()),
      revelacaoModo: revealTiming.value === 'during' ? 'instant' : revealTiming.value === 'after' ? 'delayed' : 'manual',
      revelacaoTime: revealTiming.value === 'after' && revealDate.value
        ? `${revealDate.value}T${revealTime.value || '00:00'}`
        : null
    })

    if (!evento) {
      alert('Erro ao criar evento.')
      processingPayment.value = false
      return
    }

    // 2. Se plano gratuito, finalizar direto
    if (selectedPlan.value.preco_centavos === 0) {
      const { atualizarEvento } = await import('../composables/useInsForge.js')
      await atualizarEvento(evento.id, { status: 'ativo' })

      store.setPlan({
        id: selectedPlan.value.id,
        name: selectedPlan.value.nome,
        price: 0,
        guests: selectedPlan.value.limite_convidados,
        photos: selectedPlan.value.limite_fotos_por_pessoa,
      })
      store.setEmailAddr(payEmail.value)

      accessUrl.value = `${window.location.origin}/?join=${evento.share_code}`

      // Enviar link por email
      sendShareEmail({
        email: payEmail.value,
        eventName: eventName.value || 'Meu Evento',
        shareUrl: accessUrl.value
      }).catch(err => console.warn('Email send failed:', err))

      wizardStep.value = 3
      processingPayment.value = false
      return
    }

    // 3. Criar sessão de checkout Stripe
    const session = await createCheckoutSession({
      priceCents: selectedPlan.value.preco_centavos,
      planName: selectedPlan.value.nome,
      successUrl: `${window.location.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&evento_id=${evento.id}`,
      cancelUrl: `${window.location.origin}${window.location.pathname}`,
      eventoId: evento.id,
      customerEmail: payEmail.value
    })

    if (session?.url) {
      store.setPlan({
        id: selectedPlan.value.id,
        name: selectedPlan.value.nome,
        price: selectedPlan.value.preco_centavos / 100,
        guests: selectedPlan.value.limite_convidados,
        photos: selectedPlan.value.limite_fotos_por_pessoa,
      })
      store.setEmailAddr(payEmail.value)
      window.location.href = session.url
    } else {
      alert('Erro ao iniciar pagamento. Verifique se o Stripe está configurado.')
    }
  } catch (e) {
    console.error('Erro ao processar:', e)
    alert('Erro ao processar.')
  } finally {
    processingPayment.value = false
  }
}

function copyAccessLink() {
  navigator.clipboard.writeText(accessUrl.value).then(() => {
    const toast = document.querySelector('.app-toast')
    if (toast) { toast.textContent = '🔗 Link copiado!'; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2500) }
  })
}
</script>
