import React from 'react';
import { Copy, Check, Sparkles } from 'lucide-react';

interface MayaOutputViewerProps {
  content: string;
  stageNumber: number;
}

export const MayaOutputViewer: React.FC<MayaOutputViewerProps> = ({ content, stageNumber }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyAll = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card-nebula p-6 border border-nebula bg-nebula relative space-y-6">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-nebula">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-pulse/20 text-pulse flex items-center justify-center font-bold text-xs">
            M
          </div>
          <span className="text-xs font-bold text-frost font-heading uppercase tracking-wider">
            Saída Estratégica da Maya
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-pulse/10 text-pulse border border-pulse/30">
            Etapa {stageNumber}
          </span>
        </div>

        <button
          onClick={handleCopyAll}
          className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1.5 text-frost hover:bg-white/10"
          title="Copiar saída completa em Markdown"
        >
          {copied ? <Check size={14} className="text-signal" /> : <Copy size={14} />}
          <span>{copied ? 'Copiado!' : 'Copiar'}</span>
        </button>
      </div>

      {/* Renderizador Formatado com Contraste Alto */}
      <div className="prose-maya space-y-4 text-xs sm:text-sm leading-relaxed">
        {renderCustomMarkdown(content)}
      </div>
    </div>
  );
};

/**
 * Renderizador de Markdown personalizado com cores e contraste perfeitos
 */
function renderCustomMarkdown(rawText: string) {
  const lines = rawText.split('\n');

  return lines.map((line, idx) => {
    const trimmed = line.trim();

    // Títulos H1 (#)
    if (trimmed.startsWith('# ')) {
      return (
        <h1 key={idx} className="text-lg sm:text-xl font-bold text-frost font-heading border-b border-nebula pb-2 mt-4 mb-3">
          {trimmed.replace('# ', '')}
        </h1>
      );
    }

    // Títulos H2 (##)
    if (trimmed.startsWith('## ')) {
      return (
        <h2 key={idx} className="text-base font-bold text-pulse font-heading mt-4 mb-2 flex items-center gap-2">
          {trimmed.replace('## ', '')}
        </h2>
      );
    }

    // Títulos H3 (###)
    if (trimmed.startsWith('### ')) {
      return (
        <h3 key={idx} className="text-sm font-bold text-signal font-heading mt-3 mb-1.5">
          {trimmed.replace('### ', '')}
        </h3>
      );
    }

    // Títulos H4 (####)
    if (trimmed.startsWith('#### ')) {
      return (
        <h4 key={idx} className="text-xs sm:text-sm font-bold text-frost font-heading mt-3 mb-1">
          {trimmed.replace('#### ', '')}
        </h4>
      );
    }

    // Bloco de Destaque / Citação (> "Texto do Título") -> Texto PRETO e em DESTAQUE
    if (trimmed.startsWith('>')) {
      const quoteText = trimmed.replace(/^>\s*/, '').replace(/`/g, '');
      return (
        <div key={idx} className="my-3 p-3.5 rounded-xl bg-amber-300 border-l-4 border-amber-500 text-black font-bold text-sm shadow-md">
          {quoteText}
        </div>
      );
    }

    // Divisores (---)
    if (trimmed === '---') {
      return <hr key={idx} className="border-nebula my-4" />;
    }

    // Tópicos com Hífen / Lista (- Título)
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      const itemText = trimmed.replace(/^[-•]\s*/, '');
      return (
        <div key={idx} className="flex items-start gap-2 my-1.5 pl-2">
          <span className="text-pulse font-bold">•</span>
          <span className="text-frost font-medium">{renderInlineStyles(itemText)}</span>
        </div>
      );
    }

    // Bloco de Código / Copiável (`code`)
    if (trimmed.startsWith('```')) {
      return null; // Ignora as linhas de marcação de código pura
    }

    // Linha de código inline solta
    if (trimmed.startsWith('`') && trimmed.endsWith('`') && trimmed.length > 2) {
      const codeText = trimmed.slice(1, -1);
      return (
        <div key={idx} className="my-2 p-3 rounded-xl bg-black/80 border border-nebula text-emerald-400 font-mono text-xs overflow-x-auto">
          {codeText}
        </div>
      );
    }

    // Parágrafos normais
    if (trimmed === '') {
      return <div key={idx} className="h-1" />;
    }

    return (
      <p key={idx} className="text-frost font-medium leading-relaxed">
        {renderInlineStyles(trimmed)}
      </p>
    );
  });
}

/**
 * Função utilitária para aplicar negrito, itálico e destaques no texto
 */
function renderInlineStyles(text: string) {
  // Trata trechos entre crases `texto`
  const parts = text.split(/(`[^`]+`)/g);

  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="px-1.5 py-0.5 mx-0.5 rounded bg-black/60 text-emerald-300 font-mono text-[11px] border border-emerald-500/30">
          {part.slice(1, -1)}
        </code>
      );
    }

    // Sub-substituição simples para **negrito**
    const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.map((subPart, j) => {
      if (subPart.startsWith('**') && subPart.endsWith('**')) {
        return (
          <strong key={j} className="font-bold text-frost">
            {subPart.slice(2, -2)}
          </strong>
        );
      }
      return subPart;
    });
  });
}