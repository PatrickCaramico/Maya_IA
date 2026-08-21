import React, { useState } from 'react';
import type { Project } from '../../types/project';
import { Plus, Film, CheckCircle2, Clock, Trash2, X } from 'lucide-react';

interface SidebarProps {
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (id: string) => void;
  onDeleteProject: (id: string, e: React.MouseEvent) => void;
  onOpenNewProject: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onDeleteProject,
  onOpenNewProject,
  isOpenMobile,
  onCloseMobile
}) => {
  const [filter, setFilter] = useState<'todos' | 'em_andamento' | 'concluido'>('todos');

  const filteredProjects = projects.filter(p => {
    if (filter === 'em_andamento') return p.status === 'em_andamento';
    if (filter === 'concluido') return p.status === 'concluido';
    return true;
  });

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-40 w-72 sm:w-80 bg-nebula border-r border-nebula flex flex-col transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-nebula flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film size={18} className="text-pulse" />
            <h3 className="font-heading font-bold text-sm text-frost uppercase tracking-wider">Fila de Produção</h3>
          </div>
          <button 
            onClick={onCloseMobile}
            className="p-1 rounded-md text-secondary hover:text-frost lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="p-3 border-b border-nebula bg-void/30 flex items-center gap-1">
          <button
            onClick={() => setFilter('todos')}
            className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-md transition-colors ${
              filter === 'todos' ? 'bg-pulse text-frost shadow-sm' : 'text-secondary hover:text-frost hover:bg-white/5'
            }`}
          >
            Todos ({projects.length})
          </button>
          <button
            onClick={() => setFilter('em_andamento')}
            className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-md transition-colors ${
              filter === 'em_andamento' ? 'bg-pulse text-frost shadow-sm' : 'text-secondary hover:text-frost hover:bg-white/5'
            }`}
          >
            Ativos ({projects.filter(p => p.status === 'em_andamento').length})
          </button>
          <button
            onClick={() => setFilter('concluido')}
            className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-md transition-colors ${
              filter === 'concluido' ? 'bg-pulse text-frost shadow-sm' : 'text-secondary hover:text-frost hover:bg-white/5'
            }`}
          >
            Prontos ({projects.filter(p => p.status === 'concluido').length})
          </button>
        </div>

        {/* Projects List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-10 px-4">
              <Film size={32} className="mx-auto text-muted/50 mb-3" />
              <p className="text-xs text-secondary font-medium">Nenhum projeto nesta categoria.</p>
              <p className="text-[11px] text-muted mt-1">Crie um novo vídeo para começar o pipeline da Maya!</p>
              <button
                onClick={onOpenNewProject}
                className="btn-secondary text-xs mt-4 w-full py-2"
              >
                <Plus size={14} /> Novo Projeto
              </button>
            </div>
          ) : (
            filteredProjects.map((project) => {
              const isActive = project.id === activeProjectId;
              const isCompleted = project.status === 'concluido';

              return (
                <div
                  key={project.id}
                  onClick={() => {
                    onSelectProject(project.id);
                    onCloseMobile();
                  }}
                  className={`
                    sidebar-project-card group relative p-3 rounded-xl border transition-all cursor-pointer text-left
                    ${isActive 
                      ? 'sidebar-project-card-active bg-nebula-elevated border-pulse shadow-glow-pulse' 
                      : 'bg-void/40 border-nebula hover:border-pulse/50 hover:bg-void/70'
                    }
                  `}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="sidebar-project-card-title font-heading font-semibold text-sm text-frost truncate group-hover:text-pulse transition-colors">
                        {project.nome}
                      </h4>
                      <p className="sidebar-project-card-subtitle text-xs text-secondary truncate mt-0.5">{project.jogo}</p>
                    </div>

                    <button
                      onClick={(e) => onDeleteProject(project.id, e)}
                      className="sidebar-project-card-action opacity-0 group-hover:opacity-100 p-1 text-muted hover:text-alert transition-opacity rounded"
                      title="Excluir Projeto"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="sidebar-project-card-footer flex items-center justify-between mt-3 pt-2 border-t border-nebula/60 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      {isCompleted ? (
                        <span className="sidebar-project-card-status inline-flex items-center gap-1 text-success font-medium">
                          <CheckCircle2 size={12} /> Concluído
                        </span>
                      ) : (
                        <span className="sidebar-project-card-status inline-flex items-center gap-1 text-signal font-medium">
                          <Clock size={12} /> Etapa {project.etapaAtual}/10
                        </span>
                      )}
                    </div>

                    <span className="sidebar-project-card-meta text-muted text-[10px]">
                      {new Date(project.atualizadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-nebula bg-nebula-elevated">
          <button
            onClick={onOpenNewProject}
            className="w-full btn-primary justify-center text-xs py-2.5"
          >
            <Plus size={15} />
            <span>Criar Novo Projeto</span>
          </button>
        </div>
      </aside>
    </>
  );
};
