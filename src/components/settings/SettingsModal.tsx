import React, { useState } from 'react';
import type { AISettings } from '../../engine/aiService';
import { Modal } from '../ui/Modal';
import { Settings, Key, Cpu, Download, Upload, Check } from 'lucide-react';
import { loadProjects, loadConscience, saveProjects, saveConscience } from '../../engine/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AISettings;
  onSaveSettings: (settings: AISettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings
}) => {
  const [provider, setProvider] = useState(settings.provider);
  const [apiKey, setApiKey] = useState(settings.apiKey || '');
  const [model, setModel] = useState(settings.model || 'claude-3-7-sonnet-20250219');
  const [backendUrl, setBackendUrl] = useState(settings.backendUrl || '/api');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      provider,
      apiKey: apiKey.trim(),
      model,
      backendUrl: backendUrl.trim()
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  const handleExportBackup = () => {
    const backupData = {
      projects: loadProjects(),
      conscience: loadConscience(),
      exportDate: new Date().toISOString(),
      app: 'MAYA_v4_2'
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `maya_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.projects && parsed.conscience) {
            saveProjects(parsed.projects);
            saveConscience(parsed.conscience);
            alert('Backup restaurado com sucesso! A página será recarregada.');
            window.location.reload();
          } else {
            alert('Arquivo de backup inválido.');
          }
        } catch {
          alert('Erro ao ler o arquivo JSON.');
        }
      };
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configurações da Plataforma Maya"
      subtitle="Gerenciamento de chaves de API, modelos de IA e backup de dados"
      icon={<Settings size={20} />}
    >
      <form onSubmit={handleSave} className="space-y-4">
        {/* Provider Selection */}
        <div>
          <label className="text-xs font-semibold text-frost mb-1.5 flex items-center gap-1.5">
            <Cpu size={14} className="text-signal" />
            Motor de Inteligência Artificial:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setProvider('simulated')}
              className={`p-3 rounded-xl border text-left text-xs transition-all ${
                provider === 'simulated'
                  ? 'bg-pulse/15 border-pulse text-frost shadow-glow-pulse'
                  : 'bg-void border-nebula text-secondary hover:border-pulse/40'
              }`}
            >
              <div className="font-bold text-frost">Motor Simulado Inteligente</div>
              <div className="text-[11px] text-secondary mt-0.5">
                Não requer chave de API. Respostas pré-calibradas para o Trick Gamer 112 com latência realista.
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setProvider('backend');
                setModel('claude-3-7-sonnet-20250219');
              }}
              className={`p-3 rounded-xl border text-left text-xs transition-all ${
                provider === 'backend'
                  ? 'bg-pulse/15 border-pulse text-frost shadow-glow-pulse'
                  : 'bg-void border-nebula text-secondary hover:border-pulse/40'
              }`}
            >
              <div className="font-bold text-frost">Backend Seguro (Recomendado)</div>
              <div className="text-[11px] text-secondary mt-0.5">
                Usa o servidor do próprio projeto (pasta /server). Sua chave de API fica só lá — nunca no navegador.
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setProvider('anthropic');
                setModel('claude-3-7-sonnet-20250219');
              }}
              className={`p-3 rounded-xl border text-left text-xs transition-all ${
                provider === 'anthropic'
                  ? 'bg-pulse/15 border-pulse text-frost shadow-glow-pulse'
                  : 'bg-void border-nebula text-secondary hover:border-pulse/40'
              }`}
            >
              <div className="font-bold text-frost">Anthropic Claude (direto do navegador)</div>
              <div className="text-[11px] text-secondary mt-0.5">
                Chama a API direto do navegador com seu token. Não recomendado para um site público — sua chave fica exposta.
              </div>
            </button>
          </div>
        </div>

        {/* Backend URL if backend provider */}
        {provider === 'backend' && (
          <div className="p-3.5 rounded-xl bg-void border border-nebula space-y-3 animate-fade-in">
            <div>
              <label className="text-xs font-semibold text-frost mb-1 flex items-center gap-1.5">
                <Key size={13} className="text-pulse" />
                URL do backend seguro
              </label>
              <input
                type="text"
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
                placeholder="/api ou http://localhost:8787/api"
                className="input-nebula text-xs font-mono"
              />
              <span className="text-[10px] text-muted mt-1 block">
                Em desenvolvimento local, deixe "/api" (o Vite redireciona pro servidor automaticamente).
                Em produção, use a URL do backend publicado.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-frost mb-1">Identificador do Modelo</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="ex: claude-3-7-sonnet-20250219"
                className="input-nebula text-xs font-mono"
              />
            </div>
          </div>
        )}

        {/* API Key if provider chama direto do navegador */}
        {(provider === 'anthropic' || provider === 'openai' || provider === 'gemini') && (
          <div className="p-3.5 rounded-xl bg-void border border-nebula space-y-3 animate-fade-in">
            <div>
              <label className="text-xs font-semibold text-frost mb-1 flex items-center gap-1.5">
                <Key size={13} className="text-pulse" />
                Chave de API ({provider.toUpperCase()})
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-... ou sk-..."
                className="input-nebula text-xs font-mono"
              />
              <span className="text-[10px] text-muted mt-1 block">
                A chave é armazenada com segurança apenas no seu navegador local (LocalStorage).
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-frost mb-1">Identificador do Modelo</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="ex: claude-3-7-sonnet-20250219"
                className="input-nebula text-xs font-mono"
              />
            </div>
          </div>
        )}

        {/* Backup & Restore Section */}
        <div className="p-3.5 rounded-xl bg-void border border-nebula space-y-2.5">
          <label className="block text-xs font-semibold text-frost">Backup & Exportação Geral</label>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportBackup}
              className="btn-secondary text-xs py-1.5 px-3"
            >
              <Download size={13} />
              <span>Exportar Todos os Projetos & Consciência</span>
            </button>

            <label className="btn-ghost text-xs py-1.5 px-3 cursor-pointer">
              <Upload size={13} />
              <span>Restaurar Backup JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-3 border-t border-nebula flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost text-xs"
          >
            Fechar
          </button>
          <button
            type="submit"
            className="btn-primary text-xs sm:text-sm py-2 px-5"
          >
            {saved ? (
              <>
                <Check size={16} className="text-success" />
                <span>Salvo!</span>
              </>
            ) : (
              <span>Salvar Configurações</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
