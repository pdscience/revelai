<template>
  <div class="screen" :class="{ active: active }" style="padding-bottom:60px;background:#000;padding-top:64px;">
    <div class="flex items-center justify-between p-4" style="position:absolute;top:64px;left:0;right:0;z-index:10;background:linear-gradient(to bottom,rgba(0,0,0,0.8),transparent);">
      <div class="flex items-center gap-3">
        <div class="film-counter" :class="{ flash: counterFlash }" :style="{ color: store.fotosRestantes <= 5 ? '#FF4D3D' : 'var(--accent3)', borderColor: store.fotosRestantes <= 5 ? 'rgba(255,77,61,0.6)' : 'var(--accent)' }">
          📽 {{ store.convidadoInfo ? store.fotosRestantes : '—' }}
        </div>
        <div class="text-xs font-medium" style="color:rgba(248,244,235,0.85);text-shadow:0 1px 4px rgba(0,0,0,0.6);">
          {{ store.convidadoInfo?.nomeEvento || 'Sem evento' }}
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button @click="toggleFlash" class="text-xl" :style="{ opacity: flashEnabled ? 1 : 0.45, filter: flashEnabled ? 'drop-shadow(0 0 8px rgba(255,122,46,0.6))' : 'none' }" aria-label="Flash">⚡</button>
        <button @click="switchCamera" class="text-xl" style="opacity:0.65" aria-label="Trocar câmera">🔄</button>
      </div>
    </div>

    <div class="camera-viewfinder" :class="'filter-' + currentFilter" id="viewfinder">
      <video id="camera-video" ref="videoEl" autoplay muted playsinline></video>
      <canvas id="photo-canvas" ref="canvasEl" style="display:none;"></canvas>
      <div class="film-filter"></div>
      <div class="flash-overlay" ref="flashOverlay"></div>
      <div style="position:absolute;top:20px;left:20px;width:22px;height:22px;border-top:2px solid rgba(233,162,75,0.7);border-left:2px solid rgba(233,162,75,0.7);z-index:8;"></div>
      <div style="position:absolute;top:20px;right:20px;width:22px;height:22px;border-top:2px solid rgba(233,162,75,0.7);border-right:2px solid rgba(233,162,75,0.7);z-index:8;"></div>
      <div style="position:absolute;bottom:20px;left:20px;width:22px;height:22px;border-bottom:2px solid rgba(233,162,75,0.7);border-left:2px solid rgba(233,162,75,0.7);z-index:8;"></div>
      <div style="position:absolute;bottom:20px;right:20px;width:22px;height:22px;border-bottom:2px solid rgba(233,162,75,0.7);border-right:2px solid rgba(233,162,75,0.7);z-index:8;"></div>
    </div>

    <div class="flex gap-2 px-4 py-3 overflow-x-auto" style="background:rgba(10,9,7,0.92);">
      <button v-for="f in filters" :key="f.id" class="filter-pill" :class="{ active: currentFilter === f.id }" @click="setFilter(f.id)">{{ f.label }}</button>
    </div>

    <div class="px-4 py-2" style="background:rgba(10,9,7,0.92);">
      <div class="flex gap-4 overflow-x-auto pb-1">
        <div v-for="s in sliders" :key="s.key" style="min-width:110px;">
          <div class="slider-label"><span>{{ s.label }}</span><span style="color:var(--accent3);font-weight:600;">{{ enhancement[s.key] }}</span></div>
          <input type="range" :min="s.min" :max="s.max" :value="enhancement[s.key]" class="w-full" @input="updateEnhancement(s.key, $event)">
        </div>
      </div>
    </div>

    <div class="flex items-center justify-between px-8 py-4" style="background:rgba(10,9,7,0.92);">
      <div style="width:54px;height:54px;border-radius:12px;overflow:hidden;border:2px solid var(--border-strong);cursor:pointer;" @click="$emit('gallery')">
        <div v-if="!lastPhoto" style="width:100%;height:100%;background:rgba(255,255,255,0.05);display:flex;align-items:center;justify-content:center;font-size:20px;">🖼️</div>
        <img v-else :src="lastPhoto" style="width:100%;height:100%;object-fit:cover;">
      </div>
      <button class="shutter-btn" :class="{ captured: isCapturing }" @click="takePhoto" :disabled="!store.podeTirarMaisFotos" aria-label="Capturar">
        <div style="width:60px;height:60px;border-radius:50%;background:rgba(0,0,0,0.08);"></div>
      </button>
      <div style="width:54px;height:54px;border-radius:12px;border:1px solid var(--border-strong);cursor:pointer;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.04);" @click="$emit('selectFilm')">
        <span style="font-size:22px;">🎞️</span>
      </div>
    </div>

    <div v-if="cameraError" style="display:flex;position:absolute;top:64px;left:0;right:0;bottom:100px;z-index:50;background:#0a0a0a;flex-direction:column;align-items:center;justify-content:center;gap:12px;">
      <span style="font-size:48px;">📷</span>
      <p class="serif text-xl" style="color:rgba(248,244,235,0.65)">Câmera indisponível</p>
      <p class="text-sm text-center px-8" style="color:rgba(248,244,235,0.42)">Permita o acesso à câmera</p>
      <button class="btn-gold mt-4" @click="initCamera">Tentar novamente</button>
    </div>

    <!-- Toast de limite -->
    <div v-if="showLimitToast" class="app-toast show" style="background:rgba(255,77,61,0.96);border-color:rgba(255,77,61,0.5);color:#fff;font-weight:600;">
      🎞️ {{ limitToastMsg }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '../stores/app.js'

const store = useAppStore()

const props = defineProps({ active: Boolean })
const emit = defineEmits(['gallery', 'selectFilm'])

const videoEl = ref(null)
const canvasEl = ref(null)
const flashOverlay = ref(null)

const currentFilter = ref('original')
const flashEnabled = ref(false)
const cameraStream = ref(null)
const currentFacingMode = ref('environment')
const cameraError = ref(false)
const lastPhoto = ref(null)
const isProcessing = ref(false)
const isCapturing = ref(false)
const counterFlash = ref(false)
const showLimitToast = ref(false)
const limitToastMsg = ref('')

const enhancement = ref({ brightness: 0, contrast: 0, saturation: 0, sharpen: 0 })

const filters = [
  { id: 'original', label: 'Original' },
  { id: 'film', label: 'Filme' },
  { id: 'warm', label: 'Quente' },
  { id: 'cold', label: 'Frio' },
  { id: 'bw', label: 'P&B' },
  { id: 'grain', label: 'Grão' },
]

const sliders = [
  { key: 'brightness', label: 'Brilho', min: -50, max: 50 },
  { key: 'contrast', label: 'Contraste', min: -50, max: 50 },
  { key: 'saturation', label: 'Saturação', min: -100, max: 100 },
  { key: 'sharpen', label: 'Nitidez', min: 0, max: 100 },
]

watch(() => props.active, async (val) => {
  if (val) {
    await initCamera()
    store.iniciarRealtimeFotos()
  } else {
    stopCamera()
    store.pararRealtimeFotos()
  }
})

async function initCamera() {
  if (cameraStream.value) return
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: currentFacingMode.value, width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false
    })
    cameraStream.value = stream
    if (videoEl.value) videoEl.value.srcObject = stream
    cameraError.value = false
  } catch {
    cameraError.value = true
  }
}

