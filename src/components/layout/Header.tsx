import React from 'react';
import { BrainCircuit, Settings, Plus, Download, Menu, Video, CheckCircle2, MessageSquareText, SunMedium, MoonStar } from 'lucide-react';
import type { Project } from '../../types/project';
import { Badge } from '../ui/Badge';

interface HeaderProps {
  activeProject: Project | null;
  onOpenConscience: () => void;
  onOpenSettings: () => void;
  onOpenNewProject: () => void;
  onToggleSidebar: () => void;
  onExportProject: () => void;
  onOpenChat: () => void;
  themeMode: 'light' | 'dark';
  onToggleTheme: () => void;
  onResetWorkspace: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeProject,
  onOpenConscience,
  onOpenSettings,
  onOpenNewProject,
  onToggleSidebar,
  onExportProject,
  onOpenChat,
  themeMode,
  onToggleTheme,
  onResetWorkspace
}) => {
  return (
    <header className="app-header sticky top-0 z-40 w-full bg-nebula/90 backdrop-blur-md border-b border-nebula px-4 lg:px-6 py-3 flex items-center justify-between shadow-lg">
      {/* Brand & Toggle */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-secondary hover:text-frost hover:bg-white/5 transition-colors lg:hidden"
          title="Menu de Projetos"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-3">
          {/* Avatar da Maya (§10.3: Círculo Pulse, inicial M em Void) */}
          <button
            onClick={onOpenConscience}
            className="relative flex items-center justify-center w-10 h-10 rounded-full bg-pulse text-void font-heading font-extrabold text-xl shadow-glow-pulse animate-pulse-glow"
            title="Abrir a memória da Maya"
          >
            M
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-signal rounded-full border-2 border-nebula" title="Maya Ativa" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-lg text-frost tracking-tight">MAYA</span>
              <span className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded bg-pulse/20 text-pulse border border-pulse/30">v4.2</span>
              <span className="hidden md:inline-flex text-xs text-muted">|</span>
              <span className="hidden md:inline-flex text-xs font-medium text-secondary">Trick Gamer 112</span>
            </div>
            <p className="text-xs text-muted hidden sm:block">Motor de Automação e YouTube Ampliado - Assistente de Produção & Co-piloto</p>
          </div>
        </div>
      </div>

      {/* Active Project Title on Central Bar */}
      {activeProject && (
        <div className="hidden xl:flex items-center gap-3 px-4 py-1.5 rounded-full bg-void/60 border border-nebula">
          <div className="w-2 h-2 rounded-full bg-signal animate-pulse" />
          <span className="text-xs text-secondary">Projeto Ativo:</span>
          <span className="text-sm font-semibold text-frost truncate max-w-xs">{activeProject.nome}</span>
          <Badge variant="pulse" icon={<Video size={11} />}>{activeProject.jogo}</Badge>
          {activeProject.status === 'concluido' && (
            <Badge variant="success" icon={<CheckCircle2 size={11} />}>Concluído</Badge>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onOpenChat}
          className="btn-ghost p-2 sm:px-3 text-secondary hover:text-frost"
          title="Abrir chat da Maya"
        >
          <MessageSquareText size={18} />
          <span className="hidden sm:inline">Chat</span>
        </button>

        <button
          onClick={onToggleTheme}
          className="btn-ghost p-2 sm:px-3 text-secondary hover:text-frost"
          title={themeMode === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
        >
          {themeMode === 'dark' ? <SunMedium size={18} /> : <MoonStar size={18} />}
          <span className="hidden sm:inline">{themeMode === 'dark' ? 'Claro' : 'Escuro'}</span>
        </button>

        <button
          onClick={onResetWorkspace}
          className="btn-ghost p-2 sm:px-3 text-secondary hover:text-frost"
          title="Começar uma sessão nova"
        >
          <span className="hidden sm:inline">Novo Chat</span>
        </button>

        {activeProject && (
          <button
            onClick={onExportProject}
            className="btn-ghost text-xs hidden md:inline-flex"
            title="Exportar Roteiro e Dados do Projeto"
          >
            <Download size={15} />
            <span>Exportar</span>
          </button>
        )}

        <button
          onClick={onOpenConscience}
          className="btn-secondary text-xs sm:text-sm py-2 px-3 sm:px-4"
          title="Ver e Editar a Base de Consciência Viva do Canal"
        >
          <BrainCircuit size={16} className="text-signal" />
          <span className="hidden sm:inline">Consciência</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="btn-ghost p-2 sm:px-3 text-secondary hover:text-frost"
          title="Configurações de IA"
        >
          <Settings size={18} />
        </button>

        <button
          onClick={onOpenNewProject}
          className="btn-primary text-xs sm:text-sm py-2 px-3 sm:px-4"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Novo Vídeo</span>
        </button>
      </div>
    </header>
  );
};
