import React, { useState } from 'react';
import type { Project, EtapaNumero, ConversationAttachment } from './types/project';
import type { ConscienceData } from './types/conscience';
import { DEFAULT_AI_SETTINGS, generateMayaChatReply, type AISettings } from './engine/aiService';
import { ProductionChatModal } from './components/chat/ProductionChatModal';

// Inicialização segura para o objeto ConscienceData
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
  const [activeProjectId] = useState<string | null>(null);
  const [selectedStage] = useState<EtapaNumero>(1);
  const [aiSettings] = useState<AISettings>(DEFAULT_AI_SETTINGS);
  const [conscience] = useState<ConscienceData>(initialConscience);

  // Histórico de mensagens do Chat Geral
  const [generalChatMessages, setGeneralChatMessages] = useState<
    Array<{
      id: string;
      role: 'user' | 'maya';
      content: string;
      timestamp: string;
      attachments?: ConversationAttachment[];
    }>
  >([]);

  // Modais
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Projeto ativo atual ou null
  const currentProject = projects.find((p) => p.id === activeProjectId) || null;

  /**
   * Manipulador do envio de mensagens do Chat
   */
  const handleSendChatMessage = async (
    text: string,
    attachments: ConversationAttachment[]
  ): Promise<string> => {
    setIsGenerating(true);

    try {
      const replyText = await generateMayaChatReply(
        currentProject,
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
      console.error('Erro ao processar mensagem do chat:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Limpar a conversa atual
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

  return (
    <div className="min-h-screen bg-void text-frost p-6">
      <header className="max-w-6xl mx-auto flex items-center justify-between border-b border-nebula pb-4 mb-6">
        <div>
          <h1 className="text-xl font-bold">Maya v4.2 — Assistente de Produção</h1>
          <p className="text-xs text-secondary">
            {currentProject
              ? `Projeto ativo: ${currentProject.nome}`
              : `Modo Chat Geral (${generalChatMessages.length} mensagens gravadas)`}
          </p>
        </div>

        <button
          onClick={() => setIsChatOpen(true)}
          className="btn-primary text-xs py-2 px-4"
        >
          Abrir Chat com a Maya
        </button>
      </header>

      <main className="max-w-6xl mx-auto text-center py-12">
        <p className="text-sm text-secondary">
          Selecione ou crie um projeto para gerenciar etapas, ou clique no botão acima para conversar com a Maya em modo livre.
        </p>
      </main>

      {/* Modal de Chat de Produção */}
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