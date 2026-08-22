import type { ConversationAttachment, Project, EtapaNumero } from '../types/project';
import type { ConscienceData } from '../types/conscience';
import { buildChatContext, buildRestrictedContext, MAYA_SYSTEM_PROMPT } from './promptBuilder';

export interface AISettings {
  provider: 'simulated' | 'backend' | 'anthropic' | 'openai' | 'gemini';
  apiKey?: string;
  model?: string;
  backendUrl?: string;
}

export const DEFAULT_AI_SETTINGS: AISettings = {
  provider: 'simulated',
  apiKey: '',
  model: 'claude-3-7-sonnet-20250219',
  backendUrl: '/api'
};

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
      console.warn('Falha ao chamar o backend seguro, caindo para simulação:', err);
    }
  }

  if (settings.provider === 'gemini' && settings.apiKey) {
    try {
      return await callGeminiAPI(settings.apiKey, settings.model || 'gemini-2.0-flash', context);
    } catch (err: any) {
      console.warn('Falha na API Gemini, caindo para simulação:', err);
    }
  } else if (settings.provider === 'anthropic' && settings.apiKey) {
    try {
      return await callAnthropicAPI(settings.apiKey, settings.model || 'claude-3-7-sonnet-20250219', context);
    } catch (err: any) {
      console.warn('Falha na API Anthropic, caindo para simulação:', err);
    }
  } else if (settings.provider === 'openai' && settings.apiKey) {
    try {
      return await callOpenAIAPI(settings.apiKey, settings.model || 'gpt-4o', context);
    } catch (err: any) {
      console.warn('Falha na API OpenAI, caindo para simulação:', err);
    }
  }

  return generateSimulatedResponse(project, stage, conscience, feedback);
}

function buildGeneralChatContext(
  conscience: ConscienceData,
  userMessage: string,
  attachments: ConversationAttachment[] = []
): string {
  const creatorName = conscience?.canal?.criador || 'Patrick';
  const channelName = conscience?.canal?.nome || 'Trick Gamer 112';

  let attachmentContext = '';
  if (attachments.length > 0) {
    attachmentContext = `\n\n### ANEXOS ENVIADOS:\n` +
      attachments.map((a) => `- Arquivo: ${a.name} (${a.type})`).join('\n');
  }

  return `
Você é a Maya, co-produtora do canal "${channelName}" do criador ${creatorName}.
Você está em um CHAT GERAL LIVRE (sem um projeto específico selecionado).

SUA MISSÃO:
- Ajudar com ideias de vídeos, sugestões da biblioteca de jogos, planejamento de canal, estratégias de conteúdo ou dúvidas gerais.
- Responder de forma clara, prática e amigável.

MENSAGEM DO CRIADOR:
${userMessage}
${attachmentContext}
`.trim();
}

export async function generateMayaChatReply(
  project: Project | null,
  stage: EtapaNumero,
  conscience: ConscienceData,
  settings: AISettings,
  userMessage: string,
  attachments: ConversationAttachment[] = []
): Promise<string> {
  if (attachments.length === 0 && isGreetingOnly(userMessage)) {
    return buildGreetingReply(project, conscience);
  }

  const conversationPreview = project?.etapas[stage]?.conversation || [];
  const linkInsights = await buildLinkInsights(userMessage);
  const enrichedMessage = linkInsights
    ? `${userMessage}\n\n### LEITURA AUTOMÁTICA DE LINKS\n${linkInsights}`
    : userMessage;

  const context = project
    ? buildChatContext(project, stage, conscience, enrichedMessage, conversationPreview, attachments)
    : buildGeneralChatContext(conscience, enrichedMessage, attachments);

  if (settings.provider === 'backend' && settings.backendUrl) {
    try {
      return await callBackendAPI(settings.backendUrl, settings.model, MAYA_SYSTEM_PROMPT, context);
    } catch (err: any) {
      console.warn('Falha no Backend Seguro para chat, caindo para simulação:', err);
    }
  }

  if (settings.provider === 'gemini' && settings.apiKey) {
    try {
      return await callGeminiAPI(settings.apiKey, settings.model || 'gemini-2.0-flash', context);
    } catch (err: any) {
      console.error('Erro na chamada da API do Gemini para chat:', err);
      alert(`Aviso Gemini API: ${err.message || 'Falha ao conectar'}. Exibindo resposta simulada.`);
    }
  } else if (settings.provider === 'anthropic' && settings.apiKey) {
    try {
      return await callAnthropicAPI(settings.apiKey, settings.model || 'claude-3-7-sonnet-20250219', context);
    } catch (err: any) {
      console.warn('Falha na API Anthropic para chat, caindo para simulação:', err);
    }
  } else if (settings.provider === 'openai' && settings.apiKey) {
    try {
      return await callOpenAIAPI(settings.apiKey, settings.model || 'gpt-4o', context);
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
    : `Ainda não tem nenhum projeto ativo selecionado. Qual a boa pra hoje — quer discutir ideias de jogos, planejar o canal ou iniciar um novo projeto?`;

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
    return `# 🧭 Briefing de Produção — Maya\n\nFala **${creator}**! Analisei o projeto **"${project.nome}"** focado em **${game}**.\n\n### 🎯 Escopo\n- **Jogo:** ${game}\n- **Ideia:** ${idea}${stageFeedbackNote(feedback)}`;
  }

  return `Saída gerada para a Etapa ${stage}.`;
}

async function generateSimulatedChatReply(
  _project: Project | null,
  _stage: EtapaNumero,
  userMessage: string,
  attachments: ConversationAttachment[] = []
): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 350));

  if (attachments.length > 0) {
    return `Recebi ${attachments.length} anexo(s). Vou usar isso como referência para o nosso papo!`;
  }

  return `Entendi perfeitamente sua dúvida sobre "${userMessage}". Como estamos no modo geral, posso te ajudar com ideias de vídeos, jogos para gravar ou planejamento de canal. Quer focar em algum ponto específico?`;
}

function stageFeedbackNote(feedback?: string): string {
  if (!feedback) return '';
  return `\n> 🔄 **Ajustes aplicados:** *" ${feedback} "*\n`;
}