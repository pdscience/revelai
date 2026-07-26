<template>
  <div class="grain" style="min-height:100dvh;display:flex;flex-direction:column;background:#0a0a0a;">
    <!-- Header -->
    <div class="flex items-center justify-between p-4" style="position:absolute;top:0;left:0;right:0;z-index:10;background:linear-gradient(to bottom,rgba(0,0,0,0.85),transparent);padding-top:calc(16px + env(safe-area-inset-top,0px));">
      <div class="flex items-center gap-3">
        <div class="land-logo" style="font-size:18px;">RevelaI</div>
        <span class="text-xs" style="color:rgba(248,244,235,0.45);background:rgba(255,255,255,0.04);border:1px solid var(--border);padding:3px 10px;border-radius:10px;letter-spacing:0.4px;">convidado</span>
      </div>
      <div v-if="store.convidadoInfo" class="flex items-center gap-3">
        <div class="film-counter" :style="{ color: store.fotosRestantes <= 5 ? '#FF4D3D' : 'var(--accent3)', borderColor: store.fotosRestantes <= 5 ? 'rgba(255,77,61,0.6)' : 'var(--accent)' }">📽 {{ store.fotosRestantes }}</div>
        <div class="text-xs font-medium" style="color:rgba(248,244,235,0.85);text-shadow:0 1px 4px rgba(0,0,0,0.6);">{{ store.convidadoInfo.nomeEvento }}</div>
      </div>
    </div>

    <div v-if="loading" class="flex-1 flex items-center justify-center" style="color:rgba(248,244,235,0.4);">
      <div class="text-center">
        <p style="font-size:48px;filter:drop-shadow(0 0 24px rgba(255,122,46,0.5));">🎞️</p>
        <p class="text-sm mt-4">{{ loadingMsg }}</p>
      </div>
    </div>

    <div v-else-if="error" class="flex-1 flex items-center justify-center p-8">
      <div class="text-center">
        <p style="font-size:48px;">📷</p>
        <p class="serif text-xl mt-4 mb-2" style="color:rgba(248,244,235,0.65)">{{ errorMsg }}</p>
        <p class="text-sm" style="color:rgba(248,244,235,0.42)">O link que você acessou é inválido ou o evento foi encerrado.</p>
        <button class="btn-gold mt-4" @click="retryEntry">Tentar novamente</button>
      </div>
    </div>

    <!-- Camera -->
    <div v-else class="flex-1 flex flex-col" style="padding-top:64px;">
      <div class="camera-viewfinder" :class="'filter-' + currentFilter" style="flex:1;max-height:none;">
        <video id="guest-video" ref="videoEl" autoplay muted playsinline style="width:100%;height:100%;object-fit:cover;"></video>
        <canvas ref="canvasEl" style="display:none;"></canvas>
        <div class="film-filter"></div>
        <div class="flash-overlay" ref="flashOverlay"></div>
        <div style="position:absolute;top:20px;left:20px;width:22px;height:22px;border-top:2px solid rgba(233,162,75,0.7);border-left:2px solid rgba(233,162,75,0.7);z-index:8;"></div>
        <div style="position:absolute;top:20px;right:20px;width:22px;height:22px;border-top:2px solid rgba(233,162,75,0.7);border-right:2px solid rgba(233,162,75,0.7);z-index:8;"></div>
        <div style="position:absolute;bottom:20px;left:20px;width:22px;height:22px;border-bottom:2px solid rgba(233,162,75,0.7);border-left:2px solid rgba(233,162,75,0.7);z-index:8;"></div>
        <div style="position:absolute;bottom:20px;right:20px;width:22px;height:22px;border-bottom:2px solid rgba(233,162,75,0.7);border-right:2px solid rgba(233,162,75,0.7);z-index:8;"></div>
        <div v-if="!cameraReady" id="no-camera-msg" style="position:absolute;inset:0;z-index:50;background:#0a0a0a;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;">
          <span style="font-size:48px;">📷</span>
          <p class="serif text-xl" style="color:rgba(248,244,235,0.65)">Câmera indisponível</p>
          <p class="text-sm text-center px-8" style="color:rgba(248,244,235,0.42)">Permita o acesso à câmera para participar</p>
          <button class="btn-gold mt-4" @click="initCamera">Tentar novamente</button>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex gap-2 px-4 py-3 overflow-x-auto" style="background:rgba(10,9,7,0.92);">
        <button v-for="f in filters" :key="f.id" class="filter-pill" :class="{ active: currentFilter === f.id }" @click="currentFilter = f.id">{{ f.label }}</button>
      </div>

      <!-- Controls -->
      <div class="flex items-center justify-between px-8 py-4" style="background:rgba(10,9,7,0.92);padding-bottom:calc(16px + env(safe-area-inset-bottom,0px));">
        <button class="btn-app-outline text-xs py-2 px-3" @click="screen = 'gallery'">
          🖼️ {{ store.currentPhotos.length }}
        </button>
        <button class="shutter-btn" @click="takePhoto" :disabled="!store.podeTirarMaisFotos" aria-label="Capturar">
          <div style="width:60px;height:60px;border-radius:50%;background:rgba(0,0,0,0.08);"></div>
        </button>
        <div style="width:54px;"></div>
      </div>
    </div>

    <!-- Toast -->
    <div class="app-toast" :class="{ show: toastVisible }">{{ toastMsg }}</div>

    <!-- Gallery overlay -->
    <div class="screen" :class="{ active: screen === 'gallery' }" style="padding-bottom:100px;padding-top:80px;position:fixed;inset:0;z-index:100;background:var(--charcoal);overflow-y:auto;min-height:100dvh;">
      <div class="p-5 pt-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <p class="text-xs" style="color:var(--accent3);letter-spacing:2.5px;font-weight:700;text-transform:uppercase;margin-bottom:4px;">Galeria</p>
            <h2 class="serif text-2xl">{{ store.convidadoInfo?.nomeEvento || 'Galeria' }}</h2>
          </div>
          <button class="btn-app-outline text-xs py-2 px-3" @click="screen = 'camera'">📸 Voltar</button>
        </div>

        <div v-if="showRevealTimer" class="mb-4 p-4" style="background:linear-gradient(135deg,rgba(255,77,61,0.10),rgba(255,77,61,0.04));border:1px solid rgba(255,77,61,0.28);border-radius:14px;">
          <div class="flex items-center gap-3">
            <span class="text-2xl">🔒</span>
            <div>
              <p class="text-sm font-medium">Fotos bloqueadas até a revelação</p>
              <p class="countdown-badge mt-1">{{ countdown }}</p>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3 mb-5 overflow-x-auto">
          <span class="tag-badge">{{ store.currentPhotos.length }} fotos</span>
          <span class="tag-badge">{{ store.fotosRestantes }} restantes</span>
        </div>

        <div v-if="store.currentPhotos.length === 0" class="text-center py-12">
          <p style="font-size:40px;">📸</p>
          <p class="text-sm mt-2" style="color:rgba(248,244,235,0.4)">Você ainda não tirou fotos</p>
        </div>

        <div v-else class="photo-grid">
          <div v-for="(p, idx) in store.currentPhotos" :key="p.id" class="photo-fade" :style="{ animationDelay: (idx * 0.03) + 's' }" style="position:relative;aspect-ratio:1;overflow:hidden;border-radius:10px;background:var(--charcoal2);border:1px solid var(--border-soft);">
            <img :src="getPhotoSrc(p)" style="width:100%;height:100%;object-fit:cover;" :class="{ 'photo-locked': !revealed }" loading="lazy">
            <div v-if="!revealed" class="reveal-overlay"><span style="font-size:24px;">🔒</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '../stores/app.js'
