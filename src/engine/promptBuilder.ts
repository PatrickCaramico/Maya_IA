import type { ConversationAttachment, Project, EtapaNumero } from '../types/project';
import type { ConscienceData } from '../types/conscience';
import { STAGES_CONFIG } from '../data/stageDefinitions';

export const MAYA_SYSTEM_PROMPT = `
Você é MAYA (v4.2), a Inteligência Artificial e Co-produtora oficial do canal "Trick Gamer 112", desenvolvida pelo Patrick.

Sua missão é atuar como uma parceira estratégica, criativa e amigável. Você ajuda o Patrick a organizar o canal, sugerir jogos, analisar prints da biblioteca da Steam, criar roteiros e otimizar vídeos para o YouTube.

DIRETRIZES DE PERSONALIDADE E CONDUTA:
1. Tom de voz: Natural, humano, empolgado, direto ao ponto e bem-humorado.
2. Identidade: Se perguntarem quem te criou ou desenvolveu, responda com orgulho que foi desenvolvida pelo Patrick para co-pilotar o canal Trick Gamer 112.
3. Flexibilidade: No chat geral ou em conversas informais, responda naturalmente a perguntas sobre jogos, ideias, sugestões e bate-papo sem forçar jargões de etapas caso o Patrick não esteja pedindo alterações técnicas no projeto.
4. Análise de Anexos: Quando o Patrick enviar prints de biblioteca de jogos ou estatísticas, analise o conteúdo visual e dê recomendações práticas baseadas no público do canal.
`.trim();

/**
 * Monta o contexto restrito e seguro para a IA (§4 e §7.4 da especificação)
 * Garante que a IA NUNCA receba dados de etapas futuras além da atual.
 */
