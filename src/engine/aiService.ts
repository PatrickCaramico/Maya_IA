import type { ConversationAttachment, Project, EtapaNumero } from '../types/project';
import type { ConscienceData } from '../types/conscience';
import { buildChatContext, buildRestrictedContext, MAYA_SYSTEM_PROMPT } from './promptBuilder';

export interface AISettings {
  provider: 'simulated' | 'backend' | 'anthropic' | 'openai' | 'gemini';
  apiKey?: string;
  model?: string;
  /** URL base do backend seguro (ver pasta /server). Ex: "http://localhost:8787" ou "/api" em produção. */
  backendUrl?: string;
}

export const DEFAULT_AI_SETTINGS: AISettings = {
  provider: 'simulated',
  apiKey: '',
  model: 'claude-3-7-sonnet-20250219',
  backendUrl: '/api'
};

/**
 * Orquestrador central de geração de conteúdo da Maya
 */
export async function generateMayaStageContent(
  project: Project,
  stage: EtapaNumero,
  conscience: ConscienceData,
  settings: AISettings,
  feedback?: string
): Promise<string> {
  const context = buildRestrictedContext(project, stage, conscience, feedback);

  if (settings.provider === 'backend' && settings.backendUrl) {
    try {
      return await callBackendAPI(settings.backendUrl, settings.model, MAYA_SYSTEM_PROMPT, context);
    } catch (err: any) {
      console.warn('Falha ao chamar o backend seguro, caindo para simulação inteligente:', err);
    }
  }

  if (settings.provider === 'anthropic' && settings.apiKey) {
    try {
      return await callAnthropicAPI(settings.apiKey, settings.model || 'claude-3-7-sonnet-20250219', context);
    } catch (err: any) {
      console.warn('Falha na API Anthropic, caindo para simulação inteligente:', err);
    }
  } else if (settings.provider === 'gemini' && settings.apiKey) {
    try {
      return await callGeminiAPI(settings.apiKey, settings.model || 'gemini-2.0-flash', context);
    } catch (err: any) {
      console.warn('Falha na API Gemini, caindo para simulação inteligente:', err);
    }
  } else if (settings.provider === 'openai' && settings.apiKey) {
    try {
      return await callOpenAIAPI(settings.apiKey, settings.model || 'gpt-4o', context);
    } catch (err: any) {
      console.warn('Falha na API OpenAI, caindo para simulação inteligente:', err);
    }
  }

  return generateSimulatedResponse(project, stage, conscience, feedback);
}

export async function generateMayaChatReply(
  project: Project,
  stage: EtapaNumero,
  conscience: ConscienceData,
  settings: AISettings,
  userMessage: string,
  attachments: ConversationAttachment[] = []
): Promise<string> {
  if (attachments.length === 0 && isGreetingOnly(userMessage)) {
    return buildGreetingReply(project, conscience);
  }

  const conversationPreview = project.etapas[stage]?.conversation || [];
  const linkInsights = await buildLinkInsights(userMessage);
  const enrichedMessage = linkInsights
    ? `${userMessage}\n\n### LEITURA AUTOMÁTICA DE LINKS\n${linkInsights}`
    : userMessage;

  const context = buildChatContext(project, stage, conscience, enrichedMessage, conversationPreview, attachments);

  if (settings.provider === 'backend' && settings.backendUrl) {
    try {
      return await callBackendAPI(settings.backendUrl, settings.model, MAYA_SYSTEM_PROMPT, context);
    } catch (err: any) {
      console.warn('Falha no Backend Seguro para chat, caindo para simulação:', err);
    }
  }

  if (settings.provider === 'gemini' && settings.apiKey) {
    try {
      return await callGeminiChatAPI(settings.apiKey, settings.model || 'gemini-2.0-flash', context);
    } catch (err: any) {
      console.error('Erro na chamada da API do Gemini para chat:', err);
      alert(`Aviso Gemini API: ${err.message || 'Falha ao conectar'}. Exibindo resposta simulada.`);
    }
  } else if (settings.provider === 'anthropic' && settings.apiKey) {
    try {
      return await callAnthropicChatAPI(settings.apiKey, settings.model || 'claude-3-7-sonnet-20250219', context);
    } catch (err: any) {
      console.warn('Falha na API Anthropic para chat, caindo para simulação:', err);
    }
  } else if (settings.provider === 'openai' && settings.apiKey) {
    try {
      return await callOpenAIChatAPI(settings.apiKey, settings.model || 'gpt-4o', context);
    } catch (err: any) {
      console.warn('Falha na API OpenAI para chat, caindo para simulação:', err);
    }
  }

  return generateSimulatedChatReply(project, stage, enrichedMessage, attachments);
}

