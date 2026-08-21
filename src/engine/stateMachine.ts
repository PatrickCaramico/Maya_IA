import type { Project, EtapaNumero, FlowMode, StageData, StageApprovalLog, ConversationMessage, ConversationAttachment } from '../types/project';
import { STAGES_CONFIG } from '../data/stageDefinitions';

/**
 * Cria a estrutura inicial de um novo projeto com as 10 etapas parametrizadas
 */
export function createNewProject(
  nome: string,
  jogo: string,
  nicho: string,
  ideiaCentral: string,
  objetivoVideo: string,
  tempoEstimadoMinutos: number = 12,
  modoFluxo: FlowMode = 'projeto_novo'
): Project {
  const id = `${new Date().toISOString().slice(0, 10)}_${jogo.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Math.floor(Math.random() * 899 + 100)}`;
  const now = new Date().toISOString();

  let startingStage: EtapaNumero = 1;
  if (modoFluxo === 'atalho_bruto') startingStage = 6;
  if (modoFluxo === 'video_pronto') startingStage = 8;

  const etapas: Record<EtapaNumero, StageData> = {
    1: initStage(1, startingStage >= 1),
    2: initStage(2, startingStage >= 2),
    3: initStage(3, startingStage >= 3),
    4: initStage(4, startingStage >= 4),
    5: initStage(5, startingStage >= 5),
    6: initStage(6, startingStage >= 6),
    7: initStage(7, startingStage >= 7),
    8: initStage(8, startingStage >= 8),
    9: initStage(9, false),
    10: initStage(10, false)
  };

  // Se modo for atalho bruto, aprova de 1 a 5
  if (modoFluxo === 'atalho_bruto') {
    for (let i = 1; i <= 5; i++) {
      etapas[i as EtapaNumero].status = 'aprovado';
      etapas[i as EtapaNumero].saidaGerada = `*(Etapa ${i} dispensada pelo modo Atalho Bruto)*`;
    }
  }

  // Se modo for vídeo pronto, aprova de 1 a 7 e pula direto para SEO (Etapa 8)
  if (modoFluxo === 'video_pronto') {
    for (let i = 1; i <= 7; i++) {
      etapas[i as EtapaNumero].status = 'aprovado';
      etapas[i as EtapaNumero].saidaGerada = `*(Etapa ${i} dispensada - Vídeo e Edição já concluídos)*`;
    }
  }

  return {
    id,
    nome: nome || `Vídeo ${jogo} #${Math.floor(Math.random() * 100)}`,
    jogo,
    nicho,
    modoFluxo,
    etapaAtual: startingStage,
    status: 'em_andamento',
    criadoEm: now,
    atualizadoEm: now,
    briefingInicial: {
      ideiaCentral,
      objetivoVideo,
      tempoEstimadoMinutos
    },
    etapas,
    checklistGeral: {},
    historicoAprovacoes: []
  };
}

function initStage(numero: EtapaNumero, isCurrentOrPassed: boolean): StageData {
  return {
    etapa: numero,
    nome: STAGES_CONFIG[numero].nome,
    status: isCurrentOrPassed ? 'em_andamento' : 'bloqueado',
    feedbackHistorico: []
  };
}

/**
 * Valida e executa a APROVAÇÃO de uma etapa (§4 e §6.1)
 */
export function approveCurrentStage(project: Project, feedback?: string): Project {
  const currentStageNum = project.etapaAtual;
  const currentStage = project.etapas[currentStageNum];

  if (!currentStage || !currentStage.saidaGerada) {
    throw new Error('Não é possível aprovar uma etapa sem conteúdo gerado.');
  }

  const now = new Date().toISOString();

  // Log de aprovação
  const log: StageApprovalLog = {
    id: `app_${Date.now()}`,
    etapa: currentStageNum,
    tipo: 'aprovado',
    feedback,
    timestamp: now
  };

  // Atualiza etapa aprovada
  const updatedStages = { ...project.etapas };
  updatedStages[currentStageNum] = {
    ...currentStage,
    status: 'aprovado',
    aprovadoEm: now
  };

  const nextStageNum = (currentStageNum < 10 ? (currentStageNum + 1) : 10) as EtapaNumero;
  let newProjectStatus = project.status;

  if (currentStageNum === 10) {
    newProjectStatus = 'concluido';
  } else {
    // Desbloqueia próxima etapa
    updatedStages[nextStageNum] = {
      ...updatedStages[nextStageNum],
      status: 'em_andamento'
    };
  }

  return {
    ...project,
    etapaAtual: nextStageNum,
    status: newProjectStatus,
    atualizadoEm: now,
    etapas: updatedStages,
    historicoAprovacoes: [log, ...project.historicoAprovacoes]
  };
}

