import React, { useState } from 'react';
import type { Project, VideoMetrics } from '../../types/project';
import { BrainCircuit, Sparkles, TrendingUp, Award, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Stage10MetricsFormProps {
  project: Project;
  onSaveMetrics: (metrics: VideoMetrics, newLearning: string) => void;
  isCompleted: boolean;
}

export const Stage10MetricsForm: React.FC<Stage10MetricsFormProps> = ({
  project,
  onSaveMetrics,
  isCompleted
}) => {
  const existingMetrics = project.metricasFinais;

  const [views, setViews] = useState<number>(existingMetrics?.views || 15000);
  const [ctr, setCtr] = useState<number>(existingMetrics?.ctr || 11.2);
  const [avd, setAvd] = useState<number>(existingMetrics?.avd || 52.4);
  const [duracao, setDuracao] = useState<number>(existingMetrics?.duracaoMinutos || project.briefingInicial.tempoEstimadoMinutos || 12);
  const [curtidas] = useState<number>(existingMetrics?.curtidas || 1200);
  const [comentarios] = useState<number>(existingMetrics?.comentarios || 180);
  const [licoes, setLicoes] = useState<string>(
    existingMetrics?.licoesAprendidas?.join('\n') || 
    'A thumbnail com alto contraste roxo/ciano atraiu público novo.\nO gancho de 20s segurou a retenção no primeiro minuto.'
  );
  const [observacoes, setObservacoes] = useState<string>(existingMetrics?.observacoes || 'Reduzir explicações de menus no próximo vídeo.');
  const [newLearning, setNewLearning] = useState<string>(
    `No jogo ${project.jogo}, títulos no estilo 'PARE de jogar assim' e thumbs com o item central brilhando aumentaram o CTR em mais de 2%.`
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const metricsData: VideoMetrics = {
      views: Number(views),
      ctr: Number(ctr),
      avd: Number(avd),
      duracaoMinutos: Number(duracao),
      curtidas: Number(curtidas),
      comentarios: Number(comentarios),
      dataColeta: new Date().toISOString().slice(0, 10),
      observacoes,
      licoesAprendidas: licoes.split('\n').filter(l => l.trim().length > 0)
    };

    // Efeito comemorativo de conclusão
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#8B5CF6', '#2EE6D6', '#34D399', '#F5F3FF']
    });

    onSaveMetrics(metricsData, newLearning);
  };

  const isCtrGood = ctr >= 10.0;
  const isAvdGood = avd >= 45.0;

  return (
    <div className="card-nebula p-6 border border-nebula bg-nebula mt-4">
      <div className="flex items-center gap-3 mb-5 border-b border-nebula pb-4">
        <div className="w-10 h-10 rounded-xl bg-signal/20 text-signal flex items-center justify-center border border-signal/30">
          <BrainCircuit size={22} />
        </div>
        <div>
          <h3 className="text-base font-heading font-bold text-frost">
            Registro de Métricas & Atualização da Consciência (§7.3)
          </h3>
          <p className="text-xs text-secondary">
            Insira os dados de desempenho do YouTube Studio após a publicação para alimentar o aprendizado da Maya.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Views */}
          <div className="p-3 rounded-xl bg-void border border-nebula">
            <label className="block text-xs font-medium text-secondary mb-1">Visualizações (Views)</label>
            <input
              type="number"
              value={views}
              onChange={(e) => setViews(Number(e.target.value))}
              disabled={isCompleted}
              className="input-nebula font-mono text-base font-bold text-frost"
              required
            />
          </div>

          {/* CTR */}
          <div className={`p-3 rounded-xl bg-void border ${isCtrGood ? 'border-success/40' : 'border-warning/40'}`}>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-secondary">CTR (%)</label>
              <span className={`text-[10px] font-mono font-bold ${isCtrGood ? 'text-success' : 'text-warning'}`}>
                {isCtrGood ? 'Acima da meta' : 'Atenção'}
              </span>
            </div>
            <input
              type="number"
              step="0.1"
              value={ctr}
              onChange={(e) => setCtr(Number(e.target.value))}
              disabled={isCompleted}
              className="input-nebula font-mono text-base font-bold text-signal"
              required
            />
            <span className="text-[10px] text-muted">Meta do canal: &gt; 10%</span>
          </div>

          {/* AVD Retenção */}
          <div className={`p-3 rounded-xl bg-void border ${isAvdGood ? 'border-success/40' : 'border-warning/40'}`}>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-secondary">Retenção Média (%)</label>
              <span className={`text-[10px] font-mono font-bold ${isAvdGood ? 'text-success' : 'text-warning'}`}>
                {isAvdGood ? 'Excelente' : 'Baixa'}
              </span>
            </div>
            <input
              type="number"
              step="0.1"
              value={avd}
              onChange={(e) => setAvd(Number(e.target.value))}
              disabled={isCompleted}
              className="input-nebula font-mono text-base font-bold text-pulse"
              required
            />
            <span className="text-[10px] text-muted">Meta do canal: &gt; 45%</span>
          </div>

          {/* Duração */}
          <div className="p-3 rounded-xl bg-void border border-nebula">
            <label className="block text-xs font-medium text-secondary mb-1">Duração (Minutos)</label>
            <input
              type="number"
              step="0.5"
              value={duracao}
              onChange={(e) => setDuracao(Number(e.target.value))}
              disabled={isCompleted}
              className="input-nebula font-mono text-base font-bold text-frost"
              required
            />
          </div>
        </div>

        {/* Feedback fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-frost mb-1.5 flex items-center gap-1.5">
              <Sparkles size={14} className="text-signal" />
              O que funcionou muito bem neste vídeo? (1 por linha)
            </label>
            <textarea
              rows={3}
              value={licoes}
              onChange={(e) => setLicoes(e.target.value)}
              disabled={isCompleted}
              placeholder="Ex: O gancho inicial acelerou a retenção..."
              className="input-nebula text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-frost mb-1.5 flex items-center gap-1.5">
              <TrendingUp size={14} className="text-warning" />
              Pontos de melhoria identificados
            </label>
            <textarea
              rows={3}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              disabled={isCompleted}
              placeholder="Ex: Trilha sonora ficou um pouco alta no minuto 04..."
              className="input-nebula text-xs"
            />
          </div>
        </div>

        {/* Permanent Conscience Learning Field */}
        <div className="p-4 rounded-xl bg-pulse/10 border border-pulse/30">
          <label className="block text-xs font-bold text-frost mb-1.5 flex items-center gap-1.5">
            <BrainCircuit size={15} className="text-pulse" />
            Novo Padrão / Regra de Ouro para a Consciência da Maya
          </label>
          <textarea
            rows={2}
            value={newLearning}
            onChange={(e) => setNewLearning(e.target.value)}
            disabled={isCompleted}
            placeholder="Descreva o aprendizado que a Maya deve lembrar para os próximos vídeos..."
            className="input-nebula text-xs bg-void/80"
          />
          <p className="text-[11px] text-secondary mt-1">
            Esta lição será gravada na memória de longo prazo da Maya e influenciará os roteiros e thumbs dos próximos projetos.
          </p>
        </div>

        {/* Submit action */}
        {!isCompleted ? (
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="btn-accent text-sm py-2.5 px-6"
            >
              <Award size={18} />
              <span>Gravar na Consciência & Concluir Vídeo</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-success/15 border border-success/30 text-success text-xs font-semibold justify-center">
            <CheckCircle size={16} />
            <span>Vídeo concluído e aprendizado consolidado na Consciência da Maya!</span>
          </div>
        )}
      </form>
    </div>
  );
};