const GREETING_WORDS = new Set([
  'oi', 'oii', 'oiii', 'oie', 'ola', 'eae', 'e', 'ai', 'aew', 'fala',
  'salve', 'opa', 'hey', 'hi', 'hello', 'ei',
  'bom', 'boa', 'bomdia', 'boatarde', 'boanoite', 'tarde', 'noite', 'dia',
  'tudo', 'bem', 'td', 'beleza', 'blz', 'certo', 'suave', 'joia', 'jóia',
  'maya', 'maia', 'patrick', 'vc', 'voce', 'você'
]);

export function isGreetingOnly(message: string): boolean {
  const cleaned = message
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[!?.,;:]/g, ' ')
    .trim();

  if (!cleaned) return false;

  const tokens = cleaned.split(/\s+/).filter(Boolean);
  if (tokens.length === 0 || tokens.length > 8) return false;

  return tokens.every((token) => GREETING_WORDS.has(token));
}

function buildGreetingReply(project: Project | null, conscience: ConscienceData): string {
  const creatorName = conscience?.canal?.criador || 'Patrick';
  const hour = new Date().getHours();
  const saudacao = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  const projectLine = project
    ? `Vi que o projeto **"${project.nome}"** está rolando, parado na Etapa ${project.etapaAtual}. Seguimos nele ou você quer começar outro vídeo hoje?`
    : `Ainda não tem nenhum projeto ativo. Qual jogo vamos gravar hoje — quer começar um projeto novo ou já tem um bruto pronto pra editar?`;

  return `${saudacao}, ${creatorName}! Aqui é a Maya. ${projectLine}`;
}

async function buildLinkInsights(message: string): Promise<string> {
  const urls = extractUrls(message);
  if (urls.length === 0) return '';

  const insights = await Promise.all(
    urls.slice(0, 3).map(async (url) => {
      const info = await summarizeUrl(url);
      return info ? `- ${info}` : `- ${url}`;
    })
  );

  return [`Links detectados no texto:`, ...insights].join('\n');
}

function extractUrls(message: string): string[] {
  const matches = message.match(/https?:\/\/[^\s)]+/gi) || [];
  return [...new Set(matches.map((url) => url.trim().replace(/[>,.;]+$/, '')))].filter(Boolean);
}

async function summarizeUrl(url: string): Promise<string> {
  const normalized = normalizeUrl(url);

  try {
    if (isYouTubeUrl(normalized)) {
      const oembed = await fetchYouTubeOEmbed(normalized);
      if (oembed) return `YouTube: ${oembed.title} | Canal/autor: ${oembed.author_name}${oembed.thumbnail_url ? ` | Thumb: ${oembed.thumbnail_url}` : ''}`;
    }

    const readable = await fetchReadablePage(normalized);
    if (readable) return readable;
  } catch (error) {
    console.warn('Falha ao resumir URL:', error);
  }

  return normalized;
}

function normalizeUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

function isYouTubeUrl(url: string): boolean {
  return /(^|\.)youtube\.com|youtu\.be/i.test(url);
}

async function fetchYouTubeOEmbed(url: string): Promise<{ title: string; author_name: string; thumbnail_url?: string } | null> {
  const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
  const response = await fetch(endpoint);
  if (!response.ok) return null;

  const data = await response.json().catch(() => null);
  if (!data?.title || !data?.author_name) return null;

  return {
    title: data.title,
    author_name: data.author_name,
    thumbnail_url: data.thumbnail_url
  };
}

async function fetchReadablePage(url: string): Promise<string | null> {
  const proxyUrl = `https://r.jina.ai/http://${url.replace(/^https?:\/\//i, '')}`;
  const response = await fetch(proxyUrl);
  if (!response.ok) return null;

  const text = await response.text();
  const trimmed = text
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 18)
    .join(' ')
    .slice(0, 900);

  return trimmed ? `Resumo da página: ${trimmed}` : null;
}

