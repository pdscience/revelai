<template>
  <div class="p-5 pt-6 screen" :class="{ active: active }" style="padding-bottom:100px;padding-top:70px;min-height:100dvh;">
    <div class="flex items-center justify-between mb-8">
      <div>
        <p class="text-xs" style="color:var(--accent3);letter-spacing:2.5px;font-weight:700;text-transform:uppercase;margin-bottom:4px;">Bem-vindo</p>
        <h1 class="serif text-3xl font-semibold" style="background:linear-gradient(135deg,var(--accent3),var(--accent) 50%,var(--accent2));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;letter-spacing:-0.02em;">Meus Eventos</h1>
        <p class="text-xs mt-1" style="color:rgba(248,244,235,0.4)">câmera descartável</p>
      </div>
      <button class="btn-gold px-5 py-2.5 text-sm" @click="$emit('create')">+ Criar Evento</button>
    </div>

    <div class="grid grid-cols-3 gap-3 mb-8">
      <div class="text-center" style="background:linear-gradient(160deg,var(--charcoal2),var(--charcoal));border:1px solid var(--border);border-radius:14px;padding:16px 8px;position:relative;overflow:hidden;">
        <div style="position:absolute;top:0;left:20%;right:20%;height:1px;background:linear-gradient(90deg,transparent,var(--accent),transparent);opacity:0.4;"></div>
        <p class="text-2xl font-bold" style="color:var(--accent);text-shadow:0 0 20px rgba(233,162,75,0.4);">{{ store.eventos.length }}</p>
        <p class="text-xs mt-1" style="color:rgba(248,244,235,0.4);letter-spacing:0.3px;">Eventos</p>
      </div>
      <div class="text-center" style="background:linear-gradient(160deg,var(--charcoal2),var(--charcoal));border:1px solid var(--border);border-radius:14px;padding:16px 8px;position:relative;overflow:hidden;">
        <div style="position:absolute;top:0;left:20%;right:20%;height:1px;background:linear-gradient(90deg,transparent,var(--accent),transparent);opacity:0.4;"></div>
        <p class="text-2xl font-bold" style="color:var(--accent);text-shadow:0 0 20px rgba(233,162,75,0.4);">{{ totalFotos }}</p>
        <p class="text-xs mt-1" style="color:rgba(248,244,235,0.4);letter-spacing:0.3px;">Fotos</p>
      </div>
      <div class="text-center" style="background:linear-gradient(160deg,var(--charcoal2),var(--charcoal));border:1px solid var(--border);border-radius:14px;padding:16px 8px;position:relative;overflow:hidden;">
        <div style="position:absolute;top:0;left:20%;right:20%;height:1px;background:linear-gradient(90deg,transparent,var(--accent),transparent);opacity:0.4;"></div>
        <p class="text-2xl font-bold" style="color:var(--accent);text-shadow:0 0 20px rgba(233,162,75,0.4);">{{ totalConvidados }}</p>
        <p class="text-xs mt-1" style="color:rgba(248,244,235,0.4);letter-spacing:0.3px;">Convidados</p>
      </div>
    </div>

    <div class="flex items-center justify-between mb-4">
      <h2 class="serif text-xl">Eventos</h2>
      <span class="text-xs" style="color:rgba(248,244,235,0.4)">ordenado por data</span>
    </div>

    <div v-if="loading" class="text-center py-16">
      <div class="spinner-glow mx-auto"></div>
      <p class="text-sm mt-4" style="color:rgba(248,244,235,0.4)">Carregando eventos...</p>
    </div>

    <div v-else-if="store.eventos.length === 0" class="text-center py-16">
      <div class="text-6xl mb-4" style="filter:drop-shadow(0 0 20px rgba(255,122,46,0.4));">🎞️</div>
      <p class="serif text-xl mb-2" style="color:rgba(248,244,235,0.55)">Sem eventos ainda</p>
      <p class="text-sm mb-6" style="color:rgba(248,244,235,0.32)">Crie seu primeiro evento e convide amigos para capturar momentos juntos.</p>
      <button class="btn-gold px-8 py-3" @click="$emit('create')">Criar meu primeiro evento</button>
    </div>

    <div v-else class="flex flex-col gap-4">
      <div v-for="evento in store.eventos" :key="evento.id" class="film-card" :class="{ 'border-amber-500/30': store.currentEventoId === evento.id }" @click="$emit('detail', evento.id)">
        <div class="flex gap-3 p-4">
          <div style="width:72px;height:72px;border-radius:14px;overflow:hidden;flex-shrink:0;background:linear-gradient(135deg,var(--charcoal3),var(--muted));display:flex;align-items:center;justify-content:center;border:1px solid var(--border);">
            <span style="font-size:30px;filter:drop-shadow(0 0 8px rgba(255,122,46,0.2));">📷</span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <p class="font-medium truncate" style="color:var(--cream);">{{ evento.nome }}</p>
              <span class="tag-badge flex-shrink-0">📅</span>
            </div>
            <div class="flex items-center gap-2 mt-1">
              <span class="status-dot" :class="isExpired(evento) ? 'status-ended' : 'status-live'"></span>
              <span class="text-xs" style="color:rgba(248,244,235,0.5)">{{ isExpired(evento) ? 'Encerrado' : 'Ao vivo' }} · {{ timeLeft(evento) }}</span>
            </div>
            <div class="flex items-center gap-3 mt-2">
              <span class="text-xs" style="color:rgba(248,244,235,0.4)">👥 {{ evento.total_convidados_conectados || 0 }}/{{ evento.limite_convidados }}</span>
              <span class="text-xs" style="color:rgba(248,244,235,0.4)">📸 {{ evento.limite_fotos_por_pessoa }} fotos/pessoa</span>
            </div>
          </div>
        </div>
        <div v-if="store.currentEventoId === evento.id" style="height:3px;background:linear-gradient(90deg,var(--accent),var(--accent2),transparent);box-shadow:0 0 12px rgba(255,122,46,0.4);"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '../stores/app.js'

const store = useAppStore()
const props = defineProps({ active: Boolean })
const loading = ref(true)

const totalFotos = computed(() => {
  return store.eventos.reduce((sum, e) => sum + (e.total_fotos || 0), 0)
})

const totalConvidados = computed(() => {
  return store.eventos.reduce((sum, e) => sum + (e.total_convidados_conectados || 0), 0)
})

function isExpired(evento) {
  if (!evento.data_fim) return false
  return new Date() > new Date(evento.data_fim)
}

function timeLeft(evento) {
  if (!evento.data_fim) return 'Sem prazo'
  const ms = new Date(evento.data_fim) - new Date()
  if (ms <= 0) return 'Encerrado'
  const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000)
  if (h > 24) return `${Math.floor(h / 24)}d ${h % 24}h`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

onMounted(async () => {
  try {
    await store.carregarEventos()
  } catch (e) {
    console.error('Erro ao carregar eventos:', e)
  } finally {
    loading.value = false
  }
})

defineEmits(['create', 'detail'])
</script>