function stopCamera() {
  if (cameraStream.value) {
    cameraStream.value.getTracks().forEach(t => t.stop())
    cameraStream.value = null
  }
}

async function switchCamera() {
  currentFacingMode.value = currentFacingMode.value === 'environment' ? 'user' : 'environment'
  stopCamera()
  await initCamera()
}

function toggleFlash() {
  flashEnabled.value = !flashEnabled.value

  const stream = cameraStream.value
  if (!stream) return

  const track = stream.getVideoTracks()[0]
  if (!track) return

  const capabilities = track.getCapabilities ? track.getCapabilities() : {}
  if (!capabilities.torch) return

  track.applyConstraints({
    advanced: [{ torch: flashEnabled.value }]
  }).catch(() => {})
}

function setFilter(id) {
  currentFilter.value = id
}

function updateEnhancement(key, event) {
  enhancement.value[key] = parseInt(event.target.value)

  const video = videoEl.value
  if (!video) return
  const b = 100 + enhancement.value.brightness
  const c = 100 + enhancement.value.contrast
  const s = 100 + enhancement.value.saturation
  const artFilters = { bw: 'grayscale(100%) contrast(1.1)', film: 'sepia(30%) contrast(1.05)', warm: 'saturate(1.2) hue-rotate(-8deg)', cold: 'saturate(0.9) hue-rotate(15deg)', grain: 'contrast(1.08)', original: '' }
  video.style.filter = [artFilters[currentFilter.value], `brightness(${b}%) contrast(${c}%) saturate(${s}%)`].filter(Boolean).join(' ')
}

