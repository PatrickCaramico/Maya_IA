import type { ConscienceData } from '../types/conscience';

export const DEFAULT_CONSCIENCE: ConscienceData = {
  id: 'trick_gamer_112',
  versao: '4.2',
  canal: {
    nome: 'Trick Gamer 112',
    criador: 'Patrick',
    nichoPrincipal: 'Games (Sobrevivência, RPG, Guias, Desafios, Truques e Gameplay Dinâmica)',
    publicoAlvo: 'Gamers de 16 a 35 anos buscando otimizar seu tempo em jogos, descobrir segredos escondidos e se divertir com gameplay ágil.',
    tomDeVoz: 'Energético, amigável, direto ao ponto, com toques de humor gamer sem enrolação introdutória.',
    propostaValor: 'Transformar tutoriais complexos e horas de gameplay em guias ultra dinâmicos, divertidos e fáceis de aplicar.',
    frequenciaPostagem: '2 a 3 vídeos por semana'
  },
  aprendizados: {
    thumbsVencedoras: [
      {
        id: 'thumb-01',
        padrao: 'Personagem em Destaque + Elemento Raro + Brilho Neon',
        descricao: 'Fundo escuro/desfocado do cenário com o personagem centralizado e item misterioso brilhando em ciano ou roxo.',
        ctrMedioObservado: 12.8,
        elementosChave: ['Expressão de surpresa/foco', 'Item raro com borda neon', 'Texto de no máximo 3 palavras em caixa alta'],
        paletaRecomendada: ['#8B5CF6 (Pulse)', '#2EE6D6 (Signal)', '#FFCC00 (Dourado de Rastreio)'],
        exemploPratico: 'Personagem apontando para um Pal lendário com texto "PROIBIDO!"'
      },
      {
        id: 'thumb-02',
        padrao: 'Antes vs Depois / Comparação Dividida',
        descricao: 'Tela dividida em 2 metades: lado esquerdo "Nível 1 (Ruim)" vs lado direito "Nível 100 (Extremo)".',
        ctrMedioObservado: 11.2,
        elementosChave: ['Linha divisória de alta saturação', 'Cores quentes vs cores frias', 'Seta vermelha/amarela indicando o diferencial'],
        paletaRecomendada: ['#FF3D81 (Alert)', '#34D399 (Success)', '#0B0A14 (Fundo escuro)'],
        exemploPratico: 'Base de madeira fraca vs Fortaleza automatizada'
      },
      {
        id: 'thumb-03',
        padrao: 'Segredo / Ícone de Cadeado / Descoberta',
        descricao: 'Foco em um detalhe que quase ninguém notou no mapa com lupa ou círculo sutil.',
        ctrMedioObservado: 10.4,
        elementosChave: ['Círculo de destaque neon', 'Ícone de interrogação sutil', 'Texto curto de choque'],
        paletaRecomendada: ['#2EE6D6 (Signal)', '#FBBF24 (Amarelo Alerta)'],
        exemploPratico: 'Porta secreta iluminada com texto "NÃO ENTRE AQUI"'
      }
    ],
    formulasTitulos: [
      {
        id: 'title-01',
        formula: 'Fiz [Ação Extrema] para que Você Não Precise! ([Resultado/Jogo])',
        exemplo: 'Fiz 100 Dias no Modo Mais Difícil de Palworld (E Isso Aconteceu!)',
        ctrMedio: 12.1,
        gatilhoEmocional: 'Curiosidade mórbida e economia de tempo para o espectador',
        quandoUsar: 'Vídeos de testes, experimentos e desafios longos.'
      },
      {
        id: 'title-02',
        formula: 'O Segredo que 99% dos Jogadores Ignoram em [Jogo]',
        exemplo: 'O Segredo de Mineração que 99% dos Jogadores Não Sabem em Palworld',
        ctrMedio: 11.6,
        gatilhoEmocional: 'FOMO (Medo de estar jogando errado) e exclusividade',
        quandoUsar: 'Guias, dicas avançadas e mecânicas ocultas.'
      },
      {
        id: 'title-03',
        formula: 'Como Conseguir [Item/Resultado Desejado] em Menos de [Tempo Curto]',
        exemplo: 'Como Pegar o Melhor Pal Lendário em Menos de 10 Minutos!',
        ctrMedio: 10.8,
        gatilhoEmocional: 'Gratificação rápida e utilidade imediata',
        quandoUsar: 'Tutoriais diretos e guias passo a passo rápidos.'
      },
      {
        id: 'title-04',
        formula: 'PARE de Jogar [Jogo] Assim! (Faça Isso em Vez Disso)',
        exemplo: 'PARE de Construir Base Assim em Palworld! (Guia Definitivo 2026)',
        ctrMedio: 11.9,
        gatilhoEmocional: 'Alerta de erro com solução imediata',
        quandoUsar: 'Erros comuns que iniciantes e intermediários cometem.'
      }
    ],
    regrasRetencao: [
      {
        id: 'ret-01',
        etapaMomento: 'Primeiros 15 a 30 segundos (O Gancho de Ouro)',
        regra: 'Mostre o clímax ou prometa o resultado imediatamente. NUNCA comece com vinheta longa ou introdução genérica "e aí galera".',
        impactoEsperado: 'Reduz a taxa de evasão inicial abaixo de 20%.',
        exemploPratico: '"Nesse vídeo eu vou te mostrar a técnica que multiplica seu dano por 10x, e o segredo começa nesse detalhe aqui..."'
      },
      {
        id: 'ret-02',
        etapaMomento: 'Marca de 2 a 3 minutos (O Primeiro Pico)',
        regra: 'Entregue a primeira vitória rápida antes dos 3 minutos para validar a promessa do título.',
        impactoEsperado: 'Garante que o espectador continue até a segunda metade.',
        exemploPratico: 'Finalizar a primeira dica completa com resultado visível na tela.'
      },
      {
        id: 'ret-03',
        etapaMomento: 'Marca de 40% a 50% do vídeo (Call to Action Inteligente)',
        regra: 'Faça o pedido de like/inscrição atrelado a um valor futuro ("Se essa dica te ajudou a economizar 1 hora, já deixa o like porque a próxima vai explodir sua mente").',
        impactoEsperado: 'Conversão 3x maior de inscritos sem quebrar o ritmo.',
        exemploPratico: 'Pop-up sutil de inscrição sincronizado com efeito sonoro agradável.'
      },
      {
        id: 'ret-04',
        etapaMomento: 'Transições entre Tópicos (Cliffhangers Contínuos)',
        regra: 'Nunca termine um tópico dizendo "então é isso". Use pontes: "Mas isso nem se compara com o que descobri no próximo bioma..."',
        impactoEsperado: 'Elimina as quedas de gráfico típicas em trocas de assunto.',
        exemploPratico: 'Áudio dinâmico acelerando antes do próximo capítulo.'
      }
    ],
    regrasDeOuro: [
      'Entregar rigorosamente o que a Thumbnail e o Título prometeram (Zero clickbait mentiroso).',
      'Gameplay e áudio em altíssima qualidade (60fps, sem ruído no microfone).',
      'Ritmo ágil: cortar pausas desnecessárias, telas de carregamento e silêncios.',
      'Sempre incluir capítulos na descrição do vídeo para otimizar busca e experiência.',
      'Sempre agradecer à comunidade nos comentários fixados.'
    ]
  },
  historicoVideos: [
    {
      id: 'vid-001',
      tituloFinal: 'Como Construir a Base Perfeita e Automatizada em Palworld (Guia Completo)',
      jogo: 'Palworld',
      dataPublicacao: '2026-08-05',
      duracaoMinutos: 14.5,
      views: 38400,
      ctr: 11.8,
      avd: 56.4,
      oQueDeuCerto: ['Gancho rápido mostrando a base pronta', 'Capítulos bem divididos', 'Thumb com cores Pulse e Signal'],
      oQueMelhorar: ['Diminuir o tempo de explicação na parte de eletricidade'],
      aprendizadoParaConsciencia: 'O público ama guias visuais com esquema de posicionamento na tela.'
    },
    {
      id: 'vid-002',
      tituloFinal: '10 Erros que Todo Jogador Comete no Início de Elden Ring',
      jogo: 'Elden Ring',
      dataPublicacao: '2026-07-20',
      duracaoMinutos: 11.2,
      views: 52100,
      ctr: 12.5,
      avd: 51.8,
      oQueDeuCerto: ['Formato de lista ágil', 'Thumb com seta amarela e monstro misterioso'],
      oQueMelhorar: ['Adicionar mais dicas para magos'],
      aprendizadoParaConsciencia: 'Vídeos de lista funcionam muito bem quando o item #1 é surpreendente.'
    }
  ],
  atualizadoEm: new Date().toISOString()
};
