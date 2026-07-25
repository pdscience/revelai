<template>
  <div id="page-landing">
    <!-- HEADER -->
    <header class="land-header">
      <div class="land-logo">RevelaI</div>
      <nav class="land-nav">
        <a href="#como-funciona">Como funciona</a>
        <a href="#recursos">Recursos</a>
        <a href="#precos">Preços</a>
        <a href="#faq">FAQ</a>
      </nav>
      <button class="btn-primary" style="padding:10px 20px;font-size:13px;" @click="scrollToPricing">Ver planos</button>
    </header>

    <!-- HERO -->
    <section class="hero-section" style="padding-top:100px;">
      <div class="hero-bg"></div>
      <canvas id="hero-particles" ref="heroParticles"></canvas>
      <span class="hero-float float-slow" style="top:18%;left:12%;">✨</span>
      <span class="hero-float float-drift" style="top:28%;right:14%;font-size:28px;">🎞️</span>
      <span class="hero-float float-slow" style="bottom:32%;left:8%;font-size:22px;animation-delay:1.5s;">📸</span>
      <span class="hero-float float-drift" style="bottom:24%;right:10%;font-size:20px;animation-delay:2s;">💡</span>

      <div class="hero-badge reveal visible" style="position:relative;z-index:3;">
        <span>✨</span>
        <span>Câmera descartável para a era digital</span>
      </div>
      <h1 class="hero-title reveal visible" style="position:relative;z-index:3;">
        Capture seu dia<br>
        <span>através de todos</span><br>
        os olhares.
      </h1>
      <p class="hero-sub reveal visible reveal-delay-1" style="position:relative;z-index:3;">
        RevelaI é o app de câmera descartável privado para eventos. Convidados entram pelo QR code, fotografam momentos únicos, e o álbum é revelado juntos no momento que você escolher.
      </p>
      <div class="flex gap-4 flex-wrap justify-center mb-12 reveal visible reveal-delay-2" style="position:relative;z-index:3;">
        <button class="btn-primary" @click="openWizard">
          <span>🎬</span> Criar meu evento
        </button>
        <button class="btn-outline-land" @click="scrollToHow">
          <span>▶</span> Ver como funciona
        </button>
      </div>

      <div class="film-strip parallax" ref="filmStrip" style="justify-content:center;position:relative;z-index:3;">
        <div class="film-frame" style="background:linear-gradient(135deg,#3d2614,#5a3a1a);display:flex;align-items:center;justify-content:center;font-size:36px;">💍</div>
        <div class="film-frame" style="background:linear-gradient(135deg,#1a2436,#26415d);display:flex;align-items:center;justify-content:center;font-size:36px;">🎂</div>
        <div class="film-frame" style="background:linear-gradient(135deg,#142e1f,#1c4a30);display:flex;align-items:center;justify-content:center;font-size:36px;">✈️</div>
        <div class="film-frame" style="background:linear-gradient(135deg,#3d1812,#5a2412);display:flex;align-items:center;justify-content:center;font-size:36px;">🎉</div>
        <div class="film-frame" style="background:linear-gradient(135deg,#2e2614,#4a3a1c);display:flex;align-items:center;justify-content:center;font-size:36px;">🎓</div>
      </div>

      <div class="flex items-center gap-8 flex-wrap justify-center reveal visible reveal-delay-3" style="color:rgba(248,244,235,0.4);font-size:13px;position:relative;z-index:3;">
        <div class="flex items-center gap-2"><span style="color:var(--green);filter:drop-shadow(0 0 8px rgba(61,220,140,0.6));">●</span> Sem download para convidados</div>
        <div class="flex items-center gap-2"><span style="color:var(--green);filter:drop-shadow(0 0 8px rgba(61,220,140,0.6));">●</span> 100% privado</div>
        <div class="flex items-center gap-2"><span style="color:var(--green);filter:drop-shadow(0 0 8px rgba(61,220,140,0.6));">●</span> Revelação no momento certo</div>
      </div>

      <div class="scroll-indicator">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color:var(--accent)">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
    </section>

    <!-- STATS -->
    <section class="stats-section reveal">
      <div class="section-inner" style="padding:60px 24px;">
        <div class="stats-grid">
          <div class="stat-item reveal reveal-delay-1">
            <div class="stat-number">4.8★</div>
            <div class="stat-label">Avaliação na App Store</div>
          </div>
          <div class="stat-item reveal reveal-delay-2">
            <div class="stat-number">∞</div>
            <div class="stat-label">Memórias capturadas</div>
          </div>
          <div class="stat-item reveal reveal-delay-3">
            <div class="stat-number">200+</div>
            <div class="stat-label">Convidados por evento</div>
          </div>
          <div class="stat-item reveal reveal-delay-4">
            <div class="stat-number">6</div>
            <div class="stat-label">Filtros de filme</div>
          </div>
        </div>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section class="section reveal" id="como-funciona">
      <div class="section-inner">
        <div class="text-center mb-2">
          <span class="section-label">Como funciona</span>
        </div>
        <div class="accent-line-anim" style="margin:16px auto 0;"></div>
        <h2 class="section-title text-center" style="margin-top:16px;">Simples como uma câmera<br><span style="color:var(--accent);font-style:italic;">descartável de verdade</span></h2>
        <p class="section-desc text-center" style="margin:16px auto 0;">Em quatro passos, seu evento vira uma memória compartilhada e inesquecível.</p>
        <div class="steps-grid">
          <div class="step-card reveal reveal-delay-1">
            <div class="step-number">01</div>
            <div class="step-icon">🎬</div>
            <h3 class="step-title">Crie seu filme</h3>
            <p class="step-desc">Escolha um plano, dê nome ao evento, defina o limite de fotos por pessoa e o momento da revelação.</p>
          </div>
          <div class="step-card reveal reveal-delay-2">
            <div class="step-icon">📲</div>
            <div class="step-number">02</div>
            <h3 class="step-title">Compartilhe o QR code</h3>
            <p class="step-desc">Envie o link ou QR code. Os convidados acessam instantaneamente — sem baixar nada.</p>
          </div>
          <div class="step-card reveal reveal-delay-3">
            <div class="step-icon">📸</div>
            <div class="step-number">03</div>
            <h3 class="step-title">Todos fotografam</h3>
            <p class="step-desc">Com limite de fotos por pessoa, cada clique vale. A câmera tem filtros de filme e melhoria de imagem.</p>
          </div>
          <div class="step-card reveal reveal-delay-4" style="border-radius:0 20px 20px 0;">
            <div class="step-icon">🎉</div>
            <div class="step-number">04</div>
            <h3 class="step-title">Revele juntos</h3>
            <p class="step-desc">No momento que você escolheu, o álbum completo é revelado. Baixe tudo e guarde para sempre.</p>
          </div>
        </div>
      </div>
    </section>

    <div class="divider" style="max-width:1100px;"></div>

    <!-- FEATURES -->
    <section class="section reveal" id="recursos">
      <div class="section-inner">
        <div class="flex flex-wrap gap-10 items-start justify-between">
          <div>
            <span class="section-label">Recursos</span>
            <div class="accent-line-anim"></div>
            <h2 class="section-title">Tudo que seu<br>evento precisa</h2>
            <p class="section-desc">A experiência mais elegante de câmera descartável digital, com controles completos para o anfitrião.</p>
          </div>
          <div class="phone-mock parallax" ref="phoneMock" style="margin:0 auto;">
            <div class="phone-notch"></div>
            <div class="phone-screen" style="background:#0a0a0a;padding-top:36px;">
              <div style="padding:12px;display:flex;flex-direction:column;gap:8px;height:100%;">
                <div style="height:160px;background:linear-gradient(135deg,#231708,#3a2414);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:42px;border:1px solid var(--border);">📽️</div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;flex:1;">
                  <div style="background:var(--charcoal3);border-radius:10px;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:26px;">💍</div>
                  <div style="background:var(--charcoal3);border-radius:10px;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:26px;">🎂</div>
                  <div style="background:var(--charcoal3);border-radius:10px;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:26px;">✈️</div>
                  <div style="background:linear-gradient(135deg,rgba(233,162,75,0.18),rgba(255,122,46,0.08));border-radius:10px;border:1px solid var(--border-strong);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--accent3);letter-spacing:0.5px;">+ CRIAR</div>
                </div>
                <div style="background:linear-gradient(135deg,rgba(233,162,75,0.14),rgba(255,122,46,0.06));border:1px solid var(--border-strong);border-radius:10px;padding:10px;text-align:center;">
                  <p style="font-size:10px;color:var(--accent3);font-weight:700;letter-spacing:1px;text-shadow:0 0 12px rgba(233,162,75,0.4);">📽 18 FOTOS RESTANTES</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="features-grid">
          <div class="feature-card reveal reveal-delay-1"><div class="feature-icon">📲</div><h3 class="feature-title">QR code instantâneo</h3><p class="feature-desc">Convidados entram pelo QR code sem precisar baixar nenhum app. Acesso em segundos via navegador.</p></div>
          <div class="feature-card reveal reveal-delay-2"><div class="feature-icon">🔒</div><h3 class="feature-title">Revelação atrasada</h3><p class="feature-desc">Escolha o exato momento da revelação. As fotos ficam bloqueadas com timer em tempo real até o instante da surpresa.</p></div>
          <div class="feature-card reveal reveal-delay-3"><div class="feature-icon">🎞️</div><h3 class="feature-title">Limite de shots</h3><p class="feature-desc">Defina quantas fotos cada pessoa pode tirar. A escassez cria fotos mais cuidadosas e cheias de intenção.</p></div>
          <div class="feature-card reveal reveal-delay-4"><div class="feature-icon">🎨</div><h3 class="feature-title">6 filtros de filme</h3><p class="feature-desc">Original, Filme, Quente, Frio, P&B e Grão. Aplicados diretamente nos pixels com brilho, contraste e saturação ajustáveis.</p></div>
          <div class="feature-card reveal reveal-delay-5"><div class="feature-icon">👥</div><h3 class="feature-title">Câmera coletiva</h3><p class="feature-desc">Todas as fotos de todos os convidados centralizam em um único álbum privado, organizado por você.</p></div>
          <div class="feature-card reveal reveal-delay-6"><div class="feature-icon">⬇️</div><h3 class="feature-title">Download completo</h3><p class="feature-desc">Baixe todas as fotos do evento em alta qualidade diretamente para seu dispositivo com um clique.</p></div>
        </div>
      </div>
    </section>

    <!-- TESTIMONIALS -->
    <section class="section reveal" style="background:linear-gradient(135deg,rgba(233,162,75,0.03),rgba(255,122,46,0.02));border-top:1px solid var(--border);border-bottom:1px solid var(--border);">
      <div class="section-inner">
        <div class="text-center">
          <span class="section-label">Depoimentos</span>
          <div class="accent-line-anim" style="margin:16px auto 0;"></div>
          <h2 class="section-title" style="margin-top:16px;">O que os anfitriões dizem</h2>
        </div>
        <div class="testimonials-grid">
          <div class="testimonial-card reveal reveal-delay-1">
            <div class="testimonial-stars">★★★★★</div>
            <p class="testimonial-text">"Usei no meu casamento e foi incrível! Ver o dia pelos olhos dos meus convidados foi uma experiência que jamais esquecerei."</p>
            <div class="testimonial-author"><div class="testimonial-avatar">👰</div><div><div class="testimonial-name">Juliana M.</div><div class="testimonial-event">Casamento · São Paulo</div></div></div>
          </div>
          <div class="testimonial-card reveal reveal-delay-2">
            <div class="testimonial-stars">★★★★★</div>
            <p class="testimonial-text">"Criei um filme para minha festa de 30 anos. A revelação no final da noite foi o auge da festa! Superou minhas expectativas."</p>
            <div class="testimonial-author"><div class="testimonial-avatar">🎂</div><div><div class="testimonial-name">Rafael S.</div><div class="testimonial-event">Aniversário · Rio de Janeiro</div></div></div>
          </div>
          <div class="testimonial-card reveal reveal-delay-3">
            <div class="testimonial-stars">★★★★★</div>
            <p class="testimonial-text">"Levei para uma viagem em grupo com 15 amigos. O QR code facilitou tudo — ninguém precisou instalar nada. Voltamos com um álbum lindo."</p>
            <div class="testimonial-author"><div class="testimonial-avatar">✈️</div><div><div class="testimonial-name">Carla F.</div><div class="testimonial-event">Viagem · Portugal</div></div></div>
          </div>
        </div>
      </div>
    </section>

    <!-- PRICING -->
    <section class="section reveal" id="precos">
      <div class="section-inner">
        <div class="text-center">
          <span class="section-label">Preços</span>
          <div class="accent-line-anim" style="margin:16px auto 0;"></div>
          <h2 class="section-title" style="margin-top:16px;">Monte o plano ideal<br><span style="color:var(--accent);font-style:italic;">para o seu evento</span></h2>
          <p class="section-desc" style="margin:16px auto 0;text-align:center;">Escolha a quantidade de participantes e fotos por pessoa. O preço é calculado automaticamente.</p>
        </div>

        <div class="plans-grid" style="margin-top:40px;">
          <div
            v-for="(plano, idx) in planos"
            :key="plano.id"
            class="plan-card reveal"
            :class="{ popular: isPopularPlan(plano), ['reveal-delay-' + (idx + 1)]: true }"
          >
            <div v-if="isPopularPlan(plano)" class="popular-badge">MAIS POPULAR</div>
            <div class="plan-name">{{ plano.nome }}</div>
            <div class="plan-tagline">{{ getPlanTagline(plano) }}</div>
            <div class="plan-price">
              <span class="plan-currency">R$</span>
              <span class="plan-amount">{{ formatPrice(plano.preco_centavos) }}</span>
              <span class="plan-period">/evento</span>
            </div>
            <div class="plan-divider"></div>
            <div class="plan-highlight-row">
              <div class="plan-highlight-val">{{ formatNumber(plano.limite_convidados) }}</div>
              <div class="plan-highlight-label">convidados</div>
            </div>
            <div class="plan-highlight-row">
              <div class="plan-highlight-val">{{ formatNumber(plano.limite_fotos_por_pessoa) }}</div>
              <div class="plan-highlight-label">fotos por pessoa</div>
            </div>
            <ul class="plan-features">
              <li class="plan-feature"><span class="plan-feature-check">✓</span>QR code de acesso</li>
              <li class="plan-feature"><span class="plan-feature-check">✓</span>6 filtros de filme</li>
              <li class="plan-feature"><span class="plan-feature-check">✓</span>Revelação atrasada</li>
              <li class="plan-feature"><span class="plan-feature-check">✓</span>Download das fotos</li>
              <li v-if="plano.limite_convidados >= 75" class="plan-feature"><span class="plan-feature-check">✓</span>Múltiplos álbuns</li>
              <li v-else class="plan-feature"><span class="plan-feature-x">—</span>Múltiplos álbuns</li>
            </ul>
            <button class="btn-primary" style="width:100%;" @click="openWizard">
              {{ plano.preco_centavos === 0 ? 'Começar grátis' : 'Escolher plano' }}
            </button>
          </div>
        </div>

        <div class="text-center reveal reveal-delay-4" style="margin-top:40px;">
          <button class="btn-primary" style="padding:18px 48px;font-size:17px;" @click="openWizard">🎬 Criar meu evento</button>
        </div>

        <div class="flex justify-center reveal reveal-delay-5" style="margin-top:32px;">
          <div class="guarantee-badge">
            <span style="font-size:24px;">🛡️</span>
            <div><div style="font-weight:600;color:var(--cream);font-size:14px;">Garantia de 7 dias</div><div>Se não ficar satisfeito, devolvemos 100% do valor pago.</div></div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="section reveal" id="faq" style="background:rgba(248,244,235,0.015);border-top:1px solid var(--border);">
      <div class="section-inner" style="max-width:700px;">
        <div class="text-center">
          <span class="section-label">Perguntas frequentes</span>
          <div class="accent-line-anim" style="margin:16px auto 0;"></div>
          <h2 class="section-title" style="margin-top:16px;">Ficou alguma dúvida?</h2>
        </div>
        <div class="faq-list">
          <div v-for="(item, i) in faqItems" :key="i" class="faq-item reveal" :class="{ open: item.open }" :style="{ transitionDelay: (i * 0.06) + 's' }">
            <button class="faq-question" @click="toggleFaq(i)">
              {{ item.q }}
              <span class="faq-arrow">+</span>
            </button>
            <div class="faq-answer">{{ item.a }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="section cta-section reveal">
      <div class="section-inner text-center">
        <p style="font-size:48px;margin-bottom:24px;filter:drop-shadow(0 0 20px rgba(255,122,46,0.45));">🎞️</p>
        <h2 class="section-title">A vida acontece<br><span style="color:var(--accent);font-style:italic;">uma única vez.</span></h2>
        <p class="section-desc" style="margin:20px auto 40px;text-align:center;">Não deixe as memórias do seu evento se perderem. Crie seu filme, convide seus convidados e revele tudo juntos.</p>
        <button class="btn-primary" style="padding:18px 48px;font-size:17px;" @click="openWizard">🎬 Criar meu evento agora</button>
        <p style="margin-top:20px;font-size:13px;color:rgba(248,244,235,0.32);">Acesso imediato após o pagamento · Garantia de 7 dias</p>
      </div>
    </section>

    <!-- FOOTER -->
    <footer>
      <div class="land-logo" style="font-size:28px;margin-bottom:12px;">RevelaI</div>
      <p>© 2026 RevelaI — Câmera Descartável para Eventos</p>
      <p style="margin-top:6px;">Feito com ♥ para guardar momentos que importam</p>
      <div class="flex gap-4 justify-center mt-4">
        <router-link to="/privacidade" style="color:rgba(248,244,235,0.5);font-size:12px;text-decoration:none;">Política de Privacidade</router-link>
        <router-link to="/termos" style="color:rgba(248,244,235,0.5);font-size:12px;text-decoration:none;">Termos de Uso</router-link>
      </div>
    </footer>

    <CreateEventWizard v-if="wizardOpen" @close="closeWizard" @created="onWizardCreated" />

    <div class="toast-land"></div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '../stores/app.js'
import { fetchPlans } from '../composables/useInsForge.js'
import CreateEventWizard from '../components/CreateEventWizard.vue'

const router = useRouter()
const route = useRoute()
const store = useAppStore()

const wizardOpen = ref(false)
const planos = ref([])

function isPopularPlan(plano) {
  return plano.nome === 'Festa'
}

function getPlanTagline(plano) {
  const taglines = {
    'Grátis': 'Experimente sem compromisso',
    'Essencial': 'Para pequenos eventos',
    'Festa': 'Para festas e celebracoes',
    'Casamento': 'Para casamentos e grandes eventos',
    'Ilimitado': 'Para eventos corporativos'
  }
  return taglines[plano.nome] || 'Evento completo'
}

function formatPrice(centavos) {
  if (centavos === 0) return '0'
  return (centavos / 100).toFixed(2).replace('.', ',')
}

function formatNumber(n) {
  if (n >= 9999) return 'Ilimitados'
  return n.toString()
}
const heroParticles = ref(null)
const filmStrip = ref(null)
const phoneMock = ref(null)

const faqItems = reactive([
  { q: 'Os convidados precisam baixar algum app?', a: 'Não! Os convidados acessam a câmera diretamente pelo navegador, sem precisar instalar nada. Basta escanear o QR code ou clicar no link que você compartilha.', open: false },
  { q: 'Como funciona a revelação atrasada?', a: 'Você define a data e hora exata da revelação ao criar o evento. Enquanto isso, as fotos ficam bloqueadas com um contador regressivo visível. No momento marcado, todos veem as fotos ao mesmo tempo — como revelar um rolo de filme!', open: false },
  { q: 'Posso usar o RevelaI em qualquer dispositivo?', a: 'Sim! O RevelaI funciona em qualquer smartphone ou tablet com câmera e navegador moderno (Chrome, Safari, Firefox).', open: false },
  { q: 'As fotos ficam salvas na nuvem?', a: 'Todas as fotos são enviadas automaticamente para a nuvem e ficam disponíveis no álbum do evento.', open: false },
  { q: 'Quanto tempo depois do pagamento recebo o acesso?', a: 'O acesso é liberado instantaneamente após a confirmação do pagamento. Você recebe um link exclusivo no e-mail cadastrado.', open: false },
  { q: 'Como funciona a garantia de 7 dias?', a: 'Se por qualquer motivo você não ficar satisfeito, basta nos contatar em até 7 dias após o pagamento para receber o reembolso integral.', open: false },
])

// ----------------------------------------------------------
// Hero particles — canvas com pontos dourados/laranja flutuando
// ----------------------------------------------------------
let particleRAF = null
let particleResize = null
function initHeroParticles() {
  const canvas = heroParticles.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const dpr = Math.min(window.devicePixelRatio || 1, 2)

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion) return

  const COLORS = [
    'rgba(233, 162, 75, 0.65)',
    'rgba(255, 122, 46, 0.55)',
    'rgba(255, 208, 138, 0.7)',
    'rgba(212, 168, 87, 0.5)'
  ]

  let particles = []
  let w = 0, h = 0

  particleResize = function resize() {
    const parent = canvas.parentElement
    if (!parent) return
    w = parent.clientWidth
    h = parent.clientHeight
    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = w + 'px'
    canvas.style.height = h + 'px'
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const target = Math.min(60, Math.max(22, Math.floor((w * h) / 14000)))
    particles = []
    for (let i = 0; i < target; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2.4 + 0.6,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25 - 0.08,
        a: Math.random() * 0.5 + 0.25,
        tw: Math.random() * Math.PI * 2,
        tws: Math.random() * 0.02 + 0.005,
        c: COLORS[Math.floor(Math.random() * COLORS.length)]
      })
    }
  }

  function step() {
    ctx.clearRect(0, 0, w, h)
    for (const p of particles) {
      p.x += p.vx
      p.y += p.vy
      p.tw += p.tws
      if (p.x < -10) p.x = w + 10
      else if (p.x > w + 10) p.x = -10
      if (p.y < -10) p.y = h + 10
      else if (p.y > h + 10) p.y = -10
      const alpha = p.a * (0.6 + 0.4 * Math.sin(p.tw))
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = p.c.replace(/[\d.]+\)$/, alpha.toFixed(2) + ')')
      ctx.shadowBlur = 12
      ctx.shadowColor = p.c
      ctx.fill()
    }
    ctx.shadowBlur = 0
    particleRAF = requestAnimationFrame(step)
  }

  particleResize()
  step()
  window.addEventListener('resize', particleResize, { passive: true })
}

