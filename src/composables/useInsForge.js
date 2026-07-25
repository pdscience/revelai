import { createClient } from '@insforge/sdk'

let client = null

export function getInsForge() {
  if (client) return client

  const url = import.meta.env.VITE_INSFORGE_URL
  const anonKey = import.meta.env.VITE_INSFORGE_ANON_KEY

  if (!url || !anonKey) {
    console.warn('InsForge credentials not configured.')
    return null
  }

  client = createClient({
    baseUrl: url,
    anonKey
  })

  return client
}

// ============================================================
// DEVICE ID (identificador único do dispositivo)
// ============================================================
export function getDeviceId() {
  let id = localStorage.getItem('revelai_device_id')
  if (!id || id.startsWith('dev_')) {
    id = crypto.randomUUID()
    localStorage.setItem('revelai_device_id', id)
  }
  return id
}

// ============================================================
// EVENTOS (RPC server-side)
// ============================================================

// Buscar evento por share_code (para convidados)
export async function buscarEventoPorShare(shareCode) {
  const insforge = getInsForge()
  if (!insforge) return null

  try {
    const { data, error } = await insforge.database
      .rpc('buscar_evento_por_share', { p_share_code: shareCode })

    if (error) throw error
    if (data && !data.ok) return null
    return data
  } catch (err) {
    console.warn('Buscar evento failed:', err)
    return null
  }
}

// Registrar entrada de convidado (server-side incrementa contador)
export async function registrarEntrada(eventoId, deviceId, nome = 'Convidado') {
  const insforge = getInsForge()
  if (!insforge) return { ok: false, erro: 'InsForge not configured' }

  try {
    const { data, error } = await insforge.database
      .rpc('registrar_entrada_convidado', {
        p_evento_id: eventoId,
        p_device_id: deviceId,
        p_nome: nome
      })

    if (error) throw error
    return data
  } catch (err) {
    console.warn('Registrar entrada failed:', err)
    return { ok: false, erro: err.message }
  }
}

// Verificar se pode tirar foto (server-side)
export async function podeTirarFoto(eventoId, deviceId) {
  const insforge = getInsForge()
  if (!insforge) return { ok: true } // fallback offline

  try {
    const { data, error } = await insforge.database
      .rpc('pode_tirar_foto', {
        p_evento_id: eventoId,
        p_device_id: deviceId
      })

    if (error) throw error
    return data
  } catch (err) {
    console.warn('Pode tirar foto failed:', err)
    return { ok: true } // fallback offline
  }
}

// Registrar foto tirada (server-side incrementa contador)
export async function registrarFoto(eventoId, deviceId, photoData = {}) {
  const insforge = getInsForge()
  if (!insforge) return { ok: false, erro: 'InsForge not configured' }

  try {
    const { data, error } = await insforge.database
      .rpc('registrar_foto', {
        p_evento_id: eventoId,
        p_device_id: deviceId,
        p_storage_key: photoData.storageKey || null,
        p_url: photoData.url || null,
        p_filtro: photoData.filtro || 'original',
        p_largura: photoData.largura || 0,
        p_altura: photoData.altura || 0,
        p_tamanho_bytes: photoData.tamanhoBytes || 0
      })

    if (error) throw error
    return data
  } catch (err) {
    console.warn('Registrar foto failed:', err)
    return { ok: false, erro: err.message }
  }
}

// Buscar fotos de um evento
export async function buscarFotosEvento(eventoId) {
  const insforge = getInsForge()
  if (!insforge) return []

  try {
    const { data, error } = await insforge.database
      .from('fotos')
      .select('*')
      .eq('evento_id', eventoId)
      .order('criado_em', { ascending: false })

    if (error) throw error
    return data || []
  } catch (err) {
    console.warn('Buscar fotos failed:', err)
    return []
  }
}

// Deletar foto do banco de dados
export async function deletarFotoDB(fotoId) {
  const insforge = getInsForge()
  if (!insforge) return false

  try {
    const { error } = await insforge.database
      .from('fotos')
      .delete()
      .eq('id', fotoId)

    if (error) throw error
    return true
  } catch (err) {
    console.warn('Deletar foto DB failed:', err)
    return false
  }
}

