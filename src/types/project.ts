export type EtapaNumero = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type FlowMode = 'projeto_novo' | 'atalho_bruto' | 'video_pronto';

export type ProjectStatus = 'em_andamento' | 'pausado' | 'concluido' | 'cancelado';

export type ApprovalType = 'aprovado' | 'alterado' | 'refeito' | 'avancado';

export interface ConversationMessage {
  id: string;
  role: 'user' | 'maya';
  content: string;
  timestamp: string;
  attachments?: ConversationAttachment[];
}

export interface ConversationAttachment {
  id: string;
  name: string;
  type: string;
  dataUrl?: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  concluido: boolean;
  obrigatorio?: boolean;
}

export interface StageApprovalLog {
  id: string;
  etapa: EtapaNumero;
  tipo: ApprovalType;
  feedback?: string;
  timestamp: string;
}

export interface StageData {
  etapa: EtapaNumero;
  nome: string;
  status: 'bloqueado' | 'em_andamento' | 'aprovado';
  saidaGerada?: string; // Markdown gerado pela Maya
  dadosEspecificos?: Record<string, any>; // ex: títulos escolhidos, prompts de thumb, checklist de gravação
  feedbackHistorico?: string[];
  conversation?: ConversationMessage[];
  aprovadoEm?: string;
}

export interface VideoMetrics {
  views: number;
  ctr: number; // Porcentagem, ex: 11.4
  avd: number; // Porcentagem de retenção média, ex: 52.0
  duracaoMinutos: number;
  curtidas?: number;
  comentarios?: number;
  dataColeta: string;
  observacoes?: string;
  licoesAprendidas?: string[];
}

export interface Project {
  id: string;
  nome: string;
  jogo: string;
  nicho?: string;
  modoFluxo: FlowMode;
  etapaAtual: EtapaNumero;
  status: ProjectStatus;
  criadoEm: string;
  atualizadoEm: string;
  
  // Dados de entrada iniciais
  briefingInicial: {
    ideiaCentral: string;
    objetivoVideo: string;
    tempoEstimadoMinutos?: number;
    publicoAlvo?: string;
  };
  
  // Saídas e estado de cada etapa (1 a 10)
  etapas: Record<EtapaNumero, StageData>;
  checklistGeral: Record<string, boolean>;
  historicoAprovacoes: StageApprovalLog[];
  
  // Métricas finais (Preenchido na Etapa 10)
  metricasFinais?: VideoMetrics;
}

export interface StageDefinition {
  numero: EtapaNumero;
  nome: string;
  icone: string;
  descricaoCurta: string;
  descricaoDetalhada: string;
  objetivoMaya: string;
  camposEntradaRecomendados?: {
    id: string;
    label: string;
    placeholder: string;
    tipo: 'text' | 'textarea' | 'select' | 'number';
    opcoes?: string[];
    obrigatorio?: boolean;
  }[];
  checklistsPadrao: string[];
  perguntasAprovacao: string;
  secoesConscienciaUtilizadas: string[];
}
