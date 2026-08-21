import React, { useState } from 'react';
import type { FlowMode } from '../../types/project';
import { Modal } from '../ui/Modal';
import { Plus, Film, Zap, Compass, UploadCloud } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (
    nome: string,
    jogo: string,
    nicho: string,
    ideiaCentral: string,
    objetivoVideo: string,
    tempoEstimadoMinutos: number,
    modoFluxo: FlowMode
  ) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject
}) => {
  // Inicializando com campos limpos por padrão
  const [nome, setNome] = useState('');
  const [jogo, setJogo] = useState('');
  const [nicho, setNicho] = useState('');
  const [ideiaCentral, setIdeiaCentral] = useState('');
  const [objetivoVideo, setObjetivoVideo] = useState('');
  const [tempoEstimadoMinutos, setTempoEstimadoMinutos] = useState<number | ''>('');
  const [modoFluxo, setModoFluxo] = useState<FlowMode>('projeto_novo');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jogo.trim() || !ideiaCentral.trim()) return;

    onCreateProject(
      nome.trim() || `Vídeo ${jogo} - ${ideiaCentral.slice(0, 30)}`,
      jogo.trim(),
      nicho.trim() || 'Gameplay & Tutoriais',
      ideiaCentral.trim(),
      objetivoVideo.trim() || 'Entregar um conteúdo de alto valor e entretenimento para os inscritos',
      typeof tempoEstimadoMinutos === 'number' && tempoEstimadoMinutos > 0 ? tempoEstimadoMinutos : 12,
      modoFluxo
    );

    // Reseta o formulário após a criação
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setNome('');
    setJogo('');
    setNicho('');
    setIdeiaCentral('');
    setObjetivoVideo('');
    setTempoEstimadoMinutos('');
    setModoFluxo('projeto_novo');
  };

  const applyTemplate = (game: string, idea: string, genre: string, targetName: string) => {
    setJogo(game);
    setIdeiaCentral(idea);
    setNicho(genre);
    setNome(targetName);
    setTempoEstimadoMinutos(14);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title="Iniciar Novo Vídeo no Pipeline"
      subtitle="Configure o jogo e o objetivo inicial para a Maya assumir o co-pilot"
      icon={<Film size={20} />}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Quick Example Chips */}
        <div>
          <span className="text-[11px] font-mono text-muted uppercase block mb-1.5">Sugestões Rápidas:</span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => applyTemplate(
                'Palworld', 
                'Como construir a base automatizada mais rápida sem perder Pals', 
                'Sobrevivência & Guia', 
                'Palworld: Base Automatizada Perfeita'
              )}
              className="text-xs py-1 px-2.5 rounded-lg bg-void border border-nebula text-secondary hover:border-pulse hover:text-frost"
            >
              Palworld: Base Automatizada
            </button>

            <button
              type="button"
              onClick={() => applyTemplate(
                'Elden Ring', 
                'As 5 armas secretas que destroem chefes no early game', 
                'RPG de Ação / Dicas Rápidas', 
                'Elden Ring: 5 Armas Secretas'
              )}
              className="text-xs py-1 px-2.5 rounded-lg bg-void border border-nebula text-secondary hover:border-pulse hover:text-frost"
            >
              Elden Ring: Armas Secretas
            </button>

            <button
              type="button"
              onClick={() => applyTemplate(
                'GTA 5 / 6', 
                'Testando mitos bizarros que ninguém teve coragem de testar', 
                'Mitos & Desafios', 
                'GTA: Quebrando Mitos Bizarros'
              )}
              className="text-xs py-1 px-2.5 rounded-lg bg-void border border-nebula text-secondary hover:border-pulse hover:text-frost"
            >
              GTA: Caçadores de Mitos
            </button>
          </div>
        </div>

        {/* Project Name & Game */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-frost mb-1">Nome do Projeto / Rascunho</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Palworld - Guia de Eletricidade"
              className="input-nebula text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-frost mb-1">Jogo *</label>
            <input
              type="text"
              value={jogo}
              onChange={(e) => setJogo(e.target.value)}
              placeholder="Ex: Palworld, Minecraft, Elden Ring..."
              className="input-nebula text-xs font-bold text-signal"
              required
            />
          </div>
        </div>

        {/* Nicho & Duração */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-frost mb-1">Nicho / Categoria</label>
            <input
              type="text"
              value={nicho}
              onChange={(e) => setNicho(e.target.value)}
              placeholder="Ex: Sobrevivência & Guia de Automação"
              className="input-nebula text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-frost mb-1">Duração Estimada (minutos)</label>
            <input
              type="number"
              value={tempoEstimadoMinutos}
              onChange={(e) => setTempoEstimadoMinutos(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Ex: 12"
              min={1}
              max={120}
              className="input-nebula text-xs font-mono"
            />
          </div>
        </div>

        {/* Ideia Central */}
        <div>
          <label className="block text-xs font-semibold text-frost mb-1">Ideia Central do Vídeo *</label>
          <textarea
            rows={2}
            value={ideiaCentral}
            onChange={(e) => setIdeiaCentral(e.target.value)}
            placeholder="Qual é a proposta principal do vídeo? O que você vai mostrar ou fazer no jogo?"
            className="input-nebula text-xs"
            required
          />
        </div>

        {/* Objetivo */}
        <div>
          <label className="block text-xs font-semibold text-frost mb-1">Objetivo / Transformação para o Espectador</label>
          <input
            type="text"
            value={objetivoVideo}
            onChange={(e) => setObjetivoVideo(e.target.value)}
            placeholder="Ex: Ensinar o método definitivo para poupar tempo de farm e evoluir rápido"
            className="input-nebula text-xs"
          />
        </div>

        {/* Modo de Fluxo */}
        <div>
          <label className="block text-xs font-semibold text-frost mb-1.5">Modo de Fluxo de Produção:</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div
              onClick={() => setModoFluxo('projeto_novo')}
              className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                modoFluxo === 'projeto_novo'
                  ? 'bg-pulse/15 border-pulse text-frost shadow-glow-pulse'
                  : 'bg-void border-nebula text-secondary hover:border-pulse/40'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold mb-1 text-frost">
                <Compass size={14} className="text-pulse" />
                <span>Projeto Novo</span>
              </div>
              <p className="text-[10px] text-secondary">
                Do zero da Etapa 1 à Etapa 10 (Briefing ➔ SEO).
              </p>
            </div>

            <div
              onClick={() => setModoFluxo('atalho_bruto')}
              className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                modoFluxo === 'atalho_bruto'
                  ? 'bg-signal/15 border-signal text-frost shadow-glow-signal'
                  : 'bg-void border-nebula text-secondary hover:border-signal/40'
              }`}
            >
              <div className="flex items-center gap-2 font-bold mb-1 text-frost">
                <Zap size={14} className="text-signal" />
                <span>Atalho Bruto</span>
              </div>
              <p className="text-[10px] text-secondary">
                Para vídeos gravados sem roteiro. Pula para a Etapa 6/7.
              </p>
            </div>

            <div
              onClick={() => setModoFluxo('video_pronto')}
              className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                modoFluxo === 'video_pronto'
                  ? 'bg-success/15 border-success text-frost shadow-md'
                  : 'bg-void border-nebula text-secondary hover:border-success/40'
              }`}
            >
              <div className="flex items-center gap-2 font-bold mb-1 text-frost">
                <UploadCloud size={14} className="text-success" />
                <span>Vídeo Pronto</span>
              </div>
              <p className="text-[10px] text-secondary">
                Vídeo e edição concluídos. Pula direto para a Etapa 8 (SEO & Títulos).
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-nebula flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="btn-ghost text-xs"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary text-xs sm:text-sm py-2 px-5"
          >
            <Plus size={16} />
            <span>Criar Projeto e Abrir Pipeline</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};