function showLimitMessage(msg) {
  limitToastMsg.value = msg
  showLimitToast.value = true
  setTimeout(() => { showLimitToast.value = false }, 3000)
}

async function takePhoto() {
  // 1. Verificar se tem evento ativo
  if (!store.convidadoInfo) {
    showLimitMessage('Entre em um evento primeiro!')
    return
  }

  // 2. Verificar se já está processando
  if (isProcessing.value) return

  // 3. Verificar limite via DB ANTES de capturar
  const verificacao = await store.verificarLimiteFoto()
  if (!verificacao.ok) {
    showLimitMessage(verificacao.erro || 'Seu rolo de filme acabou!')
    return
  }

  // 4. Verificar câmera
  const video = videoEl.value
  if (!video?.srcObject) {
    showLimitMessage('Câmera indisponível')
    return
  }

  isProcessing.value = true

  try {
    // 5. Flash visual + shutter capture animation
    isCapturing.value = true
    setTimeout(() => { isCapturing.value = false }, 500)

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

    // 6. Capturar frame
    const canvas = canvasEl.value
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720

    if (currentFacingMode.value === 'user') {
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
    }
    ctx.drawImage(video, 0, 0)
    applyCanvasFilter(ctx, canvas)

    // 7. Converter para dataUrl
    const dataUrl = canvas.toDataURL('image/jpeg', 0.78)

    // 8. Enviar para DB (upload + registro + incremento server-side)
    const resultado = await store.tirarFoto(dataUrl, currentFilter.value)

    if (resultado.ok) {
      lastPhoto.value = dataUrl
      showLimitMessage(`📸 Foto salva! ${resultado.restantes} restantes`)
      // Trigger counter flash
      counterFlash.value = true
      setTimeout(() => { counterFlash.value = false }, 600)
    } else {
      showLimitMessage(resultado.erro || 'Erro ao salvar foto')
    }
  } catch (err) {
    console.error('Erro ao tirar foto:', err)
    showLimitMessage('Erro ao processar foto')
  } finally {
    isProcessing.value = false
  }
}

function applyCanvasFilter(ctx, canvas) {
  const w = canvas.width, h = canvas.height
  const imgData = ctx.getImageData(0, 0, w, h)
  const d = imgData.data
  const bright = enhancement.value.brightness / 100
  const cont = (enhancement.value.contrast + 100) / 100
  const sat = (enhancement.value.saturation + 100) / 100

  for (let i = 0; i < d.length; i += 4) {
    let r = d[i], g = d[i + 1], b = d[i + 2]
    r += bright * 128; g += bright * 128; b += bright * 128
    r = ((r - 128) * cont) + 128; g = ((g - 128) * cont) + 128; b = ((b - 128) * cont) + 128
    const gray = 0.299 * r + 0.587 * g + 0.114 * b
    r = gray + (r - gray) * sat; g = gray + (g - gray) * sat; b = gray + (b - gray) * sat
    if (currentFilter.value === 'bw') { const l = 0.299 * r + 0.587 * g + 0.114 * b; r = g = b = l }
    else if (currentFilter.value === 'film') { r = r * 0.88 + 36; g = g * 0.82 + 18; b = b * 0.66 }
    else if (currentFilter.value === 'warm') { r = r * 1.18 + 8; g = g * 1.04; b = b * 0.82 }
    else if (currentFilter.value === 'cold') { r = r * 0.82; g = g * 1.02; b = b * 1.16 + 6 }
    d[i] = Math.max(0, Math.min(255, r)); d[i + 1] = Math.max(0, Math.min(255, g)); d[i + 2] = Math.max(0, Math.min(255, b))
  }
  ctx.putImageData(imgData, 0, 0)
  const grad = ctx.createRadialGradient(w / 2, h / 2, h * 0.38, w / 2, h / 2, h * 0.85)
  grad.addColorStop(0, 'rgba(0,0,0,0)'); grad.addColorStop(1, 'rgba(0,0,0,0.38)')
  ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h)
}

onUnmounted(() => stopCamera())
</script>
