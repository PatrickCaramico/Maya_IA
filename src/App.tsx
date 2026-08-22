import React, { useState } from 'react';
import type { Project, EtapaNumero, ConversationAttachment } from './types/project';
import type { ConscienceData } from './types/conscience';
import { DEFAULT_AI_SETTINGS, generateMayaChatReply, generateMayaStageContent, type AISettings } from './engine/aiService';
import { ProductionChatModal } from './components/chat/ProductionChatModal';
import { 
  Sparkles, 
  Plus, 
  MessageSquare, 
  Moon, 
  Sun, 
  Settings, 
  Brain, 
  Film,
  Play
} from 'lucide-react';

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
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 'proj_palworld_01',
      nome: 'Palworld: Guia da Base Automatiza...',
      jogo: 'Palworld',
      etapaAtual: 3,
      dataCriacao: '19 de ago.',
      briefingInicial: {
        ideiaCentral: 'Guia de Base Automatizada em Palworld',
        objetivoVideo: 'Alta retenção e engajamento'
      },
      etapas: {
        1: { id: 1, nome: 'Briefing', status: 'aprovado', output: 'Briefing concluído', conversation: [] },
        2: { id: 2, nome: 'Ângulo & Premissa', status: 'aprovado', output: 'Ângulo definido', conversation: [] },
        3: { id: 3, nome: 'Títulos (CTR)', status: 'em_andamento', output: '', conversation: [] },
        4: { id: 4, nome: 'Thumbnails', status: 'bloqueado', output: '', conversation: [] },
        5: { id: 5, nome: 'Roteiro & Retenção', status: 'bloqueado', output: '', conversation: [] },
        6: { id: 6, nome: 'Gravação & OBS', status: 'bloqueado', output: '', conversation: [] },
        7: { id: 7, nome: 'Edição & Cortes', status: 'bloqueado', output: '', conversation: [] },
        8: { id: 8, nome: 'SEO & Descrição', status: 'bloqueado', output: '', conversation: [] },
        9: { id: 9, nome: 'Checklist de Lançamento', status: 'bloqueado', output: '', conversation: [] },
        10: { id: 10, nome: 'Análise Pós-Vídeo', status: 'bloqueado', output: '', conversation: [] }
      }
    } as any
  ]);

  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<EtapaNumero>(1);
  const [aiSettings, setAiSettings] = useState<AISettings>(DEFAULT_AI_SETTINGS);
  const [conscience] = useState<ConscienceData>(initialConscience);

  // Estados Visuais e Temas
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'todos' | 'ativos' | 'prontos'>('todos');
  
  // Modais
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [_isConscienceOpen, setIsConscienceOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedbackInput, setFeedbackInput] = useState('');

  // Mensagens do Chat Geral
  const [_generalChatMessages, setGeneralChatMessages] = useState<
    Array<{
      id: string;
      role: 'user' | 'maya';
      content: string;
      timestamp: string;
      attachments?: ConversationAttachment[];
    }>
  >([]);

  const currentProject = projects.find((p) => p.id === activeProjectId) || null;

  const handleCreateNewVideo = () => {
    const nome = prompt('Nome do novo vídeo/projeto:');
    if (!nome) return;
    const jogo = prompt('Nome do jogo (ex: Minecraft, Palworld):') || 'Geral';

    const newProject: Project = {
      id: `proj_${Date.now()}`,
      nome,
      jogo,
      etapaAtual: 1,
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

  const handleSendChatMessage = async (
    text: string,
    attachments: ConversationAttachment[]
  ): Promise<string> => {
    setIsGenerating(true);

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
    <div className={`min-h-screen font-sans ${isDarkMode ? 'bg-[#0f0f15] text-white' : 'bg-[#f4f6fb] text-gray-800'}`}>
      
      {/* NAVEGAÇÃO SUPERIOR */}
      <header className={`border-b px-6 py-3 flex items-center justify-between transition-colors ${
        isDarkMode ? 'bg-[#161622] border-gray-800' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
            M
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-gray-900 dark:text-white">MAYA</span>
              <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded font-semibold">v4.2</span>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <span className="text-xs text-gray-500 font-medium">Trick Gamer 112</span>
            </div>
            <p className="text-[10px] text-gray-400">Motor de Automação e YouTube Ampliado - Assistente de Produção & Co-piloto</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsChatOpen(true)}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
          >
            <MessageSquare size={15} />
            <span>Chat</span>
          </button>

          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
          >
            {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
            <span>{isDarkMode ? 'Claro' : 'Escuro'}</span>
          </button>

          <button 
            onClick={() => { setActiveProjectId(null); setIsChatOpen(true); }}
            className="text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
          >
            Novo Chat
          </button>

          <button 
            onClick={() => setIsConscienceOpen(true)}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-teal-200 bg-teal-50/50 text-teal-700 hover:bg-teal-100/60 transition-colors"
          >
            <Brain size={14} className="text-teal-600" />
            <span>Consciência</span>
          </button>

          <button 
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
          >
            <Settings size={16} />
          </button>

          <button 
            onClick={handleCreateNewVideo}
            className="flex items-center gap-1.5 text-xs font-medium bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 shadow-sm transition-all"
          >
            <Plus size={15} />
            <span>Novo Vídeo</span>
          </button>
        </div>
      </header>

      {/* Painel de Configuração Rápida de Motor de IA */}
      {isSettingsOpen && (
        <div className="bg-purple-900 text-white p-3 text-xs flex items-center justify-between px-8 border-b border-purple-800">
          <div className="flex items-center gap-3">
            <span>Selecione o Provedor de IA:</span>
            <select
              value={aiSettings.provider}
              onChange={(e) => setAiSettings((prev) => ({ ...prev, provider: e.target.value as any }))}
              className="bg-purple-950 text-white px-2 py-1 rounded border border-purple-700 outline-none"
            >
              <option value="simulated">Motor Simulado</option>
              <option value="gemini">Google Gemini API</option>
              <option value="openai">OpenAI GPT-4o</option>
              <option value="anthropic">Anthropic Claude</option>
            </select>
          </div>
          <button onClick={() => setIsSettingsOpen(false)} className="text-purple-300 hover:text-white">Fechar</button>
        </div>
      )}

      {/* ÁREA CORPO PRINCIPAL */}
      <div className="flex h-[calc(100vh-61px)]">
        
        {/* SIDEBAR DA ESQUERDA */}
        <aside className={`w-64 border-r flex flex-col justify-between p-3 transition-colors ${
          isDarkMode ? 'bg-[#12121c] border-gray-800' : 'bg-white border-gray-200'
        }`}>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3 px-1">
              <Film size={14} className="text-purple-600" />
              <span>Fila de Produção</span>
            </div>

            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-3 text-[11px] font-medium">
              <button 
                onClick={() => setActiveTab('todos')}
                className={`flex-1 py-1 rounded-lg transition-all ${activeTab === 'todos' ? 'bg-purple-600 text-white font-semibold shadow-sm' : 'text-gray-500'}`}
              >
                Todos ({projects.length})
              </button>
              <button 
                onClick={() => setActiveTab('ativos')}
                className={`flex-1 py-1 rounded-lg transition-all ${activeTab === 'ativos' ? 'bg-purple-600 text-white font-semibold shadow-sm' : 'text-gray-500'}`}
              >
                Ativos ({projects.length})
              </button>
              <button 
                onClick={() => setActiveTab('prontos')}
                className={`flex-1 py-1 rounded-lg transition-all ${activeTab === 'prontos' ? 'bg-purple-600 text-white font-semibold shadow-sm' : 'text-gray-500'}`}
              >
                Prontos (0)
              </button>
            </div>

            <div className="space-y-2">
              {projects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setActiveProjectId(p.id)}
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                    p.id === activeProjectId 
                      ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 shadow-sm' 
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 bg-gray-50/60 dark:bg-gray-800/40'
                  }`}
                >
                  <h4 className="text-xs font-bold text-gray-800 dark:text-white truncate">{p.nome}</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">{p.jogo}</p>
                  
                  <div className="flex items-center justify-between mt-3 text-[10px]">
                    <span className="text-teal-600 font-semibold bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded-full border border-teal-200/50">
                      Etapa {p.etapaAtual}/10
                    </span>
                    <span className="text-gray-400">{(p as any).dataCriacao || '19 de ago.'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleCreateNewVideo}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus size={14} />
            <span>Criar Novo Projeto</span>
          </button>
        </aside>

        {/* ÁREA CENTRAL */}
        <main className="flex-1 flex flex-col overflow-y-auto p-6">
          {currentProject ? (
            <div className="max-w-4xl mx-auto w-full space-y-4">
              <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div>
                  <h3 className="text-sm font-bold text-gray-800 dark:text-white">
                    {currentProject.nome} — Etapa #{selectedStage}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">Gerencie e edite as saídas da Maya para este vídeo.</p>
                </div>
                <button
                  onClick={handleGenerateStageContent}
                  disabled={isGenerating}
                  className="bg-purple-600 text-white text-xs font-medium px-4 py-2 rounded-xl flex items-center gap-1.5 hover:bg-purple-700"
                >
                  <Play size={13} />
                  <span>{isGenerating ? 'Gerando...' : 'Gerar Conteúdo'}</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
                {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as EtapaNumero[]).map((num) => (
                  <button
                    key={num}
                    onClick={() => setSelectedStage(num)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      selectedStage === num
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-white dark:bg-gray-800 border text-gray-600 dark:text-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    #{num}
                  </button>
                ))}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl border p-5 text-xs text-gray-700 dark:text-gray-200 font-mono whitespace-pre-wrap leading-relaxed shadow-sm">
                {((currentStageData as any)?.output || (currentStageData as any)?.outputText) 
                  ? ((currentStageData as any)?.output || (currentStageData as any)?.outputText)
                  : 'Clique em "Gerar Conteúdo" para orquestrar esta etapa.'}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-10 max-w-md text-center shadow-sm space-y-5">
                <div className="w-14 h-14 bg-purple-100 dark:bg-purple-950/50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                  <Sparkles size={28} />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">Bem-vindo à Maya v4.2!</h3>
                  <p className="text-xs text-gray-400 leading-relaxed max-w-xs mx-auto">
                    Sua co-produtora inteligente para o canal Trick Gamer 112. Vamos criar o seu primeiro vídeo no pipeline guiado de 10 etapas?
                  </p>
                </div>

                <button
                  onClick={handleCreateNewVideo}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium px-6 py-2.5 rounded-xl flex items-center gap-2 mx-auto shadow-md transition-all"
                >
                  <Plus size={15} />
                  <span>Criar Primeiro Vídeo</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL DE CHAT */}
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