async function callBackendAPI(backendUrl: string, model: string | undefined, system: string, prompt: string): Promise<string> {
  const base = backendUrl.replace(/\/+$/, '');
  const response = await fetch(`${base}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ system, prompt, model })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error || `Erro HTTP ${response.status} ao chamar o backend`);
  }

  const data = await response.json();
  return data.text || 'Sem resposta de texto gerada.';
}

async function callAnthropicAPI(apiKey: string, model: string, prompt: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: model,
      max_tokens: 3500,
      system: MAYA_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Erro HTTP ${response.status}`);
  }

  const data = await response.json();
  const textBlock = data.content?.find((b: any) => b.type === 'text');
  return textBlock?.text || 'Sem resposta de texto gerada.';
}

async function callGeminiAPI(apiKey: string, model: string, prompt: string): Promise<string> {
  const modelName = model || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey.trim()}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${MAYA_SYSTEM_PROMPT}\n\n${prompt}` }] }]
    })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Erro Gemini API (${response.status}): ${response.statusText}`);
  }

  const data = await response.json();
  const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!replyText) {
    throw new Error('A API do Gemini respondeu, mas não gerou nenhum texto.');
  }

  return replyText;
}

async function callOpenAIAPI(apiKey: string, model: string, prompt: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: MAYA_SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Erro OpenAI: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'Sem resposta gerada.';
}

async function callAnthropicChatAPI(apiKey: string, model: string, prompt: string): Promise<string> {
  return callAnthropicAPI(apiKey, model, prompt);
}

async function callGeminiChatAPI(apiKey: string, model: string, prompt: string): Promise<string> {
  return callGeminiAPI(apiKey, model, prompt);
}

async function callOpenAIChatAPI(apiKey: string, model: string, prompt: string): Promise<string> {
  return callOpenAIAPI(apiKey, model, prompt);
}

