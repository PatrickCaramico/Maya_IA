import React, { useState } from 'react';
import { X, Cpu, ShieldCheck, Download, Upload, Bot } from 'lucide-react';
import type { AISettings } from '../../engine/aiService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AISettings;
  onSaveSettings: (newSettings: AISettings) => void;
  onExportAll?: () => void;
  onImportAll?: (data: any) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onExportAll,
  onImportAll,
}) => {
  const [provider, setProvider] = useState<AISettings['provider']>(settings.provider || 'simulated');
  const [apiKey, setApiKey] = useState(settings.apiKey || '');
  const [model, setModel] = useState(settings.model || 'gemini-2.0-flash');
  const [backendUrl, setBackendUrl] = useState(settings.backendUrl || '/api');

  if (!isOpen) return null;

  const handleProviderChange = (newProvider: AISettings['provider']) => {
    setProvider(newProvider);
    if (newProvider === 'gemini' && (!model || model.includes('claude') || model.includes('gpt'))) {
      setModel('gemini-2.0-flash');
    } else if (newProvider === 'anthropic' && (!model || model.includes('gemini') || model.includes('gpt'))) {
      setModel('claude-3-7-sonnet-20250219');
    } else if (newProvider === 'openai' && (!model || model.includes('gemini') || model.includes('claude'))) {
      setModel('gpt-4o');
    }
  };

  const handleSave = () => {
    onSaveSettings({
      provider,
      apiKey,
      model,
      backendUrl,
    });
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (onImportAll) {
          onImportAll(parsed);
          alert('Backup restaurado com sucesso!');
        }
      } catch (err) {
        alert('Erro ao importar backup. Verifique se o arquivo JSON é válido.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-100 rounded-xl text-purple-600">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Configurações da Plataforma Maya</h2>
              <p className="text-xs text-slate-500">Gerenciamento de chaves de API, modelos de IA e backup de dados</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Provedor de IA */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-600" /> Motor de Inteligência Artificial:
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Simulados */}
              <button
                type="button"
                onClick={() => handleProviderChange('simulated')}
                className={`p-4 rounded-xl text-left border transition-all ${
                  provider === 'simulated'
                    ? 'border-purple-500 bg-purple-50/50 ring-2 ring-purple-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="font-bold text-sm text-slate-800 mb-1">Motor Simulado Inteligente</div>
                <div className="text-xs text-slate-500">Não requer chave. Respostas pré-calibradas com latência realista.</div>
              </button>

              {/* Gemini */}
              <button
                type="button"
                onClick={() => handleProviderChange('gemini')}
                className={`p-4 rounded-xl text-left border transition-all ${
                  provider === 'gemini'
                    ? 'border-purple-500 bg-purple-50/50 ring-2 ring-purple-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="font-bold text-sm text-slate-800 mb-1">Google Gemini (Direto do Navegador)</div>
                <div className="text-xs text-slate-500">Usa sua chave da Google AI Studio (gemini-2.0-flash). Rápido e gratuito.</div>
              </button>

              {/* Anthropic Claude */}
              <button
                type="button"
                onClick={() => handleProviderChange('anthropic')}
                className={`p-4 rounded-xl text-left border transition-all ${
                  provider === 'anthropic'
                    ? 'border-purple-500 bg-purple-50/50 ring-2 ring-purple-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="font-bold text-sm text-slate-800 mb-1">Anthropic Claude</div>
                <div className="text-xs text-slate-500">API direta da Anthropic (claude-3-7-sonnet). Exige chave paga.</div>
              </button>

              {/* Backend Seguro */}
              <button
                type="button"
                onClick={() => handleProviderChange('backend')}
                className={`p-4 rounded-xl text-left border transition-all ${
                  provider === 'backend'
                    ? 'border-purple-500 bg-purple-50/50 ring-2 ring-purple-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-sm text-slate-800 mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Backend Seguro
                </div>
                <div className="text-xs text-slate-500">A chave de API fica no servidor NodeJS. Recomendado para produção.</div>
              </button>
            </div>
          </div>

          {/* Configurações da Chave (Aparece se Gemini, Anthropic ou OpenAI for selecionado) */}
          {provider !== 'simulated' && provider !== 'backend' && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Chave de API ({provider.toUpperCase()})
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={provider === 'gemini' ? 'AIzaSy...' : 'sk-ant-api...'}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  A chave é armazenada com segurança no seu navegador local (LocalStorage).
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Identificador do Modelo
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="gemini-2.0-flash"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-mono"
                />
              </div>
            </div>
          )}

          {/* Backup e Exportação */}
          {(onExportAll || onImportAll) && (
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <label className="text-sm font-semibold text-slate-700 block">Backup & Exportação Geral</label>
              <div className="flex flex-wrap gap-3">
                {onExportAll && (
                  <button
                    type="button"
                    onClick={onExportAll}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                  >
                    <Download className="w-4 h-4 text-purple-600" />
                    Exportar Todos os Projetos & Consciência
                  </button>
                )}

                {onImportAll && (
                  <label className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 text-purple-600" />
                    Restaurar Backup JSON
                    <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                  </label>
                )}
              </div>
            </div>
          )}

        </div> {/* <-- Fechamento do Body corrigido aqui */}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors"
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-500/25 transition-all"
          >
            Salvar Configurações
          </button>
        </div>

      </div>
    </div>
  );
};