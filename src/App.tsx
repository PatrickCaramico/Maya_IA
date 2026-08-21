import React, { useState, useEffect } from 'react';
import type { Project, EtapaNumero, FlowMode, VideoMetrics } from './types/project';
import type { ConscienceData } from './types/conscience';
import type { AISettings } from './engine/aiService';
import { generateMayaStageContent } from './engine/aiService';
import { generateMayaChatReply, isGreetingOnly } from './engine/aiService';
import { 
  createNewProject, 
  approveCurrentStage, 
  remakeStage, 
  goBackToStage, 
  updateStageOutput, 
  appendStageConversation,
  toggleProjectChecklist 
} from './engine/stateMachine';
import { 
  loadProjects, 
  saveProjects, 
  saveSingleProject, 
  saveActiveProjectId, 
  loadActiveProjectId,
  loadConscience, 
  saveConscience, 
  loadAISettings, 
  saveAISettings, 
  recordMetricsToConscience 
} from './engine/storage';

import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { StageStepper } from './components/stepper/StageStepper';
import { StagePanel } from './components/stage/StagePanel';
import { ConscienceModal } from './components/conscience/ConscienceModal';
import { ProductionChatModal } from './components/chat/ProductionChatModal';
import { ConfirmModal } from './components/ui/ConfirmModal';
import { NewProjectModal } from './components/projects/NewProjectModal';
import { SettingsModal } from './components/settings/SettingsModal';

import { Plus, Sparkles } from 'lucide-react';

type InitialWorkspaceState = {
  projects: Project[];
  activeProjectId: string | null;
  selectedStage: EtapaNumero;
};

function getInitialWorkspaceState(): InitialWorkspaceState {
  const savedProjects = loadProjects();
  const savedActiveId = loadActiveProjectId();

  return {
    projects: savedProjects,
    activeProjectId: savedActiveId || (savedProjects[0]?.id || null),
    selectedStage: 1
  };
}

