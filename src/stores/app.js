import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getDeviceId,
  criarEvento,
  buscarEventoPorCodigo,
  buscarEventoPorShare,
  listarEventosAnfitriao,
  registrarEntrada,
  podeTirarFoto,
  registrarFoto,
  buscarFotosEvento,
  uploadPhotoBlob,
  deletarFotoRPC,
  deletarTodasFotos as deletarTodasFotosRPC,
  criarPagamento,
  subscribeToPhotos,
  unsubscribeFromPhotos
} from '../composables/useInsForge.js'

export function generateSecureCode(prefix, byteLength) {
  const arr = new Uint8Array(byteLength)
  crypto.getRandomValues(arr)
  return prefix + Array.from(arr)
    .map(b => b.toString(36).padStart(2, '0'))
    .join('')
    .slice(0, byteLength * 2)
}

export function sanitizeInput(str) {
  if (typeof str !== 'string') return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export const useAppStore = defineStore('app', () => {
  // ── State ──
  const eventos = ref([])
  const currentEventoId = ref(null)
  const profile = ref({ name: 'Anfitrião', role: 'Anfitrião' })
  const plan = ref(null)
  const accessCode = ref(null)
  const email = ref('')
  const orderCode = ref('')
  const deviceId = getDeviceId()

  // Estado do convidado (preenchido ao entrar no evento)
  const convidadoInfo = ref(null) // { ok, limite_fotos, fotos_tiradas, ja_cadastrado }

  // Fotos do evento atual (carregadas do DB)
  const currentPhotos = ref([])

  // ── Persistence ──
  function saveState() {
    const data = {
      profile: profile.value,
      email: email.value,
      orderCode: orderCode.value,
      currentEventoId: currentEventoId.value,
    }
    localStorage.setItem('revelai_state', JSON.stringify(data))
  }

  function loadState() {
    try {
      const s = localStorage.getItem('revelai_state')
      if (s) {
        const parsed = JSON.parse(s)
        profile.value = parsed.profile || { name: 'Anfitrião', role: 'Anfitrião' }
        email.value = parsed.email || ''
        orderCode.value = parsed.orderCode || ''
        currentEventoId.value = parsed.currentEventoId || null
      }
      const sessionAccess = sessionStorage.getItem('revelai_access')
      if (sessionAccess) {
        accessCode.value = sessionAccess
      }
    } catch {}
  }

  // ── Access ──
  function setAccess(code) {
    accessCode.value = code
    if (code) {
      sessionStorage.setItem('revelai_access', code)
    } else {
      sessionStorage.removeItem('revelai_access')
    }
    saveState()
  }

  function setEmailAddr(addr) {
    email.value = addr
    saveState()
  }

  function setOrderCode(code) {
    orderCode.value = code
    saveState()
  }

  function setPlan(planData) {
    plan.value = planData
  }

  // ── Anfitrião: Criar evento ──
  async function criarNovoEvento({ planoId, nomeEvento, dataInicio, dataFim, revelacaoModo, revelacaoTime }) {
    const now = new Date().toISOString()
    const codigoAcesso = generateSecureCode('', 4).toUpperCase()
    const shareCode = generateSecureCode('', 4).toUpperCase()

    const evento = await criarEvento({
      planoId,
      nomeEvento: sanitizeInput(nomeEvento),
      codigoAcesso,
      shareCode,
      dataInicio: dataInicio || now,
      dataFim: dataFim || new Date(Date.now() + 7 * 86400000).toISOString(),
      revelacaoModo,
      revelacaoTime
    })

    if (evento) {
      eventos.value.unshift(evento)
      currentEventoId.value = evento.id
      plan.value = evento.planos || null
      accessCode.value = codigoAcesso
      sessionStorage.setItem('revelai_access', codigoAcesso)
      saveState()
    }

    return evento
  }

  // ── Anfitrião: Listar eventos ──
  async function carregarEventos() {
    const lista = await listarEventosAnfitriao()
    eventos.value = lista
    if (!plan.value && lista.length > 0 && lista[0].planos) {
      plan.value = lista[0].planos
    }
    return lista
  }

  // ── Anfitrião: Entrar no próprio evento para usar a câmera ──
  async function entrarComoAnfitriao(evento) {
    if (!evento) return { ok: false, erro: 'Evento inválido' }

    const limiteFotos = evento.planos?.limite_fotos_por_pessoa || evento.limite_fotos_por_pessoa || 30

    // Registrar o anfitrião como convidado no banco (para poder tirar fotos)
    const entrada = await registrarEntrada(evento.id, deviceId, 'Anfitrião')

    const fotosTiradas = entrada?.ok ? (entrada.fotos_tiradas || 0) : 0

    convidadoInfo.value = {
      eventoId: evento.id,
      nomeEvento: evento.nome_evento,
      status: evento.status,
      dataInicio: evento.data_inicio,
      dataFim: evento.data_fim,
      revelacaoModo: evento.revelacao_modo,
      revelacaoTime: evento.revelacao_time,
      shareCode: evento.share_code,
      codigoAcesso: evento.codigo_acesso,
      limiteConvidados: evento.limite_convidados || evento.planos?.limite_convidados || 0,
      limiteFotos,
      totalConectados: evento.total_convidados_conectados || 0,
      fotosTiradas,
      jaCadastrado: entrada?.ja_cadastrado || false
    }

    currentEventoId.value = evento.id
    currentPhotos.value = await buscarFotosEvento(evento.id)
    saveState()

    return { ok: true }
  }

  // ── Convidado: Entrar no evento ──
  async function entrarNoEvento(shareCode, nomeConvidado = 'Convidado') {
    const resultado = await buscarEventoPorShare(shareCode)
    if (!resultado || !resultado.ok) {
      return { ok: false, erro: resultado?.erro || 'Evento não encontrado' }
    }

    // Registrar entrada (server-side valida limite de convidados)
    const entrada = await registrarEntrada(
      resultado.evento_id,
      deviceId,
      nomeConvidado
    )

    if (!entrada.ok) {
      return { ok: false, erro: entrada.erro }
    }

    // Atualizar estado local
    convidadoInfo.value = {
      eventoId: resultado.evento_id,
      nomeEvento: resultado.nome_evento,
      status: resultado.status,
      dataInicio: resultado.data_inicio,
      dataFim: resultado.data_fim,
      revelacaoModo: resultado.revelacao_modo,
      revelacaoTime: resultado.revelacao_time,
      shareCode: resultado.share_code,
      codigoAcesso: resultado.codigo_acesso,
      limiteConvidados: resultado.limite_convidados,
      limiteFotos: resultado.limite_fotos_por_pessoa,
      totalConectados: resultado.total_convidados,
      fotosTiradas: entrada.fotos_tiradas || 0,
      jaCadastrado: entrada.ja_cadastrado || false
    }

    // Carregar fotos existentes
    currentPhotos.value = await buscarFotosEvento(resultado.evento_id)

    return {
      ok: true,
      eventoId: resultado.evento_id,
      limiteFotos: resultado.limite_fotos_por_pessoa,
      fotosTiradas: entrada.fotos_tiradas || 0,
      restantes: resultado.limite_fotos_por_pessoa - (entrada.fotos_tiradas || 0)
    }
  }

  // ── Convidado: Verificar se pode tirar foto ──
  async function verificarLimiteFoto() {
    if (!convidadoInfo.value) return { ok: false, erro: 'Não há evento ativo' }

    const resultado = await podeTirarFoto(convidadoInfo.value.eventoId, deviceId)

    if (resultado.ok) {
      // Atualizar contadores locais
      convidadoInfo.value.fotosTiradas = resultado.tiradas
    }

    return resultado
  }

  // ── Convidado/Anfitrião: Tirar foto ──
  async function tirarFoto(photoDataUrl, filtro = 'original') {
    if (!convidadoInfo.value) return { ok: false, erro: 'Não há evento ativo' }

    // 1. Verificar limite ANTES de processar
    const podeFoto = await verificarLimiteFoto()
    if (!podeFoto.ok) {
      return { ok: false, erro: 'Seu rolo de filme acabou!', limite: podeFoto.limite, tiradas: podeFoto.tiradas }
    }

    // 2. Converter dataUrl para blob e upload
    const blob = await fetch(photoDataUrl).then(r => r.blob())
    const uploadResult = await uploadPhotoBlob(blob, convidadoInfo.value.eventoId, deviceId)

    // 3. Registrar foto no banco (server-side incrementa contador)
    const resultado = await registrarFoto(
      convidadoInfo.value.eventoId,
      deviceId,
      {
        storageKey: uploadResult?.key || null,
        url: uploadResult?.url || null,
        filtro,
        largura: 0,
        altura: 0,
        tamanhoBytes: blob.size
      }
    )

    if (!resultado.ok) {
      return { ok: false, erro: resultado.erro || 'Erro ao registrar foto' }
    }

    // 4. Atualizar estado local
    convidadoInfo.value.fotosTiradas = resultado.tiradas

    // 5. Adicionar foto à lista local
    const novaFoto = {
      id: resultado.foto_id,
      dataUrl: photoDataUrl,
      url: uploadResult?.url || null,
      storage_key: uploadResult?.key || null,
      filtro,
      usuario_nome: profile.value.name,
      criado_em: new Date().toISOString()
    }
    currentPhotos.value.unshift(novaFoto)

    return {
      ok: true,
      fotoId: resultado.foto_id,
      limite: resultado.limite,
      tiradas: resultado.tiradas,
      restantes: resultado.restantes
    }
  }

  // ── Buscar fotos do evento ──
  async function carregarFotos() {
    if (!convidadoInfo.value) return []
    const fotos = await buscarFotosEvento(convidadoInfo.value.eventoId)
    currentPhotos.value = fotos
    return fotos
  }

  // ── Realtime: escutar fotos em tempo real ──
  function iniciarRealtimeFotos() {
    if (!convidadoInfo.value) return

    subscribeToPhotos(convidadoInfo.value.eventoId, (novaFoto) => {
      // Evitar duplicatas
      if (!currentPhotos.value.find(f => f.id === novaFoto.id)) {
        currentPhotos.value.unshift(novaFoto)
      }
    })
  }

  function pararRealtimeFotos() {
    unsubscribeFromPhotos()
  }

  // ── Deletar foto (via RPC server-side) ──
  async function deletarFoto(photoIndex) {
    const foto = currentPhotos.value[photoIndex]
    if (!foto) return

    const result = await deletarFotoRPC(foto.id)
    if (result?.ok) {
      currentPhotos.value.splice(photoIndex, 1)
      if (convidadoInfo.value && convidadoInfo.value.fotosTiradas > 0) {
        convidadoInfo.value.fotosTiradas--
      }
    }
  }

  // ── Deletar todas as fotos do evento ──
  async function deletarTodasFotosEvento() {
    if (!convidadoInfo.value) return { ok: false, erro: 'Não há evento ativo' }

    const result = await deletarTodasFotosRPC(convidadoInfo.value.eventoId)
    if (result?.ok) {
      currentPhotos.value = []
      if (convidadoInfo.value) {
        convidadoInfo.value.fotosTiradas = 0
      }
    }
    return result
  }

  // ── Profile ──
  function updateProfile(name) {
    profile.value.name = name || 'Anfitrião'
    saveState()
  }

  // ── Reset ──
  function reset() {
    eventos.value = []
    currentEventoId.value = null
    profile.value = { name: 'Anfitrião', role: 'Anfitrião' }
    plan.value = null
    accessCode.value = null
    email.value = ''
    orderCode.value = ''
    convidadoInfo.value = null
    currentPhotos.value = []
    localStorage.removeItem('revelai_state')
    sessionStorage.removeItem('revelai_access')
  }

  // ── Computed ──
  const isAuthenticated = computed(() => !!accessCode.value)
  const isGuest = computed(() => !!convidadoInfo.value)
  const fotosRestantes = computed(() => {
    if (!convidadoInfo.value) return 0
    return convidadoInfo.value.limiteFotos - convidadoInfo.value.fotosTiradas
  })
  const podeTirarMaisFotos = computed(() => fotosRestantes.value > 0)

  loadState()

  return {
    eventos, currentEventoId, profile, plan, accessCode, email, orderCode,
    deviceId, convidadoInfo, currentPhotos,
    isAuthenticated, isGuest, fotosRestantes, podeTirarMaisFotos,
    saveState, loadState, setAccess, setEmailAddr, setOrderCode, setPlan,
    criarNovoEvento, carregarEventos, entrarComoAnfitriao,
    entrarNoEvento, verificarLimiteFoto, tirarFoto, carregarFotos, deletarFoto,
    deletarTodasFotosEvento,
    iniciarRealtimeFotos, pararRealtimeFotos,
    updateProfile, reset
  }
})