// Decrementar contador de fotos do convidado
export async function decrementarFotoConvidado(eventoId, deviceId) {
  const insforge = getInsForge()
  if (!insforge) return

  try {
    await insforge.database.rpc('decrementar_foto_convidado', {
      p_evento_id: eventoId,
      p_device_id: deviceId
    })
  } catch (err) {
    console.warn('Decrementar foto convidado failed:', err)
  }
}

// Deletar foto via RPC (storage + DB + decrementar contadores)
export async function deletarFotoRPC(fotoId) {
  const insforge = getInsForge()
  if (!insforge) return { ok: false, erro: 'InsForge not configured' }

  try {
    const { data, error } = await insforge.database
      .rpc('deletar_foto', { p_foto_id: fotoId })

    if (error) throw error
    return data
  } catch (err) {
    console.warn('Deletar foto RPC failed:', err)
    return { ok: false, erro: err.message }
  }
}

// Deletar todas as fotos de um evento via RPC
export async function deletarTodasFotos(eventoId) {
  const insforge = getInsForge()
  if (!insforge) return { ok: false, erro: 'InsForge not configured' }

  try {
    const { data, error } = await insforge.database
      .rpc('delete_event_photos', { p_evento_id: eventoId })

    if (error) throw error
    return data
  } catch (err) {
    console.warn('Deletar todas fotos failed:', err)
    return { ok: false, erro: err.message }
  }
}

// ============================================================
// EVENTOS (CRUD para anfitrião)
// ============================================================

export async function criarEvento({ planoId, nomeEvento, codigoAcesso, shareCode, dataInicio, dataFim, revelacaoModo, revelacaoTime }) {
  const insforge = getInsForge()
  if (!insforge) return null

  const authData = await ensureAuth()

  try {
    const anfitriaoId = authData?.user?.id || null

    const now = new Date().toISOString()
    const { data, error } = await insforge.database
      .from('eventos')
      .insert([{
        anfitriao_id: anfitriaoId,
        plano_id: planoId,
        nome_evento: nomeEvento,
        codigo_acesso: codigoAcesso,
        share_code: shareCode,
        status: 'aguardando_pagamento',
        data_inicio: dataInicio || now,
        data_fim: dataFim || new Date(Date.now() + 7 * 86400000).toISOString(),
        revelacao_modo: revelacaoModo || 'instant',
        revelacao_time: revelacaoTime || null
      }])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (err) {
    console.warn('Criar evento failed:', err)
    return null
  }
}

export async function buscarEventoPorCodigo(codigoAcesso) {
  const insforge = getInsForge()
  if (!insforge) return null

  try {
    const { data, error } = await insforge.database
      .from('eventos')
      .select('*, planos(*)')
      .eq('codigo_acesso', codigoAcesso)
      .maybeSingle()

    if (error) throw error
    return data
  } catch (err) {
    console.warn('Buscar evento failed:', err)
    return null
  }
}

export async function listarEventosAnfitriao() {
  const insforge = getInsForge()
  if (!insforge) return []

  const authData = await ensureAuth()
  const userId = authData?.user?.id

  if (!userId) return []

  try {
    const { data, error } = await insforge.database
      .from('eventos')
      .select('id, anfitriao_id, plano_id, nome_evento, codigo_acesso, share_code, status, data_inicio, data_fim, revelacao_modo, revelacao_time, criado_em, total_convidados_conectados, total_fotos, planos(*)')
      .eq('anfitriao_id', userId)
      .order('criado_em', { ascending: false })

    if (error) throw error
    return data || []
  } catch (err) {
    console.warn('Listar eventos failed:', err)
    return []
  }
}

export async function atualizarEvento(eventoId, updates) {
  const insforge = getInsForge()
  if (!insforge) return null

  try {
    const { data, error } = await insforge.database
      .from('eventos')
      .update(updates)
      .eq('id', eventoId)
      .select()

    if (error) throw error
    return data?.[0] || null
  } catch (err) {
    console.warn('Atualizar evento failed:', err)
    return null
  }
}

// ============================================================
// STORAGE - Upload de fotos
// ============================================================

export async function uploadPhotoBlob(blob, eventoId, deviceId) {
  const insforge = getInsForge()
  if (!insforge) return null

  const key = `${eventoId}/${deviceId}/${Date.now()}.jpg`

  try {
    const { error: uploadError } = await insforge.storage
      .from('event-photos')
      .upload(key, blob)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw uploadError
    }

    const url = insforge.storage.from('event-photos').getPublicUrl(key)
    return { key, url }
  } catch (err) {
    console.error('Upload photo failed:', err)
    return null
  }
}

