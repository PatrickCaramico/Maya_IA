import React, { useState } from 'react';
import type { ConscienceData } from '../../types/conscience';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { 
  BrainCircuit, Image, Flame, Clock, Award, 
  Save, Download, RotateCcw, Sparkles 
} from 'lucide-react';
import { DEFAULT_CONSCIENCE } from '../../data/defaultConscience';

interface ConscienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  conscience: ConscienceData;
  onUpdateConscience: (newConscience: ConscienceData) => void;
  initialTab?: 'thumbs' | 'titulos' | 'retencao' | 'canal' | 'historico';
}

export const ConscienceModal: React.FC<ConscienceModalProps> = ({
  isOpen,
  onClose,
  conscience,
  onUpdateConscience,
  initialTab = 'thumbs'
}) => {
  const [activeTab, setActiveTab] = useState<'thumbs' | 'titulos' | 'retencao' | 'canal' | 'historico'>(initialTab);
  const [editingData, setEditingData] = useState<ConscienceData>(conscience);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    onUpdateConscience(editingData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleResetToDefault = () => {
    if (window.confirm('Deseja restaurar a Consciência padrão da Maya?')) {
      setEditingData(DEFAULT_CONSCIENCE);
      onUpdateConscience(DEFAULT_CONSCIENCE);
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(editingData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `maya_consciencia_${editingData.id}_v${editingData.versao}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="A Consciência da Maya (Memória do Canal)"
      subtitle="Base de conhecimento viva do canal Trick Gamer 112 utilizada em todas as gerações de IA"
      icon={<BrainCircuit size={20} />}
    >
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-void border border-nebula text-xs">
          <button
            onClick={() => setActiveTab('thumbs')}
            className={`flex items-center gap-1.5 py-2 px-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'thumbs' ? 'bg-pulse text-frost shadow-sm' : 'text-secondary hover:text-frost hover:bg-white/5'
            }`}
          >
            <Image size={14} />
            <span>Thumbs Vencedoras ({editingData.aprendizados.thumbsVencedoras.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('titulos')}
            className={`flex items-center gap-1.5 py-2 px-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'titulos' ? 'bg-pulse text-frost shadow-sm' : 'text-secondary hover:text-frost hover:bg-white/5'
            }`}
          >
            <Flame size={14} />
            <span>Fórmulas de Títulos ({editingData.aprendizados.formulasTitulos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('retencao')}
            className={`flex items-center gap-1.5 py-2 px-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'retencao' ? 'bg-pulse text-frost shadow-sm' : 'text-secondary hover:text-frost hover:bg-white/5'
            }`}
          >
            <Clock size={14} />
            <span>Regras de Retenção ({editingData.aprendizados.regrasRetencao.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('historico')}
            className={`flex items-center gap-1.5 py-2 px-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'historico' ? 'bg-pulse text-frost shadow-sm' : 'text-secondary hover:text-frost hover:bg-white/5'
            }`}
          >
            <Award size={14} />
            <span>Histórico de Vídeos ({editingData.historicoVideos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('canal')}
            className={`flex items-center gap-1.5 py-2 px-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'canal' ? 'bg-pulse text-frost shadow-sm' : 'text-secondary hover:text-frost hover:bg-white/5'
            }`}
          >
            <Sparkles size={14} />
            <span>Perfil do Canal</span>
          </button>
        </div>

        {/* Tab Content: Thumbs Vencedoras */}
        {activeTab === 'thumbs' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-secondary">
                Padrões visuais consolidados que atingem CTR acima da média no canal.
              </p>
            </div>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {editingData.aprendizados.thumbsVencedoras.map((t) => (
                <div key={t.id} className="p-4 rounded-xl bg-void border border-nebula space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-heading font-bold text-sm text-frost">{t.padrao}</h4>
                    <Badge variant="signal">CTR Médio: {t.ctrMedioObservado}%</Badge>
                  </div>
                  <p className="text-xs text-secondary">{t.descricao}</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {t.elementosChave.map((elem, i) => (
                      <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-nebula text-pulse border border-nebula">
                        {elem}
                      </span>
                    ))}
                  </div>
                  <div className="text-[11px] text-muted pt-1 border-t border-nebula/60">
                    <strong>Exemplo:</strong> {t.exemploPratico}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content: Fórmulas de Títulos */}
        {activeTab === 'titulos' && (
          <div className="space-y-3">
            <p className="text-xs text-secondary">
              Gatilhos de curiosidade, benefício e quebra de padrão calibrados para o público gamer.
            </p>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {editingData.aprendizados.formulasTitulos.map((f) => (
                <div key={f.id} className="p-4 rounded-xl bg-void border border-nebula space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <code className="text-xs font-mono font-bold text-signal bg-nebula px-2 py-1 rounded border border-nebula">
                      {f.formula}
                    </code>
                    <Badge variant="pulse">CTR: ~{f.ctrMedio}%</Badge>
                  </div>
                  <p className="text-xs text-frost font-medium">Exemplo: "{f.exemplo}"</p>
                  <p className="text-[11px] text-secondary"><strong>Gatilho:</strong> {f.gatilhoEmocional}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content: Regras de Retenção */}
        {activeTab === 'retencao' && (
          <div className="space-y-3">
            <p className="text-xs text-secondary">
              Diretrizes de ritmo e momentos-chave para manter o AVD acima de 45%.
            </p>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {editingData.aprendizados.regrasRetencao.map((r) => (
                <div key={r.id} className="p-4 rounded-xl bg-void border border-nebula space-y-1.5">
                  <span className="text-xs font-mono font-bold text-pulse uppercase">{r.etapaMomento}</span>
                  <p className="text-xs text-frost font-medium">{r.regra}</p>
                  <p className="text-[11px] text-secondary"><strong>Meta:</strong> {r.impactoEsperado}</p>
                  <blockquote className="text-[11px] italic text-muted border-l-2 border-signal pl-2">
                    {r.exemploPratico}
                  </blockquote>
                </div>
              ))}

              <div className="p-4 rounded-xl bg-nebula border border-nebula mt-4">
                <h4 className="text-xs font-heading font-bold text-frost uppercase mb-2">Regras de Ouro Inegociáveis</h4>
                <ul className="space-y-1 text-xs text-secondary list-disc ml-4">
                  {editingData.aprendizados.regrasDeOuro.map((regra, i) => (
                    <li key={i}>{regra}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Histórico de Vídeos */}
        {activeTab === 'historico' && (
          <div className="space-y-3">
            <p className="text-xs text-secondary">
              Registro histórico de vídeos finalizados que alimentaram a Consciência da Maya.
            </p>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {editingData.historicoVideos.map((v) => (
                <div key={v.id} className="p-4 rounded-xl bg-void border border-nebula space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-heading font-bold text-sm text-frost">{v.tituloFinal}</h4>
                      <span className="text-xs text-signal font-mono">{v.jogo}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="signal">CTR {v.ctr}%</Badge>
                      <Badge variant="pulse">AVD {v.avd}%</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs py-1">
                    <span className="text-muted">Views: <strong className="text-frost">{v.views.toLocaleString()}</strong></span>
                    <span className="text-muted">Duração: <strong className="text-frost">{v.duracaoMinutos} min</strong></span>
                    <span className="text-muted">Data: <strong className="text-frost">{v.dataPublicacao}</strong></span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-pulse/10 border border-pulse/20 text-xs text-frost">
                    <strong>Aprendizado gravado:</strong> {v.aprendizadoParaConsciencia}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content: Perfil do Canal */}
        {activeTab === 'canal' && (
          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-void border border-nebula">
                <label className="block text-muted text-[11px] font-mono mb-1">Nome do Canal</label>
                <input
                  type="text"
                  value={editingData.canal.nome}
                  onChange={(e) => setEditingData({
                    ...editingData,
                    canal: { ...editingData.canal, nome: e.target.value }
                  })}
                  className="input-nebula text-xs font-bold"
                />
              </div>

              <div className="p-3 rounded-xl bg-void border border-nebula">
                <label className="block text-muted text-[11px] font-mono mb-1">Criador / Apresentador</label>
                <input
                  type="text"
                  value={editingData.canal.criador}
                  onChange={(e) => setEditingData({
                    ...editingData,
                    canal: { ...editingData.canal, criador: e.target.value }
                  })}
                  className="input-nebula text-xs font-bold"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-void border border-nebula">
              <label className="block text-muted text-[11px] font-mono mb-1">Nicho Principal</label>
              <input
                type="text"
                value={editingData.canal.nichoPrincipal}
                onChange={(e) => setEditingData({
                  ...editingData,
                  canal: { ...editingData.canal, nichoPrincipal: e.target.value }
                })}
                className="input-nebula text-xs"
              />
            </div>

            <div className="p-3 rounded-xl bg-void border border-nebula">
              <label className="block text-muted text-[11px] font-mono mb-1">Tom de Voz da Maya & do Patrick</label>
              <textarea
                rows={2}
                value={editingData.canal.tomDeVoz}
                onChange={(e) => setEditingData({
                  ...editingData,
                  canal: { ...editingData.canal, tomDeVoz: e.target.value }
                })}
                className="input-nebula text-xs"
              />
            </div>
          </div>
        )}

        {/* Modal Actions Footer */}
        <div className="pt-4 border-t border-nebula flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJSON}
              className="btn-ghost text-xs py-1.5 px-3"
              title="Baixar cópia da Consciência em formato JSON"
            >
              <Download size={14} />
              <span>Exportar JSON</span>
            </button>

            <button
              onClick={handleResetToDefault}
              className="btn-ghost text-xs py-1.5 px-3 text-muted hover:text-alert"
              title="Restaurar valores padrão do canal"
            >
              <RotateCcw size={14} />
              <span>Restaurar Padrão</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="btn-primary text-xs py-2 px-5"
            >
              <Save size={15} />
              <span>{isSaved ? 'Salvo com Sucesso!' : 'Salvar Alterações'}</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
