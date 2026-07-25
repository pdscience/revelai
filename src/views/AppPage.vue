<template>
  <div id="page-app">
    <div class="app-toast" id="app-toast" ref="toastEl">{{ toastMsg }}</div>

    <!-- Premium app header -->
    <header class="app-header">
      <button class="app-header-back" @click="goHome" aria-label="Sair">
        <span style="font-size:14px;">←</span> Sair
      </button>
      <div class="flex items-center gap-3 flex-1 justify-center min-w-0">
        <div class="land-logo" style="font-size:18px;flex-shrink:0;">RevelaI</div>
        <span class="access-badge" style="display:none;" :style="{ display: store.plan ? 'inline-block' : 'none' }">{{ store.plan?.name || store.plan?.nome || '—' }}</span>
        <span style="font-size:11px;color:rgba(248,244,235,0.4);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" class="min-w-0">{{ store.plan?.guests || store.plan?.limite_convidados || 0 }} convidados · {{ store.plan?.photos || store.plan?.limite_fotos_por_pessoa || 0 }} fotos/pessoa</span>
      </div>
      <button class="app-header-logout" @click="goHome">Menu</button>
    </header>

    <!-- Screens -->
    <AppHome :active="activeTab === 'home'" @create="openCreateEvent" @detail="openEventDetail" />
    <AppCamera :active="activeTab === 'camera'" @gallery="activeTab = 'gallery'" />
    <AppGallery :active="activeTab === 'gallery'" @share="openShareModal" />
    <AppProfile :active="activeTab === 'profile'" />

    <BottomNav :activeTab="activeTab" :tabs="navTabs" @navigate="navigateTab" />

    <!-- Share Modal -->
    <div class="modal-backdrop" :class="{ open: showShareModal }">
      <div class="modal-sheet text-center">
        <div class="flex items-center justify-between mb-5">
          <h3 class="serif text-xl">Compartilhar</h3>
          <button @click="showShareModal = false" style="color:rgba(248,244,235,0.4);font-size:22px;background:none;border:none;cursor:pointer;">✕</button>
        </div>
        <div class="mb-4 p-3 mx-auto" style="max-width:200px;background:linear-gradient(135deg,rgba(255,255,255,0.95),rgba(248,244,235,0.9));border-radius:18px;box-shadow:var(--glow-soft);">
          <canvas ref="qrCanvas"></canvas>
        </div>
        <p class="serif text-lg mb-1">{{ shareEvent?.nome_evento || shareEvent?.nome }}</p>
        <p class="text-sm mb-4" style="color:rgba(248,244,235,0.5)">Escaneie para entrar no evento</p>
        <div class="p-3 mb-4 text-xs font-mono" style="background:rgba(255,255,255,0.05);border:1px solid var(--border-soft);border-radius:10px;word-break:break-all;color:rgba(248,244,235,0.65);">{{ shareUrl }}</div>
        <div class="flex gap-3">
          <button class="btn-app-outline flex-1" @click="copyShareLink">📋 Copiar</button>
          <button class="btn-gold flex-1" @click="shareNative">📤 Compartilhar</button>
          <button class="btn-app-outline flex-1" @click="sendEmail" :disabled="isSendingEmail">
            {{ isSendingEmail ? '⏳' : '📧' }}
          </button>
        </div>
        <p v-if="emailSent" class="text-xs mt-3" style="color:var(--accent3);">✅ Link enviado por email!</p>
      </div>
    </div>

    <!-- Event Detail Modal -->
    <div class="modal-backdrop" :class="{ open: showDetailModal }">
      <div class="modal-sheet">
        <div class="flex items-center justify-between mb-5">
          <h3 class="serif text-xl">{{ detailEvent?.nome }}</h3>
          <button @click="showDetailModal = false" style="color:rgba(248,244,235,0.4);font-size:22px;background:none;border:none;cursor:pointer;">✕</button>
        </div>
        <div v-if="detailEvent">
          <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="p-3 text-center" style="background:linear-gradient(160deg,var(--charcoal2),var(--charcoal));border:1px solid var(--border);border-radius:12px;"><p class="text-xl font-bold" style="color:var(--accent)">{{ detailEvent.total_convidados_conectados || 0 }}</p><p class="text-xs mt-1" style="color:rgba(248,244,235,0.4)">fotos</p></div>
            <div class="p-3 text-center" style="background:linear-gradient(160deg,var(--charcoal2),var(--charcoal));border:1px solid var(--border);border-radius:12px;"><p class="text-xl font-bold" style="color:var(--accent)">{{ detailEvent.total_convidados_conectados || 0 }}/{{ detailEvent.limite_convidados }}</p><p class="text-xs mt-1" style="color:rgba(248,244,235,0.4)">participantes</p></div>
            <div class="p-3 text-center" style="background:linear-gradient(160deg,var(--charcoal2),var(--charcoal));border:1px solid var(--border);border-radius:12px;"><p class="text-xl font-bold" style="color:var(--accent)">{{ detailEvent.limite_fotos_por_pessoa }}</p><p class="text-xs mt-1" style="color:rgba(248,244,235,0.4)">fotos/pessoa</p></div>
            <div class="p-3 text-center" style="background:linear-gradient(160deg,var(--charcoal2),var(--charcoal));border:1px solid var(--border);border-radius:12px;"><p class="text-xl font-bold mono" style="color:var(--accent3)">{{ detailEvent.share_code }}</p><p class="text-xs mt-1" style="color:rgba(248,244,235,0.4)">código</p></div>
          </div>
          <div class="p-3 mb-3" style="background:linear-gradient(160deg,var(--charcoal2),var(--charcoal));border:1px solid var(--border);border-radius:12px;">
            <p class="text-xs mb-1" style="color:rgba(248,244,235,0.4);letter-spacing:0.8px;font-weight:600;">STATUS</p>
            <div class="flex items-center gap-2"><span class="status-dot" :class="detailExpired ? 'status-ended' : 'status-live'"></span><span class="text-sm">{{ detailExpired ? 'Encerrado' : 'Ao vivo' }}</span></div>
          </div>
          <div class="p-3" style="background:linear-gradient(160deg,var(--charcoal2),var(--charcoal));border:1px solid var(--border);border-radius:12px;">
            <p class="text-xs mb-1" style="color:rgba(248,244,235,0.4);letter-spacing:0.8px;font-weight:600;">REVELAÇÃO</p>
            <p class="text-sm">{{ detailEvent.revelacao_modo === 'instant' ? '⚡ Instantânea' : detailEvent.revelacao_modo === 'delayed' ? '🔒 ' + (detailEvent.revelacao_time ? new Date(detailEvent.revelacao_time).toLocaleString('pt-BR') : 'A definir') : '📅 Manual' }}</p>
          </div>
        </div>
        <div class="flex gap-3 mt-5">
          <button class="btn-app-outline flex-1" @click="shareFromDetail">🔗 Compartilhar</button>
          <button class="btn-gold flex-1" @click="openCameraFromDetail">📸 Câmera</button>
        </div>
      </div>
    </div>

    <CreateEventWizard v-if="showCreateWizard" @close="showCreateWizard = false" @created="onWizardCreated" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app.js'
