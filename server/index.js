/**
 * MAYA — Backend seguro
 * -----------------------------------------------------------------------
 * Este servidor existe por um motivo só: guardar a chave de API da Anthropic
 * fora do navegador. O frontend nunca vê a chave — ele só chama esta rota
 * (/api/generate), e é este processo Node, rodando no seu servidor, que
 * conversa com a Anthropic usando a chave lida da variável de ambiente
 * ANTHROPIC_API_KEY.
 *
 * Como rodar:
 *   1. Copie server/.env.example para server/.env e preencha sua chave real
 *   2. npm install
 *   3. npm run server
 *
 * Em produção, troque ALLOWED_ORIGIN pelo domínio real do site (nunca "*").
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();

const PORT = process.env.PORT || 8787;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';
const DEFAULT_MODEL = 'claude-3-7-sonnet-20250219';

if (!ANTHROPIC_API_KEY) {
  console.warn(
    '[Maya backend] ATENÇÃO: ANTHROPIC_API_KEY não configurada em server/.env — ' +
    'as chamadas vão falhar até você preencher esse arquivo.'
  );
}

app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json({ limit: '2mb' }));

/**
 * Rate limit simples em memória (por IP), só para evitar abuso básico
 * enquanto o site é pequeno. Para produção com tráfego real, troque por um
 * rate limiter dedicado (ex: express-rate-limit + Redis).
 */
const requestLog = new Map();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 30;

function isRateLimited(ip) {
  const now = Date.now();
  const entry = requestLog.get(ip) || { count: 0, windowStart: now };

  if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    entry.count = 0;
    entry.windowStart = now;
  }

  entry.count += 1;
  requestLog.set(ip, entry);
  return entry.count > RATE_LIMIT_MAX_REQUESTS;
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, hasApiKey: Boolean(ANTHROPIC_API_KEY) });
});

app.post('/api/generate', async (req, res) => {
  const ip = req.ip;

  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Muitas requisições em pouco tempo. Aguarde um instante.' });
  }

  const { system, prompt, model } = req.body || {};

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Campo "prompt" é obrigatório e deve ser texto.' });
  }

  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada no servidor. Preencha server/.env.' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model || DEFAULT_MODEL,
        max_tokens: 3500,
        system: system || undefined,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData?.error?.message || `Erro HTTP ${response.status} na API da Anthropic`;
      return res.status(response.status).json({ error: message });
    }

    const data = await response.json();
    const textBlock = (data.content || []).find((block) => block.type === 'text');

    return res.json({ text: textBlock?.text || 'Sem resposta de texto gerada.' });
  } catch (err) {
    console.error('[Maya backend] Erro ao chamar a Anthropic:', err);
    return res.status(502).json({ error: 'Falha ao se comunicar com a API da Anthropic.' });
  }
});

app.listen(PORT, () => {
  console.log(`[Maya backend] Rodando em http://localhost:${PORT}`);
  console.log(`[Maya backend] Origem permitida (CORS): ${ALLOWED_ORIGIN}`);
});
