import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { ImagePlus, Send, Sparkles, Paperclip, X } from 'lucide-react';
import type { AISettings } from '../../engine/aiService';
import type { ConversationAttachment, EtapaNumero, Project } from '../../types/project';

interface ProductionChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  selectedStage: EtapaNumero;
  isGenerating: boolean;
  onSendMessage: (
    message: string,
    attachments: ConversationAttachment[]
  ) => Promise<string>;
  settings: AISettings;
  onResetConversation: () => void;
}

export const ProductionChatModal: React.FC<ProductionChatModalProps> = ({
  isOpen,
  onClose,
  project,
  selectedStage,
  isGenerating,
  onSendMessage,
  settings,
  onResetConversation
}) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<ConversationAttachment[]>([]);
  const [pending, setPending] = useState(false);

  const stageMessages = project?.etapas[selectedStage]?.conversation || [];

  const handleFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const mapped = await Promise.all(files.map(async (file) => {
      const dataUrl = await readFileAsDataUrl(file);
      return {
        id: `att_${Date.now()}_${file.name}`,
        name: file.name,
        type: file.type || 'image/*',
        dataUrl
      } satisfies ConversationAttachment;
    }));

    setAttachments((current) => [...current, ...mapped]);
    event.target.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments((current) => current.filter((item) => item.id !== id));
  };

  const handleSubmit = async () => {
    const text = message.trim();
    if (!text) return; // Permite o envio mesmo sem projeto selecionado

    setPending(true);
    const currentText = text;
    const currentAttachments = [...attachments];

    setMessage('');
    setAttachments([]);

    try {
      await onSendMessage(currentText, currentAttachments);
    } catch (err) {
      console.error('Erro ao enviar mensagem no chat:', err);
      setMessage(currentText);
    } finally {
      setPending(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chat de Produção com a Maya"
      subtitle="Converse sobre títulos, thumbs, ideias, biblioteca de jogos, cole links ou tire dúvidas gerais"
      icon={<Sparkles size={18} />}
      maxWidth="1120px"
    >
      <div className="space-y-4 text-left">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={project ? "pulse" : "muted"}>
              {project?.nome || 'CHAT GERAL (Sem Projeto)'}
            </Badge>
            <Badge variant="signal">Etapa #{selectedStage}</Badge>
            <Badge variant={settings.provider === 'simulated' ? 'muted' : 'success'}>
              {settings.provider === 'simulated' ? 'Motor Simulado' : settings.provider}
            </Badge>
          </div>
          <div className="text-[11px] text-secondary">
            Dica: descreva o que quer mudar e anexe screenshots ou listas em imagem.
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 flex-wrap rounded-xl border border-nebula bg-nebula-elevated px-3 py-2">
          <div className="text-[11px] text-secondary">
            Se quiser começar do zero nesta etapa, você pode apagar só esta conversa.
          </div>
          <button
            type="button"
            onClick={onResetConversation}
            className="btn-ghost text-xs py-1.5 px-3"
          >
            Nova conversa
          </button>
        </div>

        <div className="max-h-[46vh] overflow-y-auto rounded-2xl border border-nebula bg-void/80 p-3 space-y-3">
          {stageMessages.length === 0 ? (
            <div className="text-center py-8 text-xs text-secondary">
              Pergunte qualquer coisa para a Maya (sugestões de jogos, ideias de roteiro, dicas de canal, etc.).
            </div>
          ) : (
            stageMessages.map((entry) => (
              <div key={entry.id} className={`flex ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[88%] rounded-2xl px-3 py-2 text-xs border ${entry.role === 'user' ? 'bg-pulse/20 border-pulse/30 text-frost rounded-br-md' : 'bg-nebula border-nebula text-frost rounded-bl-md'}`}>
                  <div className="mb-1 flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.18em] text-secondary">
                    <span className="flex items-center gap-1.5">
                      {entry.role === 'maya' ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-pulse text-void text-[10px] font-bold">M</span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-signal text-void text-[10px] font-bold">P</span>
                      )}
                      <span>{entry.role === 'user' ? 'Patrick' : 'Maya'}</span>
                    </span>
                    <span>{new Date(entry.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="space-y-2">
                    <div>{entry.content}</div>
                    {entry.attachments?.length ? (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {entry.attachments.map((attachment) => (
                          <div key={attachment.id} className="rounded-lg border border-nebula bg-black/20 p-2 text-[10px] text-secondary">
                            <div className="font-semibold text-frost truncate">{attachment.name}</div>
                            <div>{attachment.type}</div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          )}

          {(pending || isGenerating) && (
            <div className="flex justify-start">
              <div className="max-w-[88%] rounded-2xl px-3 py-2 text-xs border bg-nebula border-nebula text-frost rounded-bl-md">
                <div className="mb-1 text-[10px] uppercase tracking-[0.18em] text-secondary">Maya</div>
                <div className="flex items-center gap-2 text-secondary">
                  <Sparkles size={12} className="animate-pulse" />
                  Maya está raciocinando...
                </div>
              </div>
            </div>
          )}
        </div>

        {attachments.length > 0 && (
          <div className="rounded-2xl border border-nebula bg-nebula-elevated p-3 space-y-2">
            <div className="text-[11px] uppercase tracking-[0.18em] text-secondary">Anexos</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {attachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center justify-between gap-2 rounded-xl border border-nebula bg-void/70 px-3 py-2">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-frost truncate">{attachment.name}</div>
                    <div className="text-[10px] text-secondary">{attachment.type}</div>
                  </div>
                  <button type="button" onClick={() => removeAttachment(attachment.id)} className="text-secondary hover:text-frost" title="Remover anexo">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && event.ctrlKey) {
                event.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Escreva sua ideia, pergunte sobre jogos ou mande observações..."
            className="input-nebula text-xs"
          />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="btn-ghost text-xs py-2 px-3 cursor-pointer">
              <ImagePlus size={14} />
              <span>Anexar imagens</span>
              <input type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
            </label>

            <button
              type="button"
              disabled={!message.trim() || pending || isGenerating}
              onClick={handleSubmit}
              className="btn-primary text-xs py-2 px-4"
            >
              <Paperclip size={13} />
              <Send size={13} />
              <span>Enviar para a Maya</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo.'));
    reader.readAsDataURL(file);
  });
}