async function generateSimulatedResponse(
  project: Project,
  stage: EtapaNumero,
  conscience: ConscienceData,
  feedback?: string
): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const game = project.jogo || 'Palworld';
  const idea = project.briefingInicial.ideiaCentral || `Como dominar ${game} do zero`;
  const creator = conscience.canal.criador || 'Patrick';

  if (stage === 1) {
    return `
# 🧭 Briefing de Produção — Maya v4.2

Fala **${creator}**! Analisei o projeto **"${project.nome}"** focado em **${game}**. Aqui está o mapa tático para o vídeo:

---

### 🎯 Escopo e Posicionamento
- **Jogo / Tema Central:** ${game}
- **Ideia Base:** ${idea}
- **Público Prioritário:** Gamers buscando eficiência rápida e estratégias que realmente funcionam sem enrolação.
- **Objetivo do Vídeo:** Gerar autoridade, alto engajamento inicial e média de retenção acima de 50%.
- **Duração Ideal Estimada:** ~12 a 15 minutos (tempo perfeito para entrega de valor contínuo e múltiplos picos de retenção).

---

### ⚡ Estratégia de Entrega
1. **Promessa Inicial Irrecusável:** Demonstrar o resultado final nos primeiros 10 segundos para gerar ancoragem visual.
2. **Eliminação de Fricção:** Dividir o conteúdo em 3 etapas práticas, garantindo que o espectador aprenda a primeira dica antes do minuto 03:00.
3. **Fator Replay:** Destacar uma dica de ouro exclusiva no final para aumentar o tempo médio de visualização.

> 💡 **Nota da Maya:** O nicho de ${game} responde muito bem a tutoriais que poupam tempo de grind do jogador. Estamos no caminho certo!

${stageFeedbackNote(feedback)}
`.trim();
  }

  if (stage === 2) {
    return `
# ✨ Ângulo & Premissa Única

Para garantir que este vídeo se destaque dos outros canais de **${game}**, estruturei o ângulo com base nos princípios de alta retenção do canal:

---

### 🚀 A Grande Premissa
> **"A rota mais rápida e inteligente que 90% dos jogadores ignoram porque estão jogando no piloto automático."**

### 🔑 Os 3 Pilares do Diferencial
1. **O Gancho de Quebra de Padrão:** Em vez de explicar a teoria, já começamos com a comparação ao vivo do método convencional vs. o método otimizado do Trick Gamer.
2. **Economia Real de Tempo:** Foco em quantificar o ganho para o espectador (*"Isso vai te poupar 15 horas de farm desnecessário"*).
3. **O Elemento Surpresa:** Um detalhe de gameplay/configuração que os tutoriais gringos não mostram.

---

### 🎬 O Tom da Narrativa
Energético, empolgado e com foco no resultado. Sem introduções mornas — já começamos no meio da ação!

${stageFeedbackNote(feedback)}
`.trim();
  }

  if (stage === 3) {
    return `
# 🔥 5 Fórmulas de Títulos de Alto CTR

Utilizando as fórmulas vencedoras da Consciência do **Trick Gamer 112**, aqui estão as 5 melhores opções categorizadas:

---

### 🥇 Opção 1 (Fórmula: Alerta & Erro Comum) — *CTR Estimado: 12.4%*
> \`PARE de Jogar ${game} Assim! (Faça Isso em Vez Disso)\`
- **Gatilho:** Medo de estar jogando errado + curiosidade instantânea.
- **Tamanho:** 54 caracteres (perfeito para mobile).

### 🥈 Opção 2 (Fórmula: O Segredo que 99% Ignora) — *CTR Estimado: 11.9%*
> \`O Segredo de ${game} que 99% dos Jogadores Não Sabem!\`
- **Gatilho:** Exclusividade e sentimento de vantagem sobre os outros jogadores.

### 🥉 Opção 3 (Fórmula: Economia de Tempo & Velocidade) — *CTR Estimado: 11.2%*
> \`Como Ficar Absurdamente Forte em ${game} em Menos de 10 Minutos\`
- **Gatilho:** Benefício prático imediato e promessa de rapidez.

### 4️⃣ Opção 4 (Fórmula: Desafio Extremo) — *CTR Estimado: 10.7%*
> \`Fiz o Maior Teste de ${game} para que Você Não Precise!\`
- **Gatilho:** Curiosidade de ver o experimento e o desfecho.

### 5️⃣ Opção 5 (Fórmula: Guia Definitivo Direto) — *CTR Estimado: 10.3%*
> \`Guia Completo de ${game}: Do Zero ao Nível Máximo Sem Sofrer!\`
- **Gatilho:** Solução definitiva e abrangente.

---

⭐ **Recomendação da Maya:** A **Opção 1** ou a **Opção 3** são as mais fortes para o público atual do canal!

${stageFeedbackNote(feedback)}
`.trim();
  }

  if (stage === 4) {
    return `
# 🎨 Conceitos Estratégicos de Thumbnail

Baseado no padrão de Thumbs Vencedoras da Consciência (Cores **Pulse #8B5CF6** e **Signal #2EE6D6** com alto contraste):

---

### 🖼️ Conceito Principal (Recomendado)
- **Composição Visual:**
  - **Lado Esquerdo:** O Patrick com expressão de choque/foco, recortado com contorno sutil em **Ciano (#2EE6D6)**.
  - **Lado Direito:** O elemento/item mais impressionante de ${game} com brilho neon roxo ao fundo e leve desfoque de movimento.
  - **Centro/Topo:** Uma seta estilizada amarela apontando para o segredo.
- **Texto na Imagem (Máx 3 palavras):** \`NÃO FAÇA ISSO!\` ou \`PROIBIDO!\` em fonte grossa, amarelo/branco com sombra preta pesada.
- **Prompt para IA/Gerador de Imagens:**
  \`cinematic gameplay closeup of ${game}, rare legendary glowing item in center, purple and cyan neon rim lighting, intense depth of field, 8k render, high contrast, vibrant youtube thumbnail style --ar 16:9\`

---

### 🖼️ Conceito Alternativo: Comparação Dividida (Antes vs Depois)
- **Lado Esquerdo:** "Jeito Normal" (desbotado, personagem fraco, ícone de X vermelho).
- **Lado Direito:** "Jeito Trick Gamer" (iluminado, personagem overpower, cores neon, ícone de check verde).
- **Texto na Imagem:** \`NÍVEL 1 vs 100\`

---

### 📋 Checklist de Validação Visual
- [x] Legibilidade testada em miniatura mobile (120px de largura).
- [x] Contraste de cores respeitando a paleta do canal.
- [x] O texto não tampa o contador de tempo do YouTube no canto inferior direito.

${stageFeedbackNote(feedback)}
`.trim();
  }

  if (stage === 5) {
    return `
# 📝 Roteiro Estruturado & Ganchos de Retenção

Aqui está a estrutura de roteiro formatada para alta retenção segundo a Consciência da Maya:

---

### ⏱️ BLOCO 1: O Gancho de Ouro (00:00 - 00:25)
- **Ação na Tela:** Gameplay acelerada mostrando o resultado épico da dica em menos de 3 segundos.
- **Fala Sugerida do ${creator}:**
  > *"Se você ainda está passando horas farmando em ${game}, você está perdendo tempo. Nesse vídeo eu vou te mostrar o método exato que multiplica seus resultados em 10 vezes, e a primeira coisa que você precisa mudar está bem aqui..."*
- **Transição:** Corte seco com sound effect de "whoosh" e entrada direta no primeiro passo.

---

### ⏱️ BLOCO 2: Primeira Vitória Rápida (00:25 - 03:00)
- **Objetivo:** Entregar uma dica prática de imediato para validar o clique do espectador.
- **Gameplay:** Passo a passo limpo na interface do jogo.
- **Gancho de Ponte (Cliffhanger):** *"Agora que você já garantiu isso, a próxima etapa é onde 90% das pessoas erram e perdem tudo..."*

---

### ⏱️ BLOCO 3: O Núcleo da Estratégia (03:00 - 07:30)
- **Desenvolvimento:** Aprofundamento do método, truques de navegação e automação.
- **Momento do CTA Inteligente (~05:00):**
  > *"Se essa dica já te economizou tempo, esmaga o like! Porque o que eu vou te mostrar agora no minuto 07 vai mudar completamente seu jogo."*

---

### ⏱️ BLOCO 4: A Dica Mestre & Conclusão (07:30 - Final)
- **Clímax:** Revelação do segredo mais valioso.
- **Chamada Final:** Indicar o próximo vídeo da tela final com gancho temático complementar.

${stageFeedbackNote(feedback)}
`.trim();
  }

  if (stage === 6) {
    return `
# 🎙️ Checklist de Gravação & Dicas de Captura

Antes de apertar o REC no OBS, certifique-se de validar os seguintes pontos técnicos e criativos:

---

### ⚙️ Checklist Técnico de Bordo
- [ ] **OBS Studio:** Captura do jogo a 1080p60fps / 1440p com bitrate mínimo de 18.000 Kbps.
- [ ] **Áudio Separado:** Faixa 1 (Microfone) e Faixa 2 (Som do Jogo) em trilhas independentes.
- [ ] **Nível de Microfone:** Picos entre -6dB e -3dB (sem clipar/distorcer).
- [ ] **Iluminação:** Luz principal iluminando o rosto com contraste nas sombras.

---

### 🎮 Dicas de Performance durante a Gameplay
1. **Energia Constante:** Mantenha a empolgação 10% acima do tom de conversa normal.
2. **Narração em Tempo Real:** Evite silêncios longos durante menus ou caminhadas pelo mapa.
3. **Capture os 'B-Rolls':** Ao final da sessão, grave 30 segundos de takes cinematográficos de câmera livre para usar como inserções na edição.

${stageFeedbackNote(feedback)}
`.trim();
  }

  if (stage === 7) {
    return `
# 🎬 Guia de Edição & Ritmo Dinâmico

Orientações para transformar a gravação bruta em um vídeo eletrizante do **Trick Gamer 112**:

---

### ✂️ Regras de Corte e Ritmo
1. **Corte 'Jump Cut' nos Silêncios:** Elimine todas as respirações mortas e pausas de carregamento.
2. **Zooms Dinâmicos:** A cada 8-12 segundos, aplique um zoom sutil (110%) para mudar a escala e reter a atenção visual.
3. **Inserções Gráficas:** Adicione pop-ups de setas, círculos neon e palavras-chave na tela nos momentos de explicação técnica.

---

### 🔊 Sound Design & Trilha Sonora
- **Volume da Trilha:** -22dB sob a voz principal.
- **Momentos de Clímax:** Subir a música para -12dB em transições e momentos de vitória.
- **SFX Chave:** 'Whoosh' em trocas de cena, 'Pop' em aparição de textos, 'Impact/Thud' em momentos de choque.

${stageFeedbackNote(feedback)}
`.trim();
  }

  if (stage === 8) {
    return `
# 🔍 SEO, Descrição Otimizada & Capítulos

Metadados prontos para maximizar o ranqueamento no algoritmo do YouTube:

---

### 📄 Descrição Otimizada (Pronta para Copiar):
\`\`\`text
Descubra como dominar ${game} com as melhores dicas, segredos e estratégias que vão acelerar sua evolução no jogo! Neste guia completo do Trick Gamer 112, você vai aprender o passo a passo definitivo para poupar horas de farm.

🕒 CAPÍTULOS DO VÍDEO:
00:00 - O Segredo que Ninguém Te Contou
01:15 - Configuração Inicial Essencial
03:40 - O Método Mais Rápido de Evolução
06:20 - Dica de Ouro (Não Cometa Esse Erro)
09:50 - Conclusão e Resultado Final

🎮 Jogo: ${game}
🔔 Inscreva-se no canal para não perder os próximos guias e gameplay!

#${game.replace(/\s+/g, '')} #TrickGamer112 #Dicas${game.replace(/\s+/g, '')} #Games
\`\`\`

---

### 🏷️ Tags Recomendadas (Separadas por vírgula):
\`${game}, ${game} dicas, como jogar ${game}, guia ${game}, ${game} tutorial, segredos de ${game}, trick gamer 112, ${game} 2026, gameplay ${game}\`

${stageFeedbackNote(feedback)}
`.trim();
  }

  if (stage === 9) {
    return `
# 🚀 Checklist Final de Publicação

Tudo pronto para o lançamento! Siga o checklist de publicação para garantir a melhor entrega:

---

### 📌 Comentário Fixado Recomendado:
> *"Qual dessas dicas de ${game} você achou mais útil? Comenta aqui embaixo se você já conhecia esse segredo! 👇 (Não esquece de deixar o like para apoiar o canal!)"*

---

### 📋 Checklist de Postagem:
- [ ] Vídeo renderizado e enviado ao YouTube Studio em alta definição.
- [ ] Thumbnail oficial com alto contraste anexada.
- [ ] Título aprovado e descrição com capítulos preenchidos.
- [ ] Cards adicionados aos 04:30 e 08:15.
- [ ] Tela Final configurada com "Melhor para o Espectador" + Botão de Inscrever-se.
- [ ] Melhor horário de publicação: **Terça/Quinta/Sábado às 18:30**.

${stageFeedbackNote(feedback)}
`.trim();
  }

  if (stage === 10) {
    return `
# 🧠 Análise Pós-Publicação & Atualização da Consciência

Etapa final do ciclo! Aqui analisamos o desempenho real do vídeo para enriquecer a base de conhecimento da **Maya**.

---

### 📊 Painel de Metas do Canal:
- **Meta de CTR:** > 10.0% (Excelente: > 12.0%)
- **Meta de Retenção (AVD):** > 45.0% (Excelente: > 52.0%)

---

### 📝 Próximos Passos:
Preencha os números reais coletados no YouTube Studio no formulário abaixo (Visualizações, CTR, AVD e aprendizados) e clique em **"Gravar na Consciência"** para finalizar o projeto e consolidar o aprendizado da Maya!

${stageFeedbackNote(feedback)}
`.trim();
  }

  return `Saída gerada para a Etapa ${stage}.`;
}