import { fetchAuthenticatedImage, revokeCachedBlobUrls } from '../composables/useInsForge.js'

const route = useRoute()
const router = useRouter()
const store = useAppStore()

const videoEl = ref(null)
const canvasEl = ref(null)
const flashOverlay = ref(null)

const loading = ref(true)
const loadingMsg = ref('Carregando evento...')
const error = ref(false)
const errorMsg = ref('Evento não encontrado')
const screen = ref('camera')
const cameraReady = ref(false)
const cameraStream = ref(null)
const currentFilter = ref('original')
const toastVisible = ref(false)
const toastMsg = ref('')
let toastTimer = null

const photoSrcMap = ref({})

async function resolvePhotoUrls(photos) {
  const updates = {}
  for (const photo of photos) {
    if (photo.url && !photoSrcMap.value[photo.id]) {
      const resolved = await fetchAuthenticatedImage(photo.url)
      if (resolved) updates[photo.id] = resolved
    }
  }
  if (Object.keys(updates).length > 0) {
    photoSrcMap.value = { ...photoSrcMap.value, ...updates }
  }
}

function getPhotoSrc(photo) {
  return photoSrcMap.value[photo.id] || photo.url || photo.dataUrl || ''
}

const filters = [
  { id: 'original', label: 'Original' },
  { id: 'film', label: 'Filme' },
  { id: 'warm', label: 'Quente' },
  { id: 'cold', label: 'Frio' },
  { id: 'bw', label: 'P&B' },
  { id: 'grain', label: 'Grão' },
]

