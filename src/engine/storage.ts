import type { Project, VideoMetrics } from '../types/project';
import type { ConscienceData, VideoHistoryItem } from '../types/conscience';
import { DEFAULT_CONSCIENCE } from '../data/defaultConscience';
import type { AISettings } from './aiService';
import { DEFAULT_AI_SETTINGS } from './aiService';

const STORAGE_KEYS = {
  PROJECTS: 'maya_projects_v4_2',
  ACTIVE_PROJECT_ID: 'maya_active_project_id_v4_2',
  CONSCIENCE: 'maya_conscience_v4_2',
  SETTINGS: 'maya_settings_v4_2'
};

/**
 * Carrega todos os projetos salvos
 */
export function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Erro ao carregar projetos:', e);
    return [];
  }
}

/**
 * Salva a lista de projetos
 */
export function saveProjects(projects: Project[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  } catch (e) {
    console.error('Erro ao salvar projetos:', e);
  }
}

/**
 * Salva ou atualiza um único projeto
 */
export function saveSingleProject(project: Project): void {
  const all = loadProjects();
  const index = all.findIndex(p => p.id === project.id);
  if (index >= 0) {
    all[index] = project;
  } else {
    all.unshift(project);
  }
  saveProjects(all);
}

/**
 * Carrega o ID do projeto ativo
 */
export function loadActiveProjectId(): string | null {
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_PROJECT_ID);
}

/**
 * Salva o ID do projeto ativo
 */
export function saveActiveProjectId(id: string | null): void {
  if (id) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT_ID, id);
  } else {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_PROJECT_ID);
  }
}

/**
 * Carrega a Consciência viva do canal
 */
export function loadConscience(): ConscienceData {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONSCIENCE);
    if (!raw) {
      saveConscience(DEFAULT_CONSCIENCE);
      return DEFAULT_CONSCIENCE;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Erro ao carregar consciência:', e);
    return DEFAULT_CONSCIENCE;
  }
}

/**
 * Salva a Consciência
 */
export function saveConscience(conscience: ConscienceData): void {
  try {
    conscience.atualizadoEm = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.CONSCIENCE, JSON.stringify(conscience));
  } catch (e) {
    console.error('Erro ao salvar consciência:', e);
  }
}

/**
 * Carrega configurações de IA
 */
export function loadAISettings(): AISettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_AI_SETTINGS;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_AI_SETTINGS;
  }
}

/**
 * Salva configurações de IA
 */
export function saveAISettings(settings: AISettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Erro ao salvar configurações de IA:', e);
  }
}

/**
 * Regra de escrita da Etapa 10 (§7.3 da especificação):
 * Atualiza o histórico e refina os aprendizados da Consciência com os resultados reais do vídeo.
 */
export function recordMetricsToConscience(
  project: Project,
  metrics: VideoMetrics,
  newLearning?: string
): ConscienceData {
  const currentConscience = loadConscience();

  const historyEntry: VideoHistoryItem = {
    id: `hist_${project.id}`,
    tituloFinal: project.etapas[3]?.saidaGerada?.split('\n')[0]?.replace(/[#*`]/g, '').trim() || project.nome,
    jogo: project.jogo,
    dataPublicacao: metrics.dataColeta || new Date().toISOString().slice(0, 10),
    duracaoMinutos: metrics.duracaoMinutos,
    views: metrics.views,
    ctr: metrics.ctr,
    avd: metrics.avd,
    oQueDeuCerto: metrics.licoesAprendidas || ['Excelente ritmo nos primeiros minutos'],
    oQueMelhorar: metrics.observacoes ? [metrics.observacoes] : [],
    aprendizadoParaConsciencia: newLearning || `Vídeo de ${project.jogo} alcançou CTR de ${metrics.ctr}% e retenção de ${metrics.avd}%.`
  };

  // Se o CTR foi excepcional (> 11.5%), reforça regra de título/thumb
  const updatedLearnings = { ...currentConscience.aprendizados };
  if (metrics.ctr >= 11.5 && newLearning) {
    updatedLearnings.regrasDeOuro.push(`[Aprendizado de Alto CTR]: ${newLearning}`);
  }

  const updatedConscience: ConscienceData = {
    ...currentConscience,
    aprendizados: updatedLearnings,
    historicoVideos: [historyEntry, ...currentConscience.historicoVideos],
    atualizadoEm: new Date().toISOString()
  };

  saveConscience(updatedConscience);
  return updatedConscience;
}