// ----------------------------------------------------------
// Reveal via IntersectionObserver — adiciona .visible nos .reveal
// ----------------------------------------------------------
let revealObserver = null
function initReveal() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('#page-landing .reveal').forEach(el => el.classList.add('visible'))
    return
  }
  revealObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
        revealObserver.unobserve(entry.target)
      }
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' })

  // observa depois do próximo tick pra pegar todo o DOM renderizado
  nextTick(() => {
    document.querySelectorAll('#page-landing .reveal:not(.visible)').forEach(el => {
      // Evita animar elementos já acima da dobra (hero) / dentro de seções hidden
      if (el.closest('[style*="display:none"]')) return
      revealObserver.observe(el)
    })
  })
}

// ----------------------------------------------------------
// Parallax sutil — film strip & phone mock seguem o scroll
// ----------------------------------------------------------
let parallaxTicking = false
function onParallaxScroll() {
  if (parallaxTicking) return
  parallaxTicking = true
  requestAnimationFrame(() => {
    const y = window.scrollY
    if (filmStrip.value) {
      const factor = filmStrip.value.getBoundingClientRect().top + y
      const offset = (y - factor) * 0.08
      filmStrip.value.style.transform = `translateX(${Math.max(-40, Math.min(40, offset))}px)`
    }
    if (phoneMock.value) {
      const rect = phoneMock.value.getBoundingClientRect()
      const offset = (rect.top + y - y) * 0.05
      phoneMock.value.style.transform = `translateY(${Math.max(-30, Math.min(30, -offset * 0.6))}px)`
    }
    parallaxTicking = false
  })
}

