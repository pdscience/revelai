<template>
  <div class="screen" :class="{ active: active }" style="padding-bottom:100px;padding-top:80px;min-height:100dvh;">
    <div class="p-5 pt-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <p class="text-xs" style="color:var(--accent3);letter-spacing:2.5px;font-weight:700;text-transform:uppercase;margin-bottom:4px;">Galeria</p>
          <h2 class="serif text-2xl">{{ convidadoInfo?.nomeEvento || 'Galeria' }}</h2>
          <div class="flex items-center gap-2 mt-1">
            <span class="status-dot" :class="convidadoInfo && !isExpired ? 'status-live' : 'status-ended'"></span>
            <span class="text-xs" style="color:rgba(248,244,235,0.5)">{{ convidadoInfo ? (isExpired ? 'Encerrado' : 'Ao vivo') : 'Sem evento' }}</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button class="btn-app-outline text-xs py-2 px-3" @click="$emit('share')">🔗 QR</button>
          <button class="btn-app-outline text-xs py-2 px-3" @click="downloadAll" :disabled="isDownloading">
            <span v-if="isDownloading" class="spinner-glow sm" style="margin-right:4px;"></span>
            {{ isDownloading ? `${downloadProgress}%` : '⬇️' }}
          </button>
          <button v-if="store.currentPhotos.length > 0" class="btn-app-outline text-xs py-2 px-3" style="color:#ff4d3d;border-color:rgba(255,77,61,0.3);" @click="deleteAllPhotos">🗑️</button>
        </div>
      </div>

      <div v-if="convidadoInfo && !isRevealed" class="mb-4 p-4" style="background:linear-gradient(135deg,rgba(255,77,61,0.10),rgba(255,77,61,0.04));border:1px solid rgba(255,77,61,0.28);border-radius:14px;">
        <div class="flex items-center gap-3">
          <span class="text-2xl">🔒</span>
          <div>
            <p class="text-sm font-medium">Fotos bloqueadas até a revelação</p>
            <p class="countdown-badge mt-1">{{ countdownText }}</p>
          </div>
        </div>
      </div>

      <div v-if="convidadoInfo" class="flex items-center gap-3 mb-5 overflow-x-auto">
        <span class="tag-badge">{{ store.currentPhotos.length }} fotos</span>
        <span class="tag-badge">{{ convidadoInfo.totalConectados || 0 }} convidados</span>
        <span class="tag-badge">{{ store.fotosRestantes }} restantes</span>
      </div>

      <div v-if="!convidadoInfo" class="text-center py-12">
        <p style="font-size:40px;">📸</p>
        <p class="text-sm mt-2" style="color:rgba(248,244,235,0.4)">Selecione um evento</p>
      </div>

      <div v-else-if="store.currentPhotos.length === 0" class="text-center py-12" style="grid-column:1/-1;">
        <p style="font-size:40px;">📸</p>
        <p class="text-sm mt-2" style="color:rgba(248,244,235,0.4)">Nenhuma foto ainda</p>
      </div>

      <div v-else class="photo-grid">
        <div v-for="(photo, idx) in store.currentPhotos" :key="photo.id" @click="openLightbox(idx)" class="photo-fade" :style="{ animationDelay: (idx * 0.03) + 's' }" style="position:relative;aspect-ratio:1;overflow:hidden;border-radius:10px;background:var(--charcoal2);cursor:pointer;border:1px solid var(--border-soft);">
          <img :src="getPhotoSrc(photo)" style="width:100%;height:100%;object-fit:cover;" :class="{ 'photo-locked': !isRevealed }" loading="lazy">
          <div v-if="!isRevealed" class="reveal-overlay" style="border-radius:10px;">
            <span style="font-size:24px;">🔒</span>
            <p class="text-xs mt-1" style="color:rgba(248,244,235,0.6)">Aguardando</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Lightbox -->
    <div class="lightbox" :class="{ open: lightboxOpen }">
      <div class="flex items-center justify-between w-full px-5 mb-4">
        <button @click="lightboxNav(-1)" style="color:var(--accent3);font-size:36px;background:none;border:none;cursor:pointer;text-shadow:var(--glow-soft);">‹</button>
        <p class="text-sm mono" style="color:rgba(248,244,235,0.6)">{{ lightboxIdx + 1 }}/{{ store.currentPhotos.length || 0 }}</p>
        <button @click="lightboxNav(1)" style="color:var(--accent3);font-size:36px;background:none;border:none;cursor:pointer;text-shadow:var(--glow-soft);">›</button>
      </div>
      <img v-if="lightboxPhoto" :src="getPhotoSrc(lightboxPhoto)" alt="Foto" style="max-width:95vw;max-height:80dvh;object-fit:contain;border-radius:12px;">
      <div class="flex items-center gap-4 mt-5">
        <button class="btn-app-outline text-sm py-2 px-4" @click="downloadPhoto">⬇️ Baixar</button>
        <button class="btn-app-outline text-sm py-2 px-4" @click="deleteLightboxPhoto">🗑️ Excluir</button>
        <button class="btn-app-outline text-sm py-2 px-4" @click="closeLightbox">✕</button>
      </div>
      <p class="text-xs mt-3" style="color:rgba(248,244,235,0.4)">{{ lightboxPhoto?.usuario_nome || 'Você' }} · {{ lightboxPhoto?.filtro || 'original' }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '../stores/app.js'
import { fetchAuthenticatedImage, revokeCachedBlobUrls } from '../composables/useInsForge.js'
import JSZip from 'jszip'

const store = useAppStore()
const props = defineProps({ active: Boolean })
const emit = defineEmits(['share'])

const lightboxOpen = ref(false)
const lightboxIdx = ref(0)
const countdownText = ref('')
const isDownloading = ref(false)
const downloadProgress = ref(0)
let timer = null

const photoSrcMap = ref({})

const convidadoInfo = computed(() => store.convidadoInfo)

async function resolvePhotoUrls(photos) {
  const updates = {}
  for (const photo of photos) {
    const src = photo.url || photo.dataUrl
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

const isExpired = computed(() => {
  if (!convidadoInfo.value) return false
  if (!convidadoInfo.value.dataFim) return false
  return new Date() > new Date(convidadoInfo.value.dataFim)
})

const isRevealed = computed(() => {
  const info = convidadoInfo.value
  if (!info) return true
  if (info.revelacaoModo !== 'delayed' || !info.revelacaoTime) return true
  return new Date() >= new Date(info.revelacaoTime)
})

const lightboxPhoto = computed(() => {
  return store.currentPhotos[lightboxIdx.value] || null
})

watch(() => store.currentPhotos.length, async () => {
  await resolvePhotoUrls(store.currentPhotos)
})

watch(() => props.active, async (val) => {
  if (val) {
    if (convidadoInfo.value) {
      await store.carregarFotos()
      await resolvePhotoUrls(store.currentPhotos)
    }
    if (convidadoInfo.value?.revelacaoModo === 'delayed' && convidadoInfo.value?.revelacaoTime) {
      startTimer()
    }
  } else if (timer) {
    clearInterval(timer)
  }
})

onMounted(async () => {
  if (props.active && convidadoInfo.value) {
    await store.carregarFotos()
    await resolvePhotoUrls(store.currentPhotos)
    if (convidadoInfo.value?.revelacaoModo === 'delayed' && convidadoInfo.value?.revelacaoTime) {
      startTimer()
    }
  }
})

function startTimer() {
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    const info = convidadoInfo.value
    if (!info?.revelacaoTime) { clearInterval(timer); return }
    const diff = new Date(info.revelacaoTime) - new Date()
    if (diff <= 0) { clearInterval(timer); countdownText.value = 'Revelado!'; return }
    const h = Math.floor(diff / 3600000).toString().padStart(2, '0')
    const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0')
    const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0')
    countdownText.value = `${h}:${m}:${s}`
  }, 1000)
}

function openLightbox(idx) {
  if (!isRevealed.value) {
    alert('🔒 Fotos bloqueadas até a revelação!')
    return
  }
  lightboxIdx.value = idx
  lightboxOpen.value = true
}

function closeLightbox() { lightboxOpen.value = false }

function lightboxNav(dir) {
  const len = store.currentPhotos.length
  if (len === 0) return
  lightboxIdx.value = (lightboxIdx.value + dir + len) % len
}

function downloadPhoto() {
  const photo = lightboxPhoto.value
  if (!photo) return
  const url = getPhotoSrc(photo)
  if (!url) return
  const a = document.createElement('a')
  a.href = url
  a.download = `revelai_${Date.now()}.jpg`
  a.click()
}

function deleteLightboxPhoto() {
  if (!confirm('Excluir esta foto?')) return
  store.deletarFoto(lightboxIdx.value)
  if (store.currentPhotos.length === 0) closeLightbox()
  else lightboxIdx.value = Math.min(lightboxIdx.value, store.currentPhotos.length - 1)
}

async function deleteAllPhotos() {
  if (!confirm('Excluir TODAS as fotos deste evento? Esta ação não pode ser desfeita.')) return
  if (!confirm('Tem certeza absoluta? Todas as fotos serão apagadas permanentemente.')) return

  const result = await store.deletarTodasFotosEvento()
  if (result?.ok) {
    closeLightbox()
    showToast(`🗑️ ${result.fotos_deletadas || 0} fotos excluídas!`)
  } else {
    showToast('Erro ao excluir fotos')
  }
}

async function downloadAll() {
  if (store.currentPhotos.length === 0) {
    showToast('Nenhuma foto')
    return
  }

  if (isDownloading.value) return
  isDownloading.value = true
  downloadProgress.value = 0

  try {
    const zip = new JSZip()
    const eventoName = (convidadoInfo.value?.nomeEvento || 'evento').replace(/\s/g, '_')
    const folderName = `revelai_${eventoName}`

    let completed = 0
    const total = store.currentPhotos.length

    for (const photo of store.currentPhotos) {
      const url = getPhotoSrc(photo)
      if (!url) {
        completed++
        downloadProgress.value = Math.round((completed / total) * 100)
        continue
      }

      try {
        const response = await fetch(url)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const blob = await response.blob()
        const fileName = `revelai_${eventoName}_${String(completed + 1).padStart(3, '0')}.jpg`
        zip.file(fileName, blob)
      } catch (err) {
        console.warn(`Falha ao baixar foto ${completed + 1}:`, err)
      }

      completed++
      downloadProgress.value = Math.round((completed / total) * 100)
    }

    // Gerar e baixar o ZIP
    const zipBlob = await zip.generateAsync(
      { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
      (metadata) => {
        // Atualizar progresso do ZIP
        if (metadata.percent) {
          downloadProgress.value = Math.round(metadata.percent)
        }
      }
    )

    const zipUrl = URL.createObjectURL(zipBlob)
    const a = document.createElement('a')
    a.href = zipUrl
    a.download = `${folderName}.zip`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(zipUrl)

    showToast(`📦 ${total} fotos baixadas!`)
  } catch (err) {
    console.error('Erro ao gerar ZIP:', err)
    showToast('Erro ao baixar fotos')
  } finally {
    isDownloading.value = false
    downloadProgress.value = 0
  }
}

function showToast(msg) {
  const toast = document.querySelector('.app-toast')
  if (toast) {
    toast.textContent = msg
    toast.classList.add('show')
    setTimeout(() => toast.classList.remove('show'), 3000)
  }
}

onUnmounted(() => { if (timer) clearInterval(timer); revokeCachedBlobUrls() })
</script>
