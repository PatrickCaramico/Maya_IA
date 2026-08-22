import React, { useState } from 'react';
import type { Project, EtapaNumero, ConversationAttachment } from './types/project';
import type { ConscienceData } from './types/conscience';
import { DEFAULT_AI_SETTINGS, generateMayaChatReply, generateMayaStageContent, type AISettings } from './engine/aiService';
import { ProductionChatModal } from './components/chat/ProductionChatModal';
import { Sparkles, FolderPlus, Brain, Play } from 'lucide-react';

const initialConscience: ConscienceData = {
  canal: {
    nome: 'Trick Gamer 112',
    criador: 'Patrick',
    nichoPrincipal: 'Games / Modpacks / Tutoriais',
    publicoAlvo: 'Gamers e entusiastas de Minecraft e tecnologia',
    tomDeVoz: 'Dinâmico, direto e descontraído',
    propostaValor: 'Conteúdo prático de alta retenção',
    frequenciaPostagem: 'Semanal'
  }
} as any;

export const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<EtapaNumero>(1);
  const [aiSettings, setAiSettings] = useState<AISettings>(DEFAULT_AI_SETTINGS);
  const [conscience] = useState<ConscienceData>(initialConscience);

  // Armazena mensagens do Chat Geral quando não há projeto selecionado
  const [generalChatMessages, setGeneralChatMessages] = useState<
    Array<{
      id: string;
      role: 'user' | 'maya';
      content: string;
      timestamp: string;
      attachments?: ConversationAttachment[];
    }>
  >([]);

  // Modais e Loadings
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedbackInput, setFeedbackInput] = useState('');

  const currentProject = projects.find((p) => p.id === activeProjectId) || null;

  /**
   * Criação de novo projeto ajustado aos seus tipos exatos
   */
  const handleCreateProject = () => {
    const nome = prompt('Nome do novo vídeo/projeto:');
    if (!nome) return;
    const jogo = prompt('Nome do jogo (ex: Minecraft, Palworld):') || 'Geral';

    const newProject: Project = {
      id: `proj_${Date.now()}`,
      nome,
      jogo,
      etapaAtual: 1,
      dataCriacao: new Date().toISOString(),
      briefingInicial: {
        ideiaCentral: nome,
        objetivoVideo: 'Gerar engajamento e alta retenção'
      },
      etapas: {
        1: { id: 1, nome: 'Briefing', status: 'em_andamento', output: '', conversation: [] },
        2: { id: 2, nome: 'Ângulo & Premissa', status: 'bloqueado', output: '', conversation: [] },
        3: { id: 3, nome: 'Títulos (CTR)', status: 'bloqueado', output: '', conversation: [] },
        4: { id: 4, nome: 'Thumbnails', status: 'bloqueado', output: '', conversation: [] },
        5: { id: 5, nome: 'Roteiro & Retenção', status: 'bloqueado', output: '', conversation: [] },
        6: { id: 6, nome: 'Gravação & OBS', status: 'bloqueado', output: '', conversation: [] },
        7: { id: 7, nome: 'Edição & Cortes', status: 'bloqueado', output: '', conversation: [] },
        8: { id: 8, nome: 'SEO & Descrição', status: 'bloqueado', output: '', conversation: [] },
        9: { id: 9, nome: 'Checklist de Lançamento', status: 'bloqueado', output: '', conversation: [] },
        10: { id: 10, nome: 'Análise Pós-Vídeo', status: 'bloqueado', output: '', conversation: [] }
      }
    } as any;

    setProjects((prev) => [...prev, newProject]);
    setActiveProjectId(newProject.id);
  };

  /**
   * Processa o envio no Chat
   */
  const handleSendChatMessage = async (
    text: string,
    attachments: ConversationAttachment[]
  ): Promise<string> => {
    setIsGenerating(true);

   // Fallback seguro de projeto quando nenhum estiver ativo
    const generalProjectFallback: Project = {
      id: 'chat_geral',
      nome: 'Conversa Geral com a Maya',
      jogo: 'Geral',
      etapaAtual: 1,
      briefingInicial: {
        ideiaCentral: 'Conversa Geral',
        objetivoVideo: 'Tira-dúvidas e planejamento'
      },
      etapas: {} as any
    } as any;

    try {
      const replyText = await generateMayaChatReply(
        (currentProject || generalProjectFallback) as any,
        selectedStage,
        conscience,
        aiSettings,
        text,
        attachments
      );

      const userMsg = {
        id: `msg_user_${Date.now()}`,
        role: 'user' as const,
        content: text,
        timestamp: new Date().toISOString(),
        attachments
      };

      const mayaMsg = {
        id: `msg_maya_${Date.now()}`,
        role: 'maya' as const,
        content: replyText,
        timestamp: new Date().toISOString()
      };

      if (currentProject) {
        setProjects((prev) =>
          prev.map((p) => {
            if (p.id !== currentProject.id) return p;
            const currentConversation = p.etapas[selectedStage]?.conversation || [];
            return {
              ...p,
              etapas: {
                ...p.etapas,
                [selectedStage]: {
                  ...p.etapas[selectedStage],
                  conversation: [...currentConversation, userMsg, mayaMsg]
                }
              }
            };
          })
        );
      } else {
        setGeneralChatMessages((prev) => [...prev, userMsg, mayaMsg]);
      }

      return replyText;
    } catch (error) {
      console.error('Erro no envio da mensagem:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Gera conteúdo da etapa usando o campo 'output'
   */
  const handleGenerateStageContent = async () => {
    if (!currentProject) return;
    setIsGenerating(true);

    try {
      const output = await generateMayaStageContent(
        currentProject,
        selectedStage,
        conscience,
        aiSettings,
        feedbackInput
      );

      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== currentProject.id) return p;
          return {
            ...p,
            etapas: {
              ...p.etapas,
              [selectedStage]: {
                ...p.etapas[selectedStage],
                output: output,
                status: 'aprovado'
              }
            }
          };
        })
      );
      setFeedbackInput('');
    } catch (error) {
      console.error('Erro ao gerar etapa:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Limpa a conversa
   */
  const handleResetConversation = () => {
    if (currentProject) {
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== currentProject.id) return p;
          return {
            ...p,
            etapas: {
              ...p.etapas,
              [selectedStage]: {
                ...p.etapas[selectedStage],
                conversation: []
              }
            }
          };
        })
      );
    } else {
      setGeneralChatMessages([]);
    }
  };

  const currentStageData = currentProject?.etapas[selectedStage];

  return (
    <div className="flex h-screen bg-void text-frost overflow-hidden font-sans">
      {/* Sidebar Lateral */}
      <aside className="w-64 border-r border-nebula bg-void/90 flex flex-col justify-between p-4">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-pulse flex items-center justify-center font-bold text-void">M</div>
            <div>
              <h1 className="font-bold text-sm tracking-wide">MAYA v4.2</h1>
              <p className="text-[10px] text-secondary uppercase tracking-widest">Trick Gamer 112</p>
            </div>
          </div>

          <button
            onClick={handleCreateProject}
            className="w-full btn-primary text-xs py-2 px-3 flex items-center justify-center gap-2"
          >
            <FolderPlus size={14} />
            <span>Novo Projeto</span>
          </button>

          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-secondary px-2 font-semibold">Seus Projetos</p>
            <div className="max-h-60 overflow-y-auto space-y-1">
              {projects.length === 0 ? (
                <p className="text-xs text-secondary px-2 py-3 italic">Nenhum projeto ativo.</p>
              ) : (
                projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActiveProjectId(p.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      p.id === activeProjectId ? 'bg-nebula border border-pulse/40 text-frost' : 'text-secondary hover:bg-nebula/50'
                    }`}
                  >
                    <span className="truncate">{p.nome}</span>
                    <span className="text-[10px] bg-void px-1.5 py-0.5 rounded text-secondary">E{p.etapaAtual}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2 border-t border-nebula pt-4">
          <button
            onClick={() => setIsChatOpen(true)}
            className="w-full btn-ghost text-xs py-2 px-3 flex items-center justify-center gap-2 border border-pulse/30 text-pulse hover:bg-pulse/10"
          >
            <Sparkles size={14} />
            <span>{currentProject ? 'Chat do Projeto' : `Chat Geral (${generalChatMessages.length})`}</span>
          </button>
        </div>
      </aside>

      {/* Área Principal */}
      <main className="flex-1 flex flex-col overflow-hidden bg-void/50">
        <header className="border-b border-nebula p-4 flex items-center justify-between bg-void/80">
          <div>
            <h2 className="text-base font-bold text-frost">
              {currentProject ? currentProject.nome : 'Painel da Maya — Chat & Produção'}
            </h2>
            <p className="text-xs text-secondary">
              {currentProject
                ? `Jogo: ${currentProject.jogo} | Etapa Selecionada: #${selectedStage}`
                : 'Nenhum projeto selecionado. Utilize o Chat Geral para tirar dúvidas e buscar ideias.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-secondary mr-2">Motor IA:</span>
            <select
              value={aiSettings.provider}
              onChange={(e) => setAiSettings((prev) => ({ ...prev, provider: e.target.value as any }))}
              className="bg-nebula text-frost border border-nebula text-xs rounded-lg px-2 py-1 outline-none"
            >
              <option value="simulated">Motor Simulado</option>
              <option value="gemini">Google Gemini API</option>
              <option value="openai">OpenAI GPT-4o</option>
              <option value="anthropic">Anthropic Claude</option>
            </select>
          </div>
        </header>

        {/* Barra das 10 Etapas */}
        {currentProject && (
          <div className="border-b border-nebula bg-nebula-elevated p-2 flex items-center gap-1 overflow-x-auto">
            {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as EtapaNumero[]).map((num) => {
              const etapa = currentProject.etapas[num];
              const isSelected = selectedStage === num;
              return (
                <button
                  key={num}
                  onClick={() => setSelectedStage(num)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-pulse text-void font-bold shadow-lg shadow-pulse/20'
                      : etapa?.status === 'aprovado'
                      ? 'bg-nebula text-signal border border-signal/30'
                      : 'bg-void/40 text-secondary hover:text-frost'
                  }`}
                >
                  <span>#{num}</span>
                  <span>{etapa?.nome}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Visualizador de Saída */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {currentProject ? (
            <div className="space-y-4 max-w-4xl mx-auto">
              <div className="flex items-center justify-between bg-nebula/40 p-4 rounded-2xl border border-nebula">
                <div>
                  <h3 className="text-sm font-bold text-frost">Etapa #{selectedStage}: {currentStageData?.nome}</h3>
                  <p className="text-xs text-secondary">Gere ou refine a saída estruturada da Maya para este bloco.</p>
                </div>
                <button
                  onClick={handleGenerateStageContent}
                  disabled={isGenerating}
                  className="btn-primary text-xs py-2 px-4 flex items-center gap-2"
                >
                  <Play size={13} />
                  <span>{isGenerating ? 'Gerando...' : 'Gerar Conteúdo'}</span>
                </button>
              </div>

              {((currentStageData as any)?.output || (currentStageData as any)?.outputText || (currentStageData as any)?.conteudo || (currentStageData as any)?.content) ? (
                <div className="rounded-2xl border border-nebula bg-void p-5 text-xs text-frost whitespace-pre-wrap leading-relaxed font-mono">
                  {(currentStageData as any)?.output || (currentStageData as any)?.outputText || (currentStageData as any)?.conteudo || (currentStageData as any)?.content}
                </div>
              ) : (
                <div className="border border-dashed border-nebula rounded-2xl p-12 text-center text-xs text-secondary">
                  Clique em "Gerar Conteúdo" para rodar a IA nesta etapa ou abra o chat para conversar sobre essa fase.
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-nebula flex items-center justify-center text-pulse border border-pulse/30">
                <Brain size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-frost">Modo de Produção Livre</h3>
                <p className="text-xs text-secondary mt-1">
                  Crie um novo projeto no menu lateral para acessar o roteirizador completo de 10 etapas ou clique no botão abaixo para conversar com a Maya livremente.
                </p>
              </div>
              <button
                onClick={() => setIsChatOpen(true)}
                className="btn-primary text-xs py-2.5 px-5 flex items-center gap-2"
              >
                <Sparkles size={14} />
                <span>Abrir Chat Geral com a Maya</span>
              </button>
            </div>
          )}
        </div>
      </main>

      <ProductionChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        project={currentProject}
        selectedStage={selectedStage}
        isGenerating={isGenerating}
        onSendMessage={handleSendChatMessage}
        settings={aiSettings}
        onResetConversation={handleResetConversation}
      />
    </div>
  );
};

export default App;