import QRCode from 'qrcode'
import CreateEventWizard from '../components/CreateEventWizard.vue'
import { sendShareEmail } from '../composables/useInsForge.js'

import AppHome from '../components/AppHome.vue'
import AppCamera from '../components/AppCamera.vue'
import AppGallery from '../components/AppGallery.vue'
import AppProfile from '../components/AppProfile.vue'
import BottomNav from '../components/BottomNav.vue'
import navTabs from '../components/navTabs.js'

const router = useRouter()
const store = useAppStore()
const qrCanvas = ref(null)

const activeTab = ref('home')
const showCreateWizard = ref(false)
const showShareModal = ref(false)
const showDetailModal = ref(false)
const toastMsg = ref('')
let toastTimer = null

const shareUrl = ref('')
const shareEvent = ref(null)
const detailEvent = ref(null)
const isSendingEmail = ref(false)
const emailSent = ref(false)

const detailExpired = computed(() => {
  if (!detailEvent.value?.data_fim) return false
  return new Date() > new Date(detailEvent.value.data_fim)
})

onMounted(async () => {
  await store.carregarEventos()
})

function showToast(msg) {
  toastMsg.value = msg
  const toastEl = document.getElementById('app-toast')
  if (toastEl) toastEl.classList.add('show')
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    if (toastEl) toastEl.classList.remove('show')
  }, 2500)
}

function navigateTab(tab) {
  if (tab === activeTab.value) return
  activeTab.value = tab
}

function goHome() {
  router.push('/')
}

function openCreateEvent() {
  showCreateWizard.value = true
  document.body.style.overflow = 'hidden'
}

function onWizardCreated() {
  showCreateWizard.value = false
  document.body.style.overflow = ''
  store.carregarEventos()
}

function generateShareUrl(evento) {
  return `${window.location.origin}/?join=${evento.share_code}`
}

function openShareModal() {
  if (store.eventos.length === 0) {
    showToast('Nenhum evento criado')
    return
  }
  const evento = store.eventos[0]
  shareEvent.value = evento
  shareUrl.value = generateShareUrl(evento)
  emailSent.value = false
  showShareModal.value = true
  nextTick(generateQR)
}

async function generateQR() {
  if (!qrCanvas.value || !shareUrl.value) return
  try {
    await QRCode.toCanvas(qrCanvas.value, shareUrl.value, {
      width: 180,
      margin: 1,
      color: { dark: '#1A1A1A', light: '#FFFFFF' }
    })
  } catch (err) {
    console.warn('QR Code generation failed:', err)
  }
}

function copyShareLink() {
  navigator.clipboard.writeText(shareUrl.value).then(() => showToast('Link copiado!'))
}

function shareNative() {
  const eventName = shareEvent.value?.nome_evento || shareEvent.value?.nome || ''
  if (navigator.share) {
    navigator.share({
      title: `RevelaI — ${eventName}`,
      text: `Entre no meu evento "${eventName}" no RevelaI!`,
      url: shareUrl.value
    }).catch(() => {})
  } else copyShareLink()
}

async function sendEmail() {
  if (!store.email) {
    showToast('Cadastre seu email no perfil primeiro')
    return
  }
  if (isSendingEmail.value) return
  isSendingEmail.value = true
  emailSent.value = false

  try {
    const eventName = shareEvent.value?.nome_evento || shareEvent.value?.nome || 'Meu Evento'

    const result = await sendShareEmail({
      email: store.email,
      eventName,
      shareUrl: shareUrl.value
    })

    if (result?.ok) {
      emailSent.value = true
      showToast('📧 Link enviado!')
    } else {
      showToast('Erro ao enviar email')
    }
  } catch (err) {
    showToast('Erro ao enviar email')
  } finally {
    isSendingEmail.value = false
  }
}

function openEventDetail(id) {
  detailEvent.value = store.eventos.find(e => e.id === id) || null
  showDetailModal.value = true
}

function shareFromDetail() {
  showDetailModal.value = false
  shareEvent.value = detailEvent.value
  shareUrl.value = generateShareUrl(detailEvent.value)
  emailSent.value = false
  showShareModal.value = true
  nextTick(generateQR)
}

async function openCameraFromDetail() {
  await store.entrarComoAnfitriao(detailEvent.value)
  showDetailModal.value = false
  activeTab.value = 'camera'
}
</script>