onMounted(async () => {
  const query = route.query
  if (query.access) {
    sessionStorage.setItem('revelai_access', query.access)
    window.history.replaceState({}, '', window.location.pathname)
    store.setAccess(query.access)
    if (store.isAuthenticated) {
      router.push('/app')
    }
  } else if (query.join) {
    router.push({ path: '/guest', query: { join: query.join, film: query.film || '' } })
  }

  try {
    planos.value = await fetchPlans()
  } catch (e) {
    console.warn('Erro ao carregar planos:', e)
  }

  // Animações premium só depois do mount
  nextTick(() => {
    initHeroParticles()
    initReveal()
  })
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!reduceMotion) {
    window.addEventListener('scroll', onParallaxScroll, { passive: true })
  }

  // Lifecycle cleanup (must be registered at top-level setup, not inside nextTick)
  onUnmounted(() => {
    if (particleRAF) cancelAnimationFrame(particleRAF)
    if (particleResize) window.removeEventListener('resize', particleResize)
    if (revealObserver) revealObserver.disconnect()
    window.removeEventListener('scroll', onParallaxScroll)
  })
})

function scrollToPricing() {
  document.getElementById('precos')?.scrollIntoView({ behavior: 'smooth' })
}
function scrollToHow() {
  document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })
}
function toggleFaq(i) {
  faqItems.forEach((item, idx) => { if (idx !== i) item.open = false })
  faqItems[i].open = !faqItems[i].open
}

function openWizard() {
  wizardOpen.value = true
  document.body.style.overflow = 'hidden'
}

function closeWizard() {
  wizardOpen.value = false
  document.body.style.overflow = ''
}

function onWizardCreated() {
  closeWizard()
  router.push('/app')
}
</script>