export async function deletePhotoFromStorage(storageKey) {
  const insforge = getInsForge()
  if (!insforge) return

  try {
    await insforge.storage
      .from('event-photos')
      .remove(storageKey)
  } catch (err) {
    console.warn('Delete storage failed:', err)
  }
}

// ============================================================
// PLANOS ( CRUD )
// ============================================================

export async function fetchPlans() {
  const insforge = getInsForge()
  if (!insforge) return []

  try {
    const { data, error } = await insforge.database
      .from('planos')
      .select('*')
      .order('id', { ascending: true })

    if (error) throw error
    return data || []
  } catch (err) {
    console.warn('Fetch plans failed:', err)
    return []
  }
}

export async function upsertPlan(planData) {
  const insforge = getInsForge()
  if (!insforge) return null

  try {
    const { data: existing } = await insforge.database
      .from('planos')
      .select('id')
      .eq('nome', planData.nome)
      .maybeSingle()

    let result
    if (existing) {
      const { id, ...updates } = planData
      result = await insforge.database
        .from('planos')
        .update(updates)
        .eq('id', existing.id)
        .select()
        .single()
    } else {
      result = await insforge.database
        .from('planos')
        .insert([{
          nome: planData.nome,
          preco_centavos: planData.preco_centavos,
          limite_convidados: planData.limite_convidados,
          limite_fotos_por_pessoa: planData.limite_fotos_por_pessoa,
          stripe_price_id: planData.stripe_price_id || null,
          ativo: planData.ativo !== false,
        }])
        .select()
        .single()
    }

    if (result.error) throw result.error
    return result.data
  } catch (err) {
    console.warn('Upsert plan failed:', err)
    return null
  }
}

export async function deletePlan(planId) {
  const insforge = getInsForge()
  if (!insforge) return false

  try {
    await insforge.database
      .from('planos')
      .delete()
      .eq('id', planId)
    return true
  } catch (err) {
    console.warn('Delete plan failed:', err)
    return false
  }
}

// ============================================================
// PAGAMENTOS
// ============================================================