async function generateSimulatedChatReply(
  _project: Project,
  stage: EtapaNumero,
  userMessage: string,
  attachments: ConversationAttachment[] = []
): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 350));

  const message = userMessage.toLowerCase();

  if (attachments.length > 0) {
    return `Recebi ${attachments.length} anexo(s). Vou usar isso como referência para melhorar a produção dessa etapa. Se quiser, me diga o que você quer mudar nesses prints e eu já te devolvo uma sugestão mais certeira.`;
  }

  if (message.includes('segredo')) {
    return `Perfeito. Eu puxaria o foco para a revelação do "segredo" logo no começo e deixaria a mensagem mais curta e mais agressiva. Quer que eu ajuste o texto para ficar mais clickável?`;
  }

  if (message.includes('thumb') || message.includes('miniatura') || message.includes('imagem')) {
    return `Boa. Para a thumb, eu deixaria o elemento principal mais central e aumentaria o contraste do ponto que você quer destacar. Se quiser, eu posso reforçar isso na próxima versão desta etapa.`;
  }

  if (message.includes('título') || message.includes('titulo')) {
    return `Fechado. Eu deixaria o título mais direto e com um gatilho de curiosidade mais forte. Se quiser, eu posso te sugerir 3 variações mais afiadas agora.`;
  }

  return `Entendi. Eu ajustaria essa parte para ficar mais objetiva e mais alinhada com o resultado que você quer na Etapa ${stage}. Se quiser, me fala o detalhe exato e eu refino mais.`;
}

function stageFeedbackNote(feedback?: string): string {
  if (!feedback) return '';
  return `\n> 🔄 **Ajustes aplicados com base no seu feedback:** *" ${feedback} "*\n`;
}