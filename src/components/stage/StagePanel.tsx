import React, { useState } from 'react';
import type { Project, EtapaNumero, VideoMetrics } from '../../types/project';
import { STAGES_CONFIG } from '../../data/stageDefinitions';
import { MayaOutputViewer } from './MayaOutputViewer';
import { Stage10MetricsForm } from '../metrics/Stage10MetricsForm';
import { 
  Sparkles, Check, Edit3, RotateCcw, ArrowLeft, 
  CheckSquare, Square, Send, Loader2, Info, Trash2
} from 'lucide-react';
import { Badge } from '../ui/Badge';

interface StagePanelProps {
  project: Project;
  selectedStage: EtapaNumero;
  isGenerating: boolean;
  onGenerateContent: (stage: EtapaNumero, feedback?: string) => void;
  onApproveStage: (feedback?: string) => void;
  onAskMaya: (message: string) => Promise<string>;
  onRemakeStage: () => void;
  onGoBackStage: (stage: EtapaNumero) => void;
  onToggleChecklist: (itemId: string) => void;
  onSaveStage10Metrics: (metrics: VideoMetrics, newLearning: string) => void;
  onResetConversationOnly?: () => void;
  onResetStageAndConversation?: () => void;
}

export const StagePanel: React.FC<StagePanelProps> = ({
  project,
  selectedStage,
  isGenerating,
  onGenerateContent,
  onApproveStage,
  onAskMaya,
  onRemakeStage,
  onGoBackStage,
  onToggleChecklist,
  onSaveStage10Metrics,
  onResetConversationOnly,
  onResetStageAndConversation
}) => {
  const stageDef = STAGES_CONFIG[selectedStage];
  const stageData = project.etapas[selectedStage];
  const conversation = stageData?.conversation || [];
  const isCurrentActive = project.etapaAtual === selectedStage;
  const isStageApproved = stageData?.status === 'aprovado';
  const hasOutput = !!stageData?.saidaGerada;
  const isCompleted = project.status === 'concluido';

  const [showChat, setShowChat] = useState(false);
  const [chatText, setChatText] = useState('');
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  const visibleConversation = pendingMessage
    ? [
        ...conversation,
        {
          id: 'pending_user',
          role: 'user',
          content: pendingMessage,
          timestamp: new Date().toISOString()
        },
        {
          id: 'pending_maya',
          role: 'maya',
          content: 'Maya está pensando...',
          timestamp: new Date().toISOString()
        }
      ]
    : conversation;

  const handleSendChat = async () => {
    const message = chatText.trim();
    if (!message) return;

    setChatText('');
    setPendingMessage(message);
    try {
      await onAskMaya(message);
    } finally {
      setPendingMessage(null);
    }
  };

  const handleAskQuickPrompt = (prompt: string) => {
    setChatText(prompt);
    setShowChat(true);
  };

  return (
    <div className="space-y-6">
      {/* Stage Header Card */}
      <div className="card-nebula p-5 border border-nebula bg-nebula relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-32 bg-gradient-to-bl from-pulse/15 via-signal/5 to-transparent pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="pulse">Etapa #{selectedStage}</Badge>
              {isStageApproved ? (
                <Badge variant="signal" icon={<Check size={12} />}>Aprovada</Badge>
              ) : isCurrentActive ? (
                <Badge variant="alert" className="animate-pulse">Em Andamento</Badge>
              ) : (
                <Badge variant="muted">Visualização Histórica</Badge>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-heading font-bold text-frost">
              {stageDef.nome}
            </h1>
            <p className="text-sm text-secondary mt-1 max-w-2xl">
              {stageDef.descricaoDetalhada}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-void/70 border border-nebula text-xs sm:text-right min-w-[200px]">
            <span className="text-muted block text-[10px] uppercase font-mono">Vídeo em Produção</span>
            <span className="text-frost font-semibold block truncate">{project.nome}</span>
            <span className="text-signal font-mono text-[11px]">{project.jogo}</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-nebula flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-secondary">
            <Info size={14} className="text-signal" />
            <span><strong>Objetivo da Maya:</strong> {stageDef.objetivoMaya}</span>
          </div>

          <div className="flex items-center gap-1.5 text-muted">
            <span className="text-[11px]">Memória acionada:</span>
            {stageDef.secoesConscienciaUtilizadas.map((sec, i) => (
              <span key={i} className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-void text-pulse border border-pulse/20">
                {sec}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stage Checklist Section */}
      <div className="card-nebula p-4 border border-nebula bg-nebula-elevated">
        <h3 className="text-xs font-heading font-bold text-frost uppercase tracking-wider mb-2.5 flex items-center gap-2">
          <CheckSquare size={14} className="text-signal" />
          Critérios de Qualidade da Etapa {selectedStage}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {stageDef.checklistsPadrao.map((item, idx) => {
            const itemId = `chk_${selectedStage}_${idx}`;
            const isChecked = !!project.checklistGeral[itemId];

            return (
              <div
                key={itemId}
                onClick={() => onToggleChecklist(itemId)}
                className={`
                  flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-all
                  ${isChecked 
                    ? 'bg-signal/10 border-signal/30 text-frost font-medium' 
                    : 'bg-void/50 border-nebula text-secondary hover:border-pulse/40 hover:text-frost'
                  }
                `}
              >
                <div className={`p-0.5 rounded ${isChecked ? 'text-signal' : 'text-muted'}`}>
                  {isChecked ? <CheckSquare size={16} /> : <Square size={16} />}
                </div>
                <span className={isChecked ? 'line-through text-secondary' : 'text-frost'}>
                  {item}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      {selectedStage === 10 ? (
        <Stage10MetricsForm
          project={project}
          onSaveMetrics={onSaveStage10Metrics}
          isCompleted={isCompleted}
        />
      ) : (
        <div className="space-y-4">
          {hasOutput ? (
            <MayaOutputViewer
              content={stageData.saidaGerada!}
              stageNumber={selectedStage}
            />
          ) : (
            <div className="card-nebula p-8 sm:p-12 text-center border-dashed border-nebula bg-nebula/40">
              <div className="w-14 h-14 rounded-2xl bg-pulse/15 text-pulse flex items-center justify-center mx-auto mb-4 border border-pulse/30 shadow-glow-pulse">
                <Sparkles size={28} />
              </div>
              <h3 className="text-lg font-heading font-bold text-frost">
                Nenhum conteúdo gerado ainda para esta etapa
              </h3>
              <p className="text-xs text-secondary max-w-md mx-auto mt-1 mb-6">
                Clique abaixo para que a Maya analise os dados do projeto e a Consciência do canal para gerar as recomendações.
              </p>

              <button
                disabled={isGenerating}
                onClick={() => onGenerateContent(selectedStage)}
                className="btn-primary text-sm py-2.5 px-6 mx-auto shadow-glow-pulse"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Maya Raciocinando...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Gerar Saída da Etapa {selectedStage}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Chat com a Maya */}
          {isCurrentActive && hasOutput && (
            <div className="card-nebula p-4 border border-pulse/40 bg-void/90 animate-fade-in space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-bold text-frost flex items-center gap-1.5">
                  <Edit3 size={14} className="text-pulse" />
                  Conversar com a Maya
                </label>

                <div className="flex items-center gap-2">
                  {/* Botão 1: Limpar APENAS o Chat */}
                  {conversation.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Apagar apenas o histórico de mensagens deste chat? (As alterações da etapa serão mantidas)')) {
                          onResetConversationOnly?.();
                        }
                      }}
                      className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20"
                      title="Limpa apenas o histórico de conversa"
                    >
                      <Trash2 size={12} />
                      <span>Limpar Chat</span>
                    </button>
                  )}

                  {/* Botão 2: Resetar Chat + Alterações */}
                  {hasOutput && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Atenção: Isso vai apagar o chat E resetar as alterações feitas na etapa. Deseja continuar?')) {
                          onResetStageAndConversation?.();
                        }
                      }}
                      className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors px-2 py-1 rounded bg-red-500/10 border border-red-500/20"
                      title="Reseta o chat e desfaz as alterações da etapa"
                    >
                      <RotateCcw size={12} />
                      <span>Resetar Etapa & Chat</span>
                    </button>
                  )}

                  <button
                    onClick={() => setShowChat((current) => !current)}
                    className="text-xs text-muted hover:text-frost font-medium ml-1"
                  >
                    {showChat ? 'Fechar' : 'Abrir chat'}
                  </button>
                </div>
              </div>

              {showChat && (
                <div className="space-y-3 animate-fade-in">
                  <div className="max-h-[320px] overflow-y-auto rounded-2xl border border-nebula bg-nebula-elevated p-3 space-y-3">
                    {visibleConversation.length === 0 ? (
                      <div className="text-center py-6 text-xs text-frost font-medium">
                        Mande uma pergunta ou sugestão para a Maya ajustar esta etapa.
                      </div>
                    ) : (
                      visibleConversation.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed shadow-sm border ${
                              message.role === 'user'
                                ? 'bg-pulse/20 border-pulse/30 text-frost rounded-br-md'
                                : 'bg-nebula border-nebula text-frost rounded-bl-md'
                            }`}
                          >
                            <div className="mb-1 text-[10px] uppercase tracking-[0.2em] text-secondary">
                              {message.role === 'user' ? 'Patrick' : 'Maya'}
                            </div>
                            <div>{message.content}</div>
                          </div>
                        </div>
                      ))
                    )}

                    {isGenerating && pendingMessage && (
                      <div className="flex justify-start">
                        <div className="max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed shadow-sm border bg-nebula border-nebula text-frost rounded-bl-md">
                          <div className="mb-1 text-[10px] uppercase tracking-[0.2em] text-secondary">
                            Maya
                          </div>
                          <div className="flex items-center gap-2 text-secondary">
                            <Loader2 size={12} className="animate-spin" />
                            Maya está pensando...
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <textarea
                    rows={3}
                    value={chatText}
                    onChange={(e) => setChatText(e.target.value)}
                    placeholder="Ex: Altera a descrição para adaptar ao novo modo do jogo..."
                    className="input-nebula text-xs"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleAskQuickPrompt('Quero deixar isso mais forte e mais curto.')}
                        className="btn-ghost text-[11px] py-1.5 px-3"
                      >
                        Mais forte
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAskQuickPrompt('Ajusta para ficar mais focado em curiosidade e clique.')}
                        className="btn-ghost text-[11px] py-1.5 px-3"
                      >
                        Mais CTR
                      </button>
                    </div>

                    <button
                      disabled={!chatText.trim() || isGenerating}
                      onClick={handleSendChat}
                      className="btn-primary text-xs py-2 px-4"
                    >
                      <Send size={13} />
                      <span>Enviar mensagem</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Controls Bar */}
          {hasOutput && isCurrentActive && (
            <div className="card-nebula p-4 sm:p-5 border border-nebula bg-nebula-elevated flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-left w-full sm:w-auto">
                <p className="text-xs font-semibold text-frost font-heading">
                  {stageDef.perguntasAprovacao}
                </p>
                <p className="text-[11px] text-secondary">
                  Aprovar desbloqueará imediatamente a Etapa {selectedStage + 1}.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                {selectedStage > 1 && (
                  <button
                    onClick={() => onGoBackStage((selectedStage - 1) as EtapaNumero)}
                    className="btn-ghost text-xs py-2"
                    title="Voltar para a etapa anterior"
                  >
                    <ArrowLeft size={14} />
                    <span>Voltar</span>
                  </button>
                )}

                <button
                  disabled={isGenerating}
                  onClick={onRemakeStage}
                  className="btn-secondary text-xs py-2"
                  title="Refazer do zero com nova abordagem"
                >
                  <RotateCcw size={14} />
                  <span>Refazer</span>
                </button>

                <button
                  onClick={() => setShowChat((current) => !current)}
                  className="btn-secondary text-xs py-2 border-pulse/40 text-pulse hover:bg-pulse/10"
                  title="Abrir conversa com a Maya"
                >
                  <Edit3 size={14} />
                  <span>Conversar</span>
                </button>

                <button
                  disabled={isGenerating}
                  onClick={() => onApproveStage()}
                  className="btn-primary text-xs sm:text-sm py-2 px-5 shadow-glow-pulse"
                >
                  <Check size={16} />
                  <span>Aprovar e Avançar</span>
                </button>
              </div>
            </div>
          )}

          {hasOutput && !isCurrentActive && isStageApproved && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-signal/10 border border-signal/30 text-xs">
              <div className="flex items-center gap-2 text-signal font-semibold">
                <Check size={16} />
                <span>Esta etapa já foi aprovada e integrada ao contexto da produção.</span>
              </div>

              <button
                onClick={() => setShowChat((current) => !current)}
                className="btn-ghost text-xs py-1 px-3 text-frost hover:bg-white/5"
              >
                <Edit3 size={13} />
                <span>Reajustar</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};