export async function criarPagamento({ eventoId, gatewayId, valorCentavos, metodoPagamento }) {
  const insforge = getInsForge()
  if (!insforge) return null

  try {
    const { data, error } = await insforge.database
      .from('pagamentos')
      .insert([{
        evento_id: eventoId,
        gateway_id: gatewayId || null,
        valor_pago_centavos: valorCentavos,
        metodo_pagamento: metodoPagamento || 'cartao',
        status: 'pago',
        pago_em: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (err) {
    console.warn('Criar pagamento failed:', err)
    return null
  }
}

// ============================================================
// STRIPE CHECKOUT
// ============================================================

export async function createCheckoutSession({ priceCents, planName, successUrl, cancelUrl, eventoId, customerEmail }) {
  const insforge = getInsForge()
  if (!insforge) return null

  try {
    const { data, error } = await insforge.functions.invoke('create-checkout', {
      body: {
        priceCents,
        planName,
        successUrl,
        cancelUrl,
        eventoId,
        customerEmail
      }
    })

    if (error) throw error
    return data
  } catch (err) {
    console.warn('Stripe checkout failed:', err)
    return null
  }
}

// Verificar sessão de checkout no servidor (validação server-side)
export async function verifyCheckoutSession(sessionId) {
  const insforge = getInsForge()
  if (!insforge) return null

  try {
    const { data, error } = await insforge.functions.invoke('verify-checkout', {
      body: { sessionId }
    })

    if (error) throw error
    return data
  } catch (err) {
    console.warn('Verify checkout failed:', err)
    return null
  }
}

// ============================================================
// EMAIL — Enviar link de compartilhamento
// ============================================================

export async function sendShareEmail({ email, eventName, shareUrl, accessUrl }) {
  const insforge = getInsForge()
  if (!insforge) return { ok: false, erro: 'InsForge not configured' }

  try {
    const { data, error } = await insforge.functions.invoke('send-share-email', {
      body: { email, eventName, shareUrl, accessUrl }
    })

    if (error) throw error
    return data
  } catch (err) {
    console.warn('Send share email failed:', err)
    return { ok: false, erro: err.message }
  }
}

// ============================================================
// AUTH — auto sign-up / sign-in com conta de dispositivo
// ============================================================

let authResolved = false
let cachedAuthData = null
let currentAccessToken = null

export async function ensureAuth() {
  const insforge = getInsForge()
  if (!insforge) return null
  if (authResolved) return cachedAuthData

  const deviceId = getDeviceId()
  const password = deviceId

  // 1. Tenta signIn com email existente
  let authEmail = localStorage.getItem('revelai_auth_email')
  if (authEmail) {
    try {
      const { data, error } = await insforge.auth.signInWithPassword({ email: authEmail, password })
      if (!error && data?.accessToken) {
        insforge.setAccessToken(data.accessToken)
        currentAccessToken = data.accessToken
        authResolved = true
        cachedAuthData = data
        return data
      }
    } catch { /* ignore */ }
  }

  // 2. signIn falhou — cria novo usuário
  const newEmail = `${deviceId}_${Date.now()}@revelai.local`
  try {
    const { data, error } = await insforge.auth.signUp({ email: newEmail, password })
    if (!error && data?.accessToken) {
      localStorage.setItem('revelai_auth_email', newEmail)
      insforge.setAccessToken(data.accessToken)
      currentAccessToken = data.accessToken
      authResolved = true
      cachedAuthData = data
      return data
    }
    console.error('SignUp error:', error)
  } catch (err) {
    console.error('Auth failed:', err)
  }
  return null
}

export async function signInAnonymously() {
  await ensureAuth()
  return null
}

// ============================================================
// STORAGE — Fetch autenticado de imagens
// ============================================================

const blobUrlCache = new Map()

export async function fetchAuthenticatedImage(url) {
  if (!url) return null
  if (blobUrlCache.has(url)) return blobUrlCache.get(url)

  const token = currentAccessToken

  try {
    const headers = {}
    if (token) headers['Authorization'] = `Bearer ${token}`

    const res = await fetch(url, { headers })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const blob = await res.blob()
    const blobUrl = URL.createObjectURL(blob)
    blobUrlCache.set(url, blobUrl)
    return blobUrl
  } catch (err) {
    console.warn('Authenticated image fetch failed:', url, err)
    return url
  }
}

export function revokeCachedBlobUrls() {
  for (const blobUrl of blobUrlCache.values()) {
    URL.revokeObjectURL(blobUrl)
  }
  blobUrlCache.clear()
}

// ============================================================
// REALTIME — subscrição para fotos em tempo real
// ============================================================

let realtimeChannel = null

export function subscribeToPhotos(eventoId, onNewPhoto) {
  const insforge = getInsForge()
  if (!insforge) return null

  // Limpar subscription anterior
  unsubscribeFromPhotos()

  try {
    realtimeChannel = insforge
      .channel(`fotos:${eventoId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'fotos',
          filter: `evento_id=eq.${eventoId}`
        },
        (payload) => {
          if (onNewPhoto && payload.new) {
            onNewPhoto(payload.new)
          }
        }
      )
      .subscribe()

    return realtimeChannel
  } catch (err) {
    console.warn('Subscribe to photos failed:', err)
    return null
  }
}

export function unsubscribeFromPhotos() {
  const insforge = getInsForge()
  if (!insforge || !realtimeChannel) return

  try {
    insforge.removeChannel(realtimeChannel)
    realtimeChannel = null
  } catch (err) {
    console.warn('Unsubscribe from photos failed:', err)
  }
}
