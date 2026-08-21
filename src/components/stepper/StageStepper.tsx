import React from 'react';
import type { EtapaNumero, Project } from '../../types/project';
import { STAGES_CONFIG } from '../../data/stageDefinitions';
import { 
  Compass, Sparkles, Flame, Image, FileText, 
  Video, Film, Search, UploadCloud, BrainCircuit, 
  Check, Lock 
} from 'lucide-react';

interface StageStepperProps {
  project: Project;
  selectedStage: EtapaNumero;
  onSelectStage: (stage: EtapaNumero) => void;
}

const STAGE_ICONS: Record<number, React.ReactNode> = {
  1: <Compass size={16} />,
  2: <Sparkles size={16} />,
  3: <Flame size={16} />,
  4: <Image size={16} />,
  5: <FileText size={16} />,
  6: <Video size={16} />,
  7: <Film size={16} />,
  8: <Search size={16} />,
  9: <UploadCloud size={16} />,
  10: <BrainCircuit size={16} />
};

export const StageStepper: React.FC<StageStepperProps> = ({
  project,
  selectedStage,
  onSelectStage
}) => {
  const currentStageNum = project.etapaAtual;
  const isCompleted = project.status === 'concluido';

  // Cálculo de progresso percentual
  const progressPercent = isCompleted 
    ? 100 
    : Math.round(((currentStageNum - 1) / 10) * 100);

  return (
    <div className="w-full card-nebula p-4 sm:p-5 border-b border-nebula bg-nebula shadow-md">
      {/* Top Status & Progress Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-signal uppercase tracking-wider font-semibold">
              Pipeline de Produção
            </span>
            <span className="text-xs text-muted">•</span>
            <span className="text-xs text-secondary font-medium">
              {isCompleted ? 'Todas as 10 etapas concluídas!' : `Etapa ${currentStageNum} de 10: ${STAGES_CONFIG[currentStageNum].nome}`}
            </span>
          </div>
          <h2 className="text-lg font-heading font-bold text-frost mt-0.5">
            {STAGES_CONFIG[selectedStage].nome}
          </h2>
        </div>

        {/* Progress percent display */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="text-right">
            <span className="text-xs font-mono text-muted">Progresso:</span>
            <span className="text-sm font-mono font-bold text-signal ml-1.5">{progressPercent}%</span>
          </div>
          <div className="w-24 sm:w-32 h-2 rounded-full bg-void border border-nebula overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-pulse to-signal transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 10-Stage Horizontal Stepper Track */}
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-1.5 pt-1">
        {(Object.keys(STAGES_CONFIG) as unknown as EtapaNumero[]).map((num) => {
          const stageNum = Number(num) as EtapaNumero;
          const stageDef = STAGES_CONFIG[stageNum];
          const stageData = project.etapas[stageNum];
          
          const isCurrentActive = stageNum === currentStageNum && !isCompleted;
          const isSelected = stageNum === selectedStage;
          const isDone = stageData?.status === 'aprovado' || (isCompleted && stageNum <= 10);
          const isLocked = stageNum > currentStageNum && !isCompleted;

          return (
            <button
              key={stageNum}
              disabled={isLocked}
              onClick={() => onSelectStage(stageNum)}
              title={isLocked ? `Etapa ${stageNum} bloqueada (complete a etapa ${currentStageNum} primeiro)` : `${stageNum}. ${stageDef.nome}`}
              className={`
                group relative flex flex-col items-center p-2 rounded-xl border text-center transition-all duration-200
                ${isSelected 
                  ? 'bg-pulse/15 border-pulse shadow-glow-pulse scale-105 z-10' 
                  : isDone 
                    ? 'bg-nebula border-signal/40 hover:border-signal hover:bg-signal/5' 
                    : isCurrentActive
                      ? 'bg-nebula border-pulse/60 animate-pulse-glow hover:border-pulse'
                      : 'bg-void/40 border-nebula/60 opacity-40 cursor-not-allowed'
                }
              `}
            >
              {/* Stage Icon / Status Bubble */}
              <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center transition-transform
                ${isDone 
                  ? 'bg-signal/20 text-signal' 
                  : isCurrentActive 
                    ? 'bg-pulse text-frost font-bold shadow-md' 
                    : isLocked 
                      ? 'bg-void text-muted' 
                      : 'bg-nebula text-secondary'
                }
              `}>
                {isDone ? (
                  <Check size={16} className="text-signal stroke-[2.5]" />
                ) : isLocked ? (
                  <Lock size={14} className="text-muted" />
                ) : (
                  STAGE_ICONS[stageNum]
                )}
              </div>

              {/* Stage Number & Name */}
              <span className="text-[10px] font-mono mt-1.5 font-bold text-muted group-hover:text-frost">
                #{stageNum}
              </span>
              <span className="text-[10px] font-heading font-medium text-secondary truncate w-full hidden md:block">
                {stageDef.nome.split('&')[0].trim()}
              </span>

              {/* Active Indicator Pin */}
              {isSelected && (
                <div className="absolute -bottom-1 w-2 h-2 rounded-full bg-pulse shadow-glow-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
