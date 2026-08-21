export interface ThumbPattern {
  id: string;
  padrao: string;
  descricao: string;
  ctrMedioObservado: number; // ex: 10.5%
  elementosChave: string[];
  paletaRecomendada: string[];
  exemploPratico: string;
}

export interface TitleFormula {
  id: string;
  formula: string;
  exemplo: string;
  ctrMedio: number;
  gatilhoEmocional: string;
  quandoUsar: string;
}

export interface RetentionRule {
  id: string;
  etapaMomento: string;
  regra: string;
  impactoEsperado: string;
  exemploPratico: string;
}

export interface VideoHistoryItem {
  id: string;
  tituloFinal: string;
  jogo: string;
  dataPublicacao: string;
  duracaoMinutos: number;
  views: number;
  ctr: number;
  avd: number;
  oQueDeuCerto: string[];
  oQueMelhorar: string[];
  aprendizadoParaConsciencia: string;
}

export interface ConscienceData {
  id: string;
  versao: string;
  canal: {
    nome: string;
    criador: string;
    nichoPrincipal: string;
    publicoAlvo: string;
    tomDeVoz: string;
    propostaValor: string;
    frequenciaPostagem: string;
  };
  aprendizados: {
    thumbsVencedoras: ThumbPattern[];
    formulasTitulos: TitleFormula[];
    regrasRetencao: RetentionRule[];
    regrasDeOuro: string[];
  };
  historicoVideos: VideoHistoryItem[];
  atualizadoEm: string;
}
