import React, { useState } from 'react';
import type { Project, EtapaNumero, ConversationAttachment } from './types/project';
import type { ConscienceData } from './types/conscience';
import { DEFAULT_AI_SETTINGS, generateMayaChatReply, type AISettings } from './engine/aiService';
import { ProductionChatModal } from './components/chat/ProductionChatModal';

// Exemplo de dados iniciais para Consciência da Maya
const initialConscience: ConscienceData = {
  canal: {
    nome: 'Trick Gamer 112',
    criador: 'Patrick',
    nicho: 'Games / Modpacks / Tutoriais'
  }
};

export const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<EtapaNumero>(1);
  const [aiSettings, setAiSettings] = useState<AISettings>(DEFAULT_AI_SETTINGS);
  const [conscience] = useState<ConscienceData>(initialConscience);

  // Estado para armazenar mensagens do Chat Geral (quando não há projeto selecionado)
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
   * Manipulador do envio de mensagens do Chat (Unificado para Projetos e Chat Geral)
   */
  const handleSendChatMessage = async (
    text: string,
    attachments: ConversationAttachment[]
  ): Promise<string> => {
    setIsGenerating(true);

    try {
      // 1. Chama o serviço de IA da Maya (suporta currentProject real ou null)
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

      // 2. Se houver projeto ativo, salva no histórico da etapa correspondente
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
        // 3. Se NÃO houver projeto ativo (Chat Geral), salva no estado global do chat
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
   * Limpar a conversa atual (do Projeto ou Geral)
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

  // Determina quais mensagens enviar para exibição no modal
  const displayedMessages = currentProject
    ? currentProject.etapas[selectedStage]?.conversation || []
    : generalChatMessages;

  return (
    <div className="min-h-screen bg-void text-frost p-6">
      <header className="max-w-6xl mx-auto flex items-center justify-between border-b border-nebula pb-4 mb-6">
        <div>
          <h1 className="text-xl font-bold">Maya v4.2 — Assistente de Produção</h1>
          <p className="text-xs text-secondary">
            {currentProject
              ? `Projeto ativo: ${currentProject.nome}`
              : 'Modo Chat Geral (Sem projeto ativo selecionado)'}
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