const showRevealTimer = computed(() => {
  const info = store.convidadoInfo
  if (!info || info.revelacaoModo !== 'delayed' || !info.revelacaoTime) return false
  return new Date() < new Date(info.revelacaoTime)
})

const revealed = computed(() => {
  const info = store.convidadoInfo
  if (!info || info.revelacaoModo !== 'delayed' || !info.revelacaoTime) return true
  return new Date() >= new Date(info.revelacaoTime)
})

const countdown = ref('')
let countdownInterval = null

onMounted(async () => {
  const shareCode = route.query.join

  if (!shareCode) {
    errorMsg.value = 'Link inválido'
    error.value = true
    loading.value = false
    return
  }

  try {
    loadingMsg.value = 'Verificando evento...'
    const resultado = await store.entrarNoEvento(shareCode)

    if (!resultado.ok) {
      errorMsg.value = resultado.erro || 'Não foi possível entrar no evento'
      error.value = true
      loading.value = false
      return
    }

    loading.value = false
    await initCamera()

    // Iniciar escuta de fotos em tempo real
    store.iniciarRealtimeFotos()

    if (showRevealTimer.value) startCountdown()
  } catch (e) {
    console.error('Erro ao entrar no evento:', e)
    errorMsg.value = 'Erro ao conectar ao servidor'
    error.value = true
    loading.value = false
  }
})

onUnmounted(() => {
  stopCamera()
  store.pararRealtimeFotos()
  if (countdownInterval) clearInterval(countdownInterval)
  revokeCachedBlobUrls()
})

async function retryEntry() {
  loading.value = true
  error.value = false
  window.location.reload()
}

async function initCamera() {
  if (cameraStream.value) return
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false
    })
    cameraStream.value = stream
    if (videoEl.value) videoEl.value.srcObject = stream
    cameraReady.value = true
  } catch {
    cameraReady.value = false
  }
}

function stopCamera() {
  if (cameraStream.value) {
    cameraStream.value.getTracks().forEach(t => t.stop())
    cameraStream.value = null
  }
}

async function takePhoto() {
  if (!store.convidadoInfo) return showToast('Evento não encontrado')
  if (!store.podeTirarMaisFotos) return showToast('Seu rolo de filme acabou!')
  if (!cameraReady.value) return showToast('Câmera indisponível')

  const video = videoEl.value
  if (!video?.srcObject) return

  // Verificar limite via DB antes de capturar
  const verificacao = await store.verificarLimiteFoto()
  if (!verificacao.ok) {
    return showToast(verificacao.erro || 'Limite de fotos atingido!')
  }

  if (flashOverlay.value) {
    flashOverlay.value.style.opacity = '0.85'
    flashOverlay.value.style.transition = 'opacity 0.05s'
    setTimeout(() => {
      if (flashOverlay.value) {
        flashOverlay.value.style.transition = 'opacity 0.35s'
        flashOverlay.value.style.opacity = '0'
      }
    }, 50)
  }

  const canvas = canvasEl.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  canvas.width = video.videoWidth || 1280
  canvas.height = video.videoHeight || 720

  ctx.drawImage(video, 0, 0)

  const dataUrl = canvas.toDataURL('image/jpeg', 0.78)

  const resultado = await store.tirarFoto(dataUrl, currentFilter.value)

  if (resultado.ok) {
    showToast(`📸 Foto salva! ${resultado.restantes} restantes`)
    await resolvePhotoUrls(store.currentPhotos)
  } else {
    showToast(resultado.erro || 'Erro ao salvar foto')
  }
}

function startCountdown() {
  countdownInterval = setInterval(() => {
    const info = store.convidadoInfo
    if (!info?.revelacaoTime) { clearInterval(countdownInterval); return }
    const diff = new Date(info.revelacaoTime) - new Date()
    if (diff <= 0) {
      clearInterval(countdownInterval)
      countdown.value = 'Revelado!'
      return
    }
    const h = Math.floor(diff / 3600000).toString().padStart(2, '0')
    const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0')
    const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0')
    countdown.value = `${h}:${m}:${s}`
  }, 1000)
}

function showToast(msg) {
  toastMsg.value = msg
  toastVisible.value = true
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastVisible.value = false }, 2500)
}
</script>