/**
 * Registra solicitação de alterações
 */
export function requestStageChanges(project: Project, feedback: string): Project {
  const currentStageNum = project.etapaAtual;
  const currentStage = project.etapas[currentStageNum];
  const now = new Date().toISOString();

  const log: StageApprovalLog = {
    id: `chg_${Date.now()}`,
    etapa: currentStageNum,
    tipo: 'alterado',
    feedback,
    timestamp: now
  };

  const updatedStages = { ...project.etapas };
  updatedStages[currentStageNum] = {
    ...currentStage,
    feedbackHistorico: [...(currentStage.feedbackHistorico || []), feedback]
  };

  return {
    ...project,
    atualizadoEm: now,
    etapas: updatedStages,
    historicoAprovacoes: [log, ...project.historicoAprovacoes]
  };
}

/**
 * Refaz a etapa atual do zero
 */
export function remakeStage(project: Project): Project {
  const currentStageNum = project.etapaAtual;
  const currentStage = project.etapas[currentStageNum];
  const now = new Date().toISOString();

  const log: StageApprovalLog = {
    id: `rem_${Date.now()}`,
    etapa: currentStageNum,
    tipo: 'refeito',
    timestamp: now
  };

  const updatedStages = { ...project.etapas };
  updatedStages[currentStageNum] = {
    ...currentStage,
    saidaGerada: undefined,
    status: 'em_andamento'
  };

  return {
    ...project,
    atualizadoEm: now,
    etapas: updatedStages,
    historicoAprovacoes: [log, ...project.historicoAprovacoes]
  };
}

/**
 * Volta com segurança para uma etapa anterior já desbloqueada
 */
export function goBackToStage(project: Project, targetStage: EtapaNumero): Project {
  if (targetStage > project.etapaAtual) {
    throw new Error('Não é possível avançar para uma etapa não aprovada.');
  }

  const now = new Date().toISOString();
  return {
    ...project,
    etapaAtual: targetStage,
    atualizadoEm: now
  };
}

/**
 * Atualiza o conteúdo gerado de uma etapa
 */
export function updateStageOutput(project: Project, stage: EtapaNumero, content: string): Project {
  const currentStage = project.etapas[stage];
  const updatedStages = { ...project.etapas };
  
  updatedStages[stage] = {
    ...currentStage,
    saidaGerada: content,
    status: currentStage.status === 'bloqueado' ? 'em_andamento' : currentStage.status
  };

  return {
    ...project,
    atualizadoEm: new Date().toISOString(),
    etapas: updatedStages
  };
}

/**
 * Alterna item de checklist
 */
export function toggleProjectChecklist(project: Project, itemId: string): Project {
  const current = !!project.checklistGeral[itemId];
  return {
    ...project,
    atualizadoEm: new Date().toISOString(),
    checklistGeral: {
      ...project.checklistGeral,
      [itemId]: !current
    }
  };
}

/**
 * Adiciona uma troca de conversa na etapa atual.
 */
export function appendStageConversation(
  project: Project,
  stage: EtapaNumero,
  userMessage: string,
  mayaMessage: string,
  attachments: ConversationAttachment[] = []
): Project {
  const currentStage = project.etapas[stage];
  const now = new Date().toISOString();

  const userEntry: ConversationMessage = {
    id: `chat_user_${Date.now()}`,
    role: 'user',
    content: userMessage,
    timestamp: now,
    attachments
  };

  const mayaEntry: ConversationMessage = {
    id: `chat_maya_${Date.now()}`,
    role: 'maya',
    content: mayaMessage,
    timestamp: now
  };

  return {
    ...project,
    atualizadoEm: now,
    etapas: {
      ...project.etapas,
      [stage]: {
        ...currentStage,
        conversation: [...(currentStage.conversation || []), userEntry, mayaEntry]
      }
    }
  };
}