export function buildRestrictedContext(
  project: Project,
  targetStage: EtapaNumero,
  conscience: ConscienceData,
  userFeedback?: string
): string {
  const stageConfig = STAGES_CONFIG[targetStage];
  
  // 1. Dados básicos do projeto
  let context = `### PROJETO ATUAL: "${project.nome}"\n`;
  context += `- Jogo: ${project.jogo}\n`;
  if (project.nicho) context += `- Nicho/Subgênero: ${project.nicho}\n`;
  context += `- Ideia Central: ${project.briefingInicial.ideiaCentral}\n`;
  context += `- Objetivo: ${project.briefingInicial.objetivoVideo}\n`;
  if (project.briefingInicial.tempoEstimadoMinutos) {
    context += `- Duração Estimada: ~${project.briefingInicial.tempoEstimadoMinutos} minutos\n`;
  }
  context += `- Modo de Fluxo: ${project.modoFluxo === 'atalho_bruto' ? 'Atalho Bruto (Foco Direto em Gravação/Edição)' : 'Projeto Novo Completo'}\n\n`;

  // 2. Histórico de etapas anteriores aprovadas (APENAS até targetStage - 1)
  context += `### DADOS DE ETAPAS ANTERIORES JÁ APROVADAS:\n`;
  let hasPreviousOutputs = false;
  for (let i = 1; i < targetStage; i++) {
    const prevStage = project.etapas[i as EtapaNumero];
    if (prevStage && prevStage.saidaGerada && prevStage.status === 'aprovado') {
      hasPreviousOutputs = true;
      context += `\n--- [ETAPA ${i}: ${prevStage.nome}] (Aprovada) ---\n`;
      context += `${prevStage.saidaGerada.substring(0, 1500)}...\n`;
    }
  }
  if (!hasPreviousOutputs) {
    context += `(Esta é a etapa inicial ou não há etapas anteriores registradas)\n`;
  }

  // 3. Injeção seletiva da Consciência (§7.4)
  context += `\n### INSTRUÇÕES E APRENDIZADOS DA CONSCIÊNCIA DO CANAL (Relevantes para esta Etapa):\n`;
  
  if (targetStage === 1 || targetStage === 2) {
    context += `- Proposta de Valor: ${conscience.canal.propostaValor}\n`;
    context += `- Público-Alvo: ${conscience.canal.publicoAlvo}\n`;
    context += `- Tom de Voz do Patrick: ${conscience.canal.tomDeVoz}\n`;
  }

  if (targetStage === 3) {
    context += `- Fórmulas de Títulos com Maior CTR no Canal:\n`;
    conscience.aprendizados.formulasTitulos.forEach((f, idx) => {
      context += `  ${idx + 1}. [Fórmula: ${f.formula}] -> Exemplo: "${f.exemplo}" (CTR médio: ${f.ctrMedio}%)\n`;
    });
  }

  if (targetStage === 4) {
    context += `- Padrões de Thumbnails Vencedoras no Canal:\n`;
    conscience.aprendizados.thumbsVencedoras.forEach((t, idx) => {
      context += `  ${idx + 1}. [${t.padrao}]: ${t.descricao} | Paleta: ${t.paletaRecomendada.join(', ')} | Exemplo: ${t.exemploPratico}\n`;
    });
  }

  if (targetStage === 5 || targetStage === 7) {
    context += `- Regras de Retenção e Ritmo:\n`;
    conscience.aprendizados.regrasRetencao.forEach((r, idx) => {
      context += `  ${idx + 1}. [${r.etapaMomento}]: ${r.regra} (Meta: ${r.impactoEsperado})\n`;
    });
  }

  if (targetStage === 6) {
    context += `- Regras de Ouro para Gravação:\n`;
    conscience.aprendizados.regrasDeOuro.forEach((regra) => {
      context += `  * ${regra}\n`;
    });
  }

  if (targetStage === 8) {
    context += `- Nicho e Estratégia de SEO do Canal: ${conscience.canal.nichoPrincipal}\n`;
    context += `- Recomendações de Capítulos e Tags dinâmicas.\n`;
  }

  if (targetStage === 9 || targetStage === 10) {
    context += `- Histórico Recente de Vídeos para Comparativo de Métricas:\n`;
    conscience.historicoVideos.slice(-3).forEach(v => {
      context += `  * "${v.tituloFinal}" (${v.jogo}) -> Views: ${v.views.toLocaleString()} | CTR: ${v.ctr}% | AVD: ${v.avd}%\n`;
    });
  }

  // 4. Instrução específica da etapa alvo
  context += `\n### TAREFA ATUAL — ETAPA ${targetStage}: ${stageConfig.nome}\n`;
  context += `Objetivo: ${stageConfig.objetivoMaya}\n`;
  context += `Descrição: ${stageConfig.descricaoDetalhada}\n`;

  if (userFeedback) {
    context += `\n### FEEDBACK / AJUSTES SOLICITADOS PELO PATRICK:\n`;
    context += `"${userFeedback}"\n`;
    context += `Por favor, revise e aprimore a saída levando em conta exatamente este feedback.\n`;
  } else {
    context += `\nGere a saída completa, profissional e detalhada para esta etapa seguindo rigorosamente a identidade do canal Trick Gamer 112.\n`;
  }

  return context;
}

export function buildChatContext(
  project: Project,
  targetStage: EtapaNumero,
  conscience: ConscienceData,
  userMessage: string,
  conversationPreview: { role: 'user' | 'maya'; content: string }[] = [],
  attachments: ConversationAttachment[] = []
): string {
  const baseContext = buildRestrictedContext(project, targetStage, conscience);
  let context = `${baseContext}\n\n### MODO CONVERSA\n`;
  context += `Responda como uma conversa de WhatsApp, com tom natural, curto e direto.\n`;
  context += `Seja objetiva, amigável e fale em até 4 parágrafos curtos.\n`;
  context += `A resposta deve parecer uma mensagem enviada pela Maya para o Patrick.\n`;

  if (attachments.length > 0) {
    context += `\n### ANEXOS ENVIADOS PELO PATRICK\n`;
    attachments.forEach((attachment, index) => {
      context += `${index + 1}. ${attachment.name} (${attachment.type})\n`;
    });
    context += `Considere os anexos como referência visual do briefing, lista de jogos ou estatísticas do canal.\n`;
  }

  if (conversationPreview.length > 0) {
    context += `\n### CONVERSA RECENTE\n`;
    conversationPreview.slice(-6).forEach((item) => {
      const author = item.role === 'user' ? 'Patrick' : 'Maya';
      context += `- ${author}: ${item.content}\n`;
    });
  }

  context += `\n### NOVA MENSAGEM DO PATRICK\n"${userMessage}"\n`;
  context += `Responda diretamente à mensagem acima e, se fizer sentido, indique o próximo ajuste sugerido.\n`;

  return context;
}