export const App: React.FC = () => {
  const [initialWorkspace] = useState<InitialWorkspaceState>(() => getInitialWorkspaceState());
  const [projects, setProjects] = useState<Project[]>(initialWorkspace.projects);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(initialWorkspace.activeProjectId);
  const [selectedStage, setSelectedStage] = useState<EtapaNumero>(initialWorkspace.selectedStage);
  const [conscience, setConscience] = useState<ConscienceData>(loadConscience());
  const [aiSettings, setAiSettings] = useState<AISettings>(loadAISettings());
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    const storedTheme = localStorage.getItem('maya_theme_mode');
    if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });
  const [isGenerating, setIsGenerating] = useState(false);

  // Modais
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isConscienceOpen, setIsConscienceOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isProductionChatOpen, setIsProductionChatOpen] = useState(false);
  const [conscienceInitialTab, setConscienceInitialTab] = useState<'thumbs' | 'titulos' | 'retencao' | 'canal' | 'historico'>('thumbs');
  const [pendingConfirm, setPendingConfirm] = useState<null | 'reset-workspace'>(null);

  // Tema
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
    localStorage.setItem('maya_theme_mode', themeMode);
  }, [themeMode]);

  // Projeto ativo atual
  const activeProject = projects.find(p => p.id === activeProjectId) || null;
  const chatProject = activeProject || projects[0] || null;

  // Salvar estado central
  const updateProjectInStateAndStorage = (updated: Project) => {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
    saveSingleProject(updated);
  };

  // Seleção de projeto
  const handleSelectProject = (id: string) => {
    setActiveProjectId(id);
    saveActiveProjectId(id);
    const p = projects.find(proj => proj.id === id);
    if (p) {
      setSelectedStage(p.etapaAtual);
    }
  };

  // Criação de projeto
  const handleCreateProject = (
    nome: string,
    jogo: string,
    nicho: string,
    ideiaCentral: string,
    objetivoVideo: string,
    tempoEstimadoMinutos: number,
    modoFluxo: FlowMode
  ) => {
    const newProj = createNewProject(
      nome,
      jogo,
      nicho,
      ideiaCentral,
      objetivoVideo,
      tempoEstimadoMinutos,
      modoFluxo
    );

    const updated = [newProj, ...projects];
    setProjects(updated);
    saveProjects(updated);
    setActiveProjectId(newProj.id);
    saveActiveProjectId(newProj.id);
    setSelectedStage(newProj.etapaAtual);
  };

  // Exclusão de projeto
  const handleDeleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir este projeto da fila de produção?')) {
      const updated = projects.filter(p => p.id !== id);
      setProjects(updated);
      saveProjects(updated);
      if (activeProjectId === id) {
        const nextId = updated[0]?.id || null;
        setActiveProjectId(nextId);
        saveActiveProjectId(nextId);
        if (nextId) {
          const nextProj = updated.find(p => p.id === nextId);
          if (nextProj) setSelectedStage(nextProj.etapaAtual);
        } else {
          setSelectedStage(1);
        }
      }
    }
  };

  // Geração de conteúdo
  const handleGenerateContent = async (stage: EtapaNumero, feedback?: string) => {
    if (!activeProject) return;
    setIsGenerating(true);

    try {
      const generatedText = await generateMayaStageContent(
        activeProject,
        stage,
        conscience,
        aiSettings,
        feedback
      );

      const updatedProject = updateStageOutput(activeProject, stage, generatedText);
      updateProjectInStateAndStorage(updatedProject);
    } catch (err: any) {
      alert(`Erro ao gerar saída da Maya: ${err.message || err}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Aprovação de etapa
  const handleApproveStage = (feedback?: string) => {
    if (!activeProject) return;
    try {
      const updatedProject = approveCurrentStage(activeProject, feedback);
      updateProjectInStateAndStorage(updatedProject);
      setSelectedStage(updatedProject.etapaAtual);
    } catch (err: any) {
      alert(err.message || 'Erro ao aprovar etapa.');
    }
  };

  // Chat com a Maya
  const handleAskMaya = async (userMessage: string): Promise<string> => {
    if (!activeProject) return '';
    setIsGenerating(true);

    try {
      const chatReply = await generateMayaChatReply(
        activeProject,
        selectedStage,
        conscience,
        aiSettings,
        userMessage
      );

      let updatedProject = appendStageConversation(
        activeProject,
        selectedStage,
        userMessage,
        chatReply
      );

      if (!isGreetingOnly(userMessage)) {
        const updatedStageContent = await generateMayaStageContent(
          updatedProject,
          selectedStage,
          conscience,
          aiSettings,
          userMessage
        );
        updatedProject = updateStageOutput(updatedProject, selectedStage, updatedStageContent);
      }

      updateProjectInStateAndStorage(updatedProject);
      return chatReply;
    } catch (err: any) {
      alert(`Erro ao conversar com a Maya: ${err.message || err}`);
      return '';
    } finally {
      setIsGenerating(false);
    }
  };

  // 1. Apaga APENAS a conversa do chat na etapa selecionada
  const handleResetCurrentConversationOnly = () => {
    if (!activeProject) return;

    const updatedProject: Project = {
      ...activeProject,
      atualizadoEm: new Date().toISOString(),
      etapas: {
        ...activeProject.etapas,
        [selectedStage]: {
          ...activeProject.etapas[selectedStage],
          conversation: []
        }
      }
    };

    updateProjectInStateAndStorage(updatedProject);
  };

  // 2. Apaga a conversa E reseta a saída/alterações da etapa
  const handleResetStageAndConversation = () => {
    if (!activeProject) return;

    const updatedProject: Project = {
      ...activeProject,
      atualizadoEm: new Date().toISOString(),
      etapas: {
        ...activeProject.etapas,
        [selectedStage]: {
          ...activeProject.etapas[selectedStage],
          conversation: [],
          saidaGerada: undefined
        }
      }
    };

    updateProjectInStateAndStorage(updatedProject);
  };

  const handleResetWorkspace = () => {
    setPendingConfirm('reset-workspace');
  };

  const applyResetWorkspace = () => {
    setActiveProjectId(null);
    saveActiveProjectId(null);
    setSelectedStage(1);
    setIsProductionChatOpen(false);
    setIsConscienceOpen(false);
    setIsSettingsOpen(false);
    setIsNewProjectOpen(false);
    setIsSidebarOpenMobile(false);
  };

  // Refazer Etapa
  const handleRemakeStage = () => {
    if (!activeProject) return;
    if (window.confirm('Deseja regenerar esta etapa do zero?')) {
      const updated = remakeStage(activeProject);
      updateProjectInStateAndStorage(updated);
      handleGenerateContent(selectedStage);
    }
  };

  // Voltar Etapa
  const handleGoBackStage = (targetStage: EtapaNumero) => {
    if (!activeProject) return;
    const updated = goBackToStage(activeProject, targetStage);
    updateProjectInStateAndStorage(updated);
    setSelectedStage(targetStage);
  };

  // Checklist
  const handleToggleChecklist = (itemId: string) => {
    if (!activeProject) return;
    const updated = toggleProjectChecklist(activeProject, itemId);
    updateProjectInStateAndStorage(updated);
  };

  // Métricas Etapa 10
  const handleSaveStage10Metrics = (metrics: VideoMetrics, newLearning: string) => {
    if (!activeProject) return;

    const updatedConscience = recordMetricsToConscience(activeProject, metrics, newLearning);
    setConscience(updatedConscience);

    const updatedProject: Project = {
      ...activeProject,
      status: 'concluido',
      metricasFinais: metrics,
      atualizadoEm: new Date().toISOString()
    };

    updateProjectInStateAndStorage(updatedProject);
  };

  // Consciência
  const handleUpdateConscience = (newConscience: ConscienceData) => {
    setConscience(newConscience);
    saveConscience(newConscience);
  };

  // Configurações
  const handleSaveSettings = (newSettings: AISettings) => {
    setAiSettings(newSettings);
    saveAISettings(newSettings);
  };

  // Exportar Markdown
  const handleExportProjectMarkdown = () => {
    if (!activeProject) return;
    let doc = `# PROJETO: ${activeProject.nome}\n`;
    doc += `**Canal:** Trick Gamer 112 | **Criador:** Patrick\n`;
    doc += `**Jogo:** ${activeProject.jogo} | **Status:** ${activeProject.status}\n`;
    doc += `**Criado em:** ${new Date(activeProject.criadoEm).toLocaleDateString('pt-BR')}\n\n`;
    doc += `---\n\n`;

    for (let i = 1; i <= 10; i++) {
      const stage = activeProject.etapas[i as EtapaNumero];
      if (stage && stage.saidaGerada) {
        doc += `\n## [ETAPA ${i}: ${stage.nome}]\n\n`;
        doc += `${stage.saidaGerada}\n\n`;
        doc += `---\n`;
      }
    }

    const dataStr = "data:text/markdown;charset=utf-8," + encodeURIComponent(doc);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${activeProject.id}_roteiro_completo.md`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-void flex flex-col selection:bg-pulse selection:text-frost">
      <Header
        activeProject={activeProject}
        onOpenConscience={() => {
          setConscienceInitialTab('canal');
          setIsConscienceOpen(true);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenNewProject={() => setIsNewProjectOpen(true)}
        onToggleSidebar={() => setIsSidebarOpenMobile(true)}
        onExportProject={handleExportProjectMarkdown}
        onOpenChat={() => setIsProductionChatOpen(true)}
        themeMode={themeMode}
        onToggleTheme={() => setThemeMode((current) => (current === 'dark' ? 'light' : 'dark'))}
        onResetWorkspace={handleResetWorkspace}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          projects={projects}
          activeProjectId={activeProjectId}
          onSelectProject={handleSelectProject}
          onDeleteProject={handleDeleteProject}
          onOpenNewProject={() => setIsNewProjectOpen(true)}
          isOpenMobile={isSidebarOpenMobile}
          onCloseMobile={() => setIsSidebarOpenMobile(false)}
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
          {activeProject ? (
            <div className="max-w-5xl mx-auto space-y-6">
              <StageStepper
                project={activeProject}
                selectedStage={selectedStage}
                onSelectStage={(stage) => setSelectedStage(stage)}
              />

              <StagePanel
                key={`${activeProject.id}-${selectedStage}`}
                project={activeProject}
                selectedStage={selectedStage}
                isGenerating={isGenerating}
                onGenerateContent={handleGenerateContent}
                onApproveStage={handleApproveStage}
                onAskMaya={handleAskMaya}
                onRemakeStage={handleRemakeStage}
                onGoBackStage={handleGoBackStage}
                onToggleChecklist={handleToggleChecklist}
                onSaveStage10Metrics={handleSaveStage10Metrics}
                onResetConversationOnly={handleResetCurrentConversationOnly}
                onResetStageAndConversation={handleResetStageAndConversation}
              />
            </div>
          ) : (
            <div className="max-w-md mx-auto text-center py-20 card-nebula p-8 my-10">
              <div className="w-16 h-16 rounded-3xl bg-pulse/20 text-pulse flex items-center justify-center mx-auto mb-4 border border-pulse/30 shadow-glow-pulse animate-pulse-glow">
                <Sparkles size={32} />
              </div>
              <h2 className="text-xl font-heading font-bold text-frost">Bem-vindo à Maya v4.2!</h2>
              <p className="text-xs text-secondary mt-2 mb-6 leading-relaxed">
                Sua co-produtora inteligente para o canal Trick Gamer 112. Vamos criar o seu primeiro vídeo no pipeline guiado de 10 etapas?
              </p>
              <button
                onClick={() => setIsNewProjectOpen(true)}
                className="btn-primary text-sm py-2.5 px-6 mx-auto"
              >
                <Plus size={16} />
                <span>Criar Primeiro Vídeo</span>
              </button>
            </div>
          )}
        </main>
      </div>

      {isNewProjectOpen && (
        <NewProjectModal
          isOpen={isNewProjectOpen}
          onClose={() => setIsNewProjectOpen(false)}
          onCreateProject={handleCreateProject}
        />
      )}

      {isConscienceOpen && (
        <ConscienceModal
          isOpen={isConscienceOpen}
          onClose={() => setIsConscienceOpen(false)}
          conscience={conscience}
          onUpdateConscience={handleUpdateConscience}
          initialTab={conscienceInitialTab}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={aiSettings}
          onSaveSettings={handleSaveSettings}
        />
      )}

      <ProductionChatModal
        isOpen={isProductionChatOpen}
        onClose={() => setIsProductionChatOpen(false)}
        project={chatProject}
        selectedStage={selectedStage}
        isGenerating={isGenerating}
        onSendMessage={handleAskMaya}
        settings={aiSettings}
        onResetConversation={handleResetCurrentConversationOnly}
      />

      <ConfirmModal
        isOpen={pendingConfirm === 'reset-workspace'}
        title="Começar uma sessão nova?"
        message="Isso vai limpar o projeto ativo da tela, fechar os modais e te levar para um estado vazio, pronto para um novo vídeo."
        confirmLabel="Novo Chat"
        cancelLabel="Manter atual"
        tone="danger"
        onCancel={() => setPendingConfirm(null)}
        onConfirm={() => {
          applyResetWorkspace();
          setPendingConfirm(null);
        }}
      />
    </div>
  );
};

export default App;