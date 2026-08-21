import type { StageDefinition, EtapaNumero } from '../types/project';

export const STAGES_CONFIG: Record<EtapaNumero, StageDefinition> = {
  1: {
    numero: 1,
    nome: 'Planejamento & Briefing',
    icone: 'Compass',
    descricaoCurta: 'Definição do jogo, nicho, objetivo e duração estimada do vídeo.',
    descricaoDetalhada: 'A Maya analisa a proposta inicial do vídeo, valida a viabilidade dentro do canal Trick Gamer 112 e estabelece a meta principal de visualizações e público.',
    objetivoMaya: 'Gerar um briefing estruturado, delimitando o escopo do vídeo, público-alvo prioritário e o ganho prático que o espectador terá.',
    checklistsPadrao: [
      'Jogo e versão definidos',
      'Objetivo claro (Tutorial, Desafio, Dicas Rápidas ou Análise)',
      'Tempo estimado do vídeo estabelecido',
      'Público-alvo mapeado (Iniciante, Intermediário ou Avançado)'
    ],
    perguntasAprovacao: 'O briefing e o escopo do vídeo estão alinhados com o que você planejou gravar?',
    secoesConscienciaUtilizadas: ['canal.nichoPrincipal', 'canal.publicoAlvo', 'aprendizados.regrasDeOuro']
  },
  2: {
    numero: 2,
    nome: 'Ângulo & Premissa Única',
    icone: 'Sparkles',
    descricaoCurta: 'O grande diferencial do vídeo para não ser "apenas mais um".',
    descricaoDetalhada: 'Criação do gancho narrativo e da premissa irresistível que fará o espectador escolher este vídeo em vez de outros resultados de busca.',
    objetivoMaya: 'Definir o gancho de curiosidade, a premissa central de alto impacto e o elemento surpresa que sustentará o interesse.',
    checklistsPadrao: [
      'Premissa única diferenciada dos concorrentes',
      'Gancho de curiosidade validado',
      'Transformação ou recompensa do espectador definida'
    ],
    perguntasAprovacao: 'A premissa e o diferencial deste vídeo estão fortes e empolgantes?',
    secoesConscienciaUtilizadas: ['canal.propostaValor', 'canal.tomDeVoz', 'aprendizados.regrasRetencao']
  },
  3: {
    numero: 3,
    nome: 'Títulos de Alto CTR',
    icone: 'Flame',
    descricaoCurta: 'Geração de 5 opções de títulos magnéticos usando as fórmulas da Consciência.',
    descricaoDetalhada: 'A Maya aplica os gatilhos mentais validados do canal (Curiosidade, Urgência, Desafio, Segredo) para formular títulos que maximizam cliques.',
    objetivoMaya: 'Apresentar 5 opções de títulos categorizadas por ângulo (Curiosidade, Tutorial Rápido, Alerta/Erro, Desafio Extremo e Segredo Oculto) com estimativa de CTR.',
    checklistsPadrao: [
      'Menos de 60 caracteres (sem cortar no mobile)',
      'Palavra-chave principal à esquerda',
      'Gatilho de curiosidade ou benefício evidente',
      'Alinhado com a promessa real do conteúdo'
    ],
    perguntasAprovacao: 'Qual das opções de título você prefere, ou deseja que a Maya refine alguma variação?',
    secoesConscienciaUtilizadas: ['aprendizados.formulasTitulos', 'historicoVideos']
  },
  4: {
    numero: 4,
    nome: 'Thumbnails Estratégicas',
    icone: 'Image',
    descricaoCurta: 'Conceitos visuais, elementos de destaque, cores e prompts de criação.',
    descricaoDetalhada: 'Planejamento da thumbnail baseado nos padrões vencedores da Consciência (contraste, cores Pulse/Signal, expressões faciais e foco no mistério).',
    objetivoMaya: 'Gerar 3 conceitos visuais completos de thumbnail, incluindo: Layout e enquadramento, texto curto na imagem (máx 3 palavras), paleta de cores recomendada e prompt pronto para IA/Photoshop.',
    checklistsPadrao: [
      'Texto na thumb com no máximo 3 ou 4 palavras',
      'Alto contraste com as cores da identidade do canal',
      'Elemento central de atenção nítido mesmo em telas pequenas (mobile)',
      'Complementa o título sem repetir exatamente as mesmas palavras'
    ],
    perguntasAprovacao: 'O conceito visual da thumbnail e as orientações de cores estão aprovados?',
    secoesConscienciaUtilizadas: ['aprendizados.thumbsVencedoras', 'canal.nichoPrincipal']
  },
  5: {
    numero: 5,
    nome: 'Roteiro & Gancho de Retenção',
    icone: 'FileText',
    descricaoCurta: 'Estrutura detalhada com gancho de 30s, marcos de retenção e CTA.',
    descricaoDetalhada: 'A Maya monta o roteiro em blocos: Abertura Explosiva (0-30s), Primeira Vitória Rápida (3min), Desenvolvimento Dinâmico, CTA no momento áureo e Conclusão.',
    objetivoMaya: 'Entregar o roteiro completo ou em tópicos com falas sugeridas, marcações de tempo (timestamps), alertas sonoros e ganchos de retenção entre blocos.',
    checklistsPadrao: [
      'Gancho inicial de 15 a 30s sem enrolação',
      'Promessa do título confirmada no primeiro minuto',
      'CTA posicionado estrategicamente após entregar valor real',
      'Cliffhangers e transições dinâmicas entre blocos'
    ],
    perguntasAprovacao: 'A estrutura do roteiro e os ganchos de retenção estão perfeitos para a gravação?',
    secoesConscienciaUtilizadas: ['aprendizados.regrasRetencao', 'canal.tomDeVoz']
  },
  6: {
    numero: 6,
    nome: 'Gravação & Dicas de Captura',
    icone: 'Video',
    descricaoCurta: 'Checklist técnico de gravação, OBS, áudio e momentos-chave de gameplay.',
    descricaoDetalhada: 'Orientações práticas para o momento da gameplay: tom de voz, energia, posicionamento de câmera/microfone e momentos que não podem faltar.',
    objetivoMaya: 'Fornecer o guia de bordo para a gravação com checklist de setup (OBS, iluminação, áudio) e diretrizes para reações genuínas e gameplay limpa.',
    checklistsPadrao: [
      'Resolução 1080p ou 4K a 60fps configurada',
      'Microfone sem ruído e volume de jogo equilibrado',
      'Câmera/Iluminação alinhada com contraste da cena',
      'Captura dos takes de destaque para o gancho inicial realizada'
    ],
    perguntasAprovacao: 'Tudo gravado e conferido? Pronto para avançar para a ilha de edição?',
    secoesConscienciaUtilizadas: ['aprendizados.regrasDeOuro']
  },
  7: {
    numero: 7,
    nome: 'Edição & Ritmo Dinâmico',
    icone: 'Film',
    descricaoCurta: 'Guia de cortes, sound design, zooms, inserções e ritmo dinâmico.',
    descricaoDetalhada: 'A Maya mapeia os pontos de corte de silêncios, sugestões de trilha sonora, efeitos sonoros (SFX) e inserções visuais para manter a retenção alta.',
    objetivoMaya: 'Entregar o mapa de edição com timestamps sugeridos, tipos de corte (J-cut, zooms dinâmicos), memes sutis e momentos de aceleração de ritmo.',
    checklistsPadrao: [
      'Zero silêncios ou telas de carregamento mortas',
      'Zooms e movimentações de câmera nos momentos de ênfase',
      'Trilha sonora nivelada (-18dB a -24dB sob a voz)',
      'Efeitos visuais e sonoros nos pontos de retenção'
    ],
    perguntasAprovacao: 'A edição final está com o ritmo dinâmico e polido do Trick Gamer 112?',
    secoesConscienciaUtilizadas: ['aprendizados.regrasRetencao']
  },
  8: {
    numero: 8,
    nome: 'SEO, Descrição & Capítulos',
    icone: 'Search',
    descricaoCurta: 'Otimização YouTube: descrição formatada, capítulos, tags e links.',
    descricaoDetalhada: 'Geração de metadados profissionais para maximizar o ranqueamento no algoritmo de busca e sugestões do YouTube.',
    objetivoMaya: 'Criar a descrição completa com parágrafo inicial magnético, lista de capítulos com timestamps, links de redes, tags ranqueáveis e hashtags.',
    checklistsPadrao: [
      'Primeiras 2 linhas da descrição otimizadas para busca',
      'Capítulos divididos a partir de 00:00',
      'Tags principais e secundárias incluídas',
      'Hashtags estratégicas no final'
    ],
    perguntasAprovacao: 'Os metadados de SEO, descrição e capítulos estão aprovados para o envio?',
    secoesConscienciaUtilizadas: ['canal.nichoPrincipal', 'aprendizados.formulasTitulos']
  },
  9: {
    numero: 9,
    nome: 'Publicação & Checklist Final',
    icone: 'UploadCloud',
    descricaoCurta: 'Agendamento, tela final, cards interativos e comentário fixado.',
    descricaoDetalhada: 'Checklist de conferência antes do clique final de publicação ou agendamento para o melhor horário do canal.',
    objetivoMaya: 'Fornecer o texto do comentário fixado (com pergunta para gerar comentários), configuração de cards interativos e recomendação de horário de postagem.',
    checklistsPadrao: [
      'Vídeo enviado em alta definição e processado em 1080p/4K',
      'Thumbnail oficial aplicada',
      'Cards interativos inseridos aos 40% e 80% do vídeo',
      'Tela final com vídeo recomendado + botão de inscrição',
      'Comentário fixado pronto para engajar os primeiros inscritos'
    ],
    perguntasAprovacao: 'Vídeo publicado ou agendado com sucesso no canal?',
    secoesConscienciaUtilizadas: ['canal.frequenciaPostagem', 'canal.publicoAlvo']
  },
  10: {
    numero: 10,
    nome: 'Métricas, Retenção & Consciência',
    icone: 'BrainCircuit',
    descricaoCurta: 'Análise pós-publicação: CTR, AVD e gravação de aprendizados na Consciência.',
    descricaoDetalhada: 'Registro dos dados de desempenho após 24h-72h de publicação para alimentar a Consciência da Maya e aprimorar os próximos vídeos.',
    objetivoMaya: 'Analisar o desempenho comparado às metas do canal, identificar o que funcionou e o que melhorar, e atualizar permanentemente a Consciência da Maya.',
    checklistsPadrao: [
      'Métricas de CTR (%) e AVD (%) registradas',
      'Análise dos picos e quedas do gráfico de retenção',
      'Registro do que deu certo no histórico do canal',
      'Gravação automática do novo aprendizado na Consciência'
    ],
    perguntasAprovacao: 'Deseja finalizar o ciclo e gravar estes novos aprendizados na Consciência da Maya?',
    secoesConscienciaUtilizadas: ['aprendizados', 'historicoVideos']
  }
};
