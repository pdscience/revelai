<template>
  <div class="screen" :class="{ active: active }" style="padding-bottom:100px;padding-top:80px;min-height:100dvh;">
    <div class="p-5 pt-6">
      <p class="text-xs mb-2" style="color:var(--accent3);letter-spacing:2.5px;font-weight:700;text-transform:uppercase;">Conta</p>
      <h2 class="serif text-2xl mb-6">Perfil</h2>
      <div class="flex items-center gap-4 mb-8 p-4" style="background:linear-gradient(160deg,var(--charcoal2),var(--charcoal));border:1px solid var(--border);border-radius:18px;">
        <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,var(--accent3),var(--accent) 45%,var(--accent2));display:flex;align-items:center;justify-content:center;font-size:26px;box-shadow:0 0 20px rgba(255,122,46,0.4);">👤</div>
        <div>
          <p class="font-semibold text-lg" style="color:var(--cream);">{{ store.profile.name }}</p>
          <div class="flex items-center gap-2 mt-1">
            <span class="access-badge">{{ store.plan?.name || '—' }}</span>
            <span class="text-sm" style="color:rgba(248,244,235,0.5)">Anfitrião</span>
          </div>
        </div>
      </div>

      <div class="mb-6">
        <label class="text-xs mb-2 block" style="color:rgba(248,244,235,0.55);letter-spacing:0.8px;font-weight:600;">SEU NOME</label>
        <input class="film-input" type="text" v-model="localName" placeholder="Como quer ser chamado?">
      </div>
      <button class="btn-gold w-full" @click="saveProfile">Salvar perfil</button>

      <div class="mt-6 p-4" style="background:linear-gradient(160deg,var(--charcoal2),var(--charcoal));border:1px solid var(--border);border-radius:18px;">
        <p class="text-xs mb-3" style="color:var(--accent);letter-spacing:1.2px;font-weight:700;">MEU PLANO</p>
        <div class="grid grid-cols-2 gap-3">
          <div class="p-3 text-center" style="background:rgba(255,255,255,0.03);border:1px solid var(--border-soft);border-radius:12px;">
            <p class="text-xl font-bold" style="color:var(--accent)">{{ store.plan?.guests || store.plan?.limite_convidados || '—' }}</p>
            <p class="text-xs mt-1" style="color:rgba(248,244,235,0.4)">convidados</p>
          </div>
          <div class="p-3 text-center" style="background:rgba(255,255,255,0.03);border:1px solid var(--border-soft);border-radius:12px;">
            <p class="text-xl font-bold" style="color:var(--accent)">{{ store.plan?.photos || store.plan?.limite_fotos_por_pessoa || '—' }}</p>
            <p class="text-xs mt-1" style="color:rgba(248,244,235,0.4)">fotos/pessoa</p>
          </div>
          <div class="p-3 text-center" style="background:rgba(255,255,255,0.03);border:1px solid var(--border-soft);border-radius:12px;">
            <p class="text-xl font-bold" style="color:var(--accent)">{{ store.eventos.length }}</p>
            <p class="text-xs mt-1" style="color:rgba(248,244,235,0.4)">eventos criados</p>
          </div>
          <div class="p-3 text-center" style="background:rgba(255,255,255,0.03);border:1px solid var(--border-soft);border-radius:12px;">
            <p class="text-xl font-bold" style="color:var(--accent)">{{ totalFotos }}</p>
            <p class="text-xs mt-1" style="color:rgba(248,244,235,0.4)">fotos tiradas</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAppStore } from '../stores/app.js'

const store = useAppStore()
const props = defineProps({ active: Boolean })
const localName = ref(store.profile.name)

const totalFotos = computed(() => {
  return store.eventos.reduce((sum, e) => sum + (e.total_fotos || 0), 0)
})

watch(() => props.active, (val) => {
  if (val) localName.value = store.profile.name
})

function saveProfile() {
  store.updateProfile(localName.value)
  const toast = document.querySelector('.app-toast')
  if (toast) { toast.textContent = 'Perfil salvo!'; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2500) }
}
</script>
