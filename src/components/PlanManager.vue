<template>
  <div class="screen" :class="{ active: active }" style="padding-bottom:100px;padding-top:80px;min-height:100dvh;">
    <div class="p-5 pt-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <p class="text-xs" style="color:var(--accent3);letter-spacing:2.5px;font-weight:700;text-transform:uppercase;margin-bottom:4px;">Administrativo</p>
          <h2 class="serif text-2xl">Gerenciar Planos</h2>
        </div>
        <button class="btn-gold px-4 py-2 text-sm" @click="showEdit(null)">+ Novo Plano</button>
      </div>

      <div v-if="loading" class="text-center py-12" style="color:rgba(248,244,235,0.4);">
        <p style="font-size:36px;">⏳</p>
        <p class="text-sm mt-2">Carregando planos...</p>
      </div>

      <div v-else-if="plans.length === 0" class="text-center py-12" style="color:rgba(248,244,235,0.4);">
        <p style="font-size:36px;">📋</p>
        <p class="text-sm mt-2">Nenhum plano cadastrado</p>
      </div>

      <div v-else class="flex flex-col gap-3">
        <div v-for="plan in plans" :key="plan.id" class="p-4" style="background:linear-gradient(160deg,var(--charcoal2),var(--charcoal));border:1px solid var(--border);border-radius:16px;">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <span class="text-lg font-semibold" style="color:var(--accent3);">{{ plan.nome }}</span>
              <span v-if="!plan.ativo" class="tag-badge" style="background:rgba(255,77,61,0.16);color:var(--red);border-color:rgba(255,77,61,0.32);">Inativo</span>
            </div>
            <div class="flex gap-2">
              <button class="btn-app-outline text-xs py-1.5 px-3" @click="showEdit(plan)">✏️</button>
              <button class="btn-app-outline text-xs py-1.5 px-3" style="color:var(--red);border-color:rgba(255,77,61,0.32);" @click="removePlan(plan)">🗑️</button>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2 text-sm" style="color:rgba(248,244,235,0.62);">
            <div>💰 R$ {{ (plan.preco_centavos / 100).toFixed(2).replace('.', ',') }}</div>
            <div>👥 {{ plan.limite_convidados }} convidados</div>
            <div>📸 {{ plan.limite_fotos_por_pessoa }} fotos/pessoa</div>
            <div>💳 {{ plan.stripe_price_id || 'Sem Stripe' }}</div>
          </div>
        </div>
      </div>

      <!-- Edit Modal -->
      <div class="modal-backdrop" :class="{ open: editModal }">
        <div class="modal-sheet">
          <div class="flex items-center justify-between mb-5">
            <div>
              <p class="text-xs" style="color:var(--accent3);letter-spacing:2px;font-weight:700;text-transform:uppercase;margin-bottom:4px;">Formulário</p>
              <h3 class="serif text-xl">{{ editingPlan ? 'Editar' : 'Novo' }} Plano</h3>
            </div>
            <button @click="editModal = false" style="color:rgba(248,244,235,0.4);font-size:22px;background:none;border:none;cursor:pointer;">✕</button>
          </div>
          <div class="flex flex-col gap-3">
            <div><label class="text-xs mb-1 block" style="color:rgba(248,244,235,0.55);font-weight:600;letter-spacing:0.8px;">NOME *</label><input class="film-input" v-model="form.nome" placeholder="Ex: Básico"></div>
            <div class="grid grid-cols-3 gap-3">
              <div><label class="text-xs mb-1 block" style="color:rgba(248,244,235,0.55);font-weight:600;letter-spacing:0.8px;">PREÇO (centavos)</label><input class="film-input" type="number" v-model.number="form.preco_centavos" placeholder="4900"></div>
              <div><label class="text-xs mb-1 block" style="color:rgba(248,244,235,0.55);font-weight:600;letter-spacing:0.8px;">CONVIDADOS</label><input class="film-input" type="number" v-model.number="form.limite_convidados"></div>
              <div><label class="text-xs mb-1 block" style="color:rgba(248,244,235,0.55);font-weight:600;letter-spacing:0.8px;">FOTOS/PESSOA</label><input class="film-input" type="number" v-model.number="form.limite_fotos_por_pessoa"></div>
            </div>
            <div><label class="text-xs mb-1 block" style="color:rgba(248,244,235,0.55);font-weight:600;letter-spacing:0.8px;">STRIPE PRICE ID (opcional)</label><input class="film-input" v-model="form.stripe_price_id" placeholder="price_XXXXX"></div>
            <div class="flex items-center gap-4">
              <label class="flex items-center gap-2" style="cursor:pointer;">
                <input type="checkbox" v-model="form.ativo" style="accent-color:var(--accent);width:16px;height:16px;cursor:pointer;"> <span class="text-sm" style="color:rgba(248,244,235,0.7)">Ativo</span>
              </label>
            </div>
            <button class="btn-gold w-full mt-2" @click="savePlan" :disabled="saving">
              {{ saving ? 'Salvando...' : 'Salvar plano' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { fetchPlans, upsertPlan, deletePlan } from '../composables/useInsForge.js'

const props = defineProps({ active: Boolean })
const emit = defineEmits(['toast'])

const loading = ref(true)
const saving = ref(false)
const plans = ref([])
const editModal = ref(false)
const editingPlan = ref(null)

const form = reactive({
  nome: '',
  preco_centavos: 0,
  limite_convidados: 0,
  limite_fotos_por_pessoa: 0,
  stripe_price_id: '',
  ativo: true,
})

watch(() => props.active, (val) => {
  if (val) loadPlans()
})

onMounted(() => { if (props.active) loadPlans() })

async function loadPlans() {
  loading.value = true
  plans.value = await fetchPlans()
  loading.value = false
}

function showEdit(plan) {
  editingPlan.value = plan
  if (plan) {
    form.nome = plan.nome
    form.preco_centavos = plan.preco_centavos
    form.limite_convidados = plan.limite_convidados
    form.limite_fotos_por_pessoa = plan.limite_fotos_por_pessoa
    form.stripe_price_id = plan.stripe_price_id || ''
    form.ativo = plan.ativo !== false
  } else {
    form.nome = ''
    form.preco_centavos = 4900
    form.limite_convidados = 10
    form.limite_fotos_por_pessoa = 24
    form.stripe_price_id = ''
    form.ativo = true
  }
  editModal.value = true
}

async function savePlan() {
  if (!form.nome) {
    emit('toast', 'Nome é obrigatório!')
    return
  }
  saving.value = true
  const data = {
    nome: form.nome,
    preco_centavos: form.preco_centavos,
    limite_convidados: form.limite_convidados,
    limite_fotos_por_pessoa: form.limite_fotos_por_pessoa,
    stripe_price_id: form.stripe_price_id || null,
    ativo: form.ativo,
  }
  const result = await upsertPlan(data)
  saving.value = false
  if (result) {
    editModal.value = false
    emit('toast', editingPlan.value ? 'Plano atualizado!' : 'Plano criado!')
    await loadPlans()
  } else {
    emit('toast', 'Erro ao salvar plano')
  }
}

async function removePlan(plan) {
  if (!confirm(`Excluir plano "${plan.nome}"?`)) return
  const ok = await deletePlan(plan.id)
  if (ok) {
    emit('toast', 'Plano excluído')
    await loadPlans()
  }
}
</script>
