// Definição das categorias da tabela: ordem de exibição, legenda e os valores
// que cada categoria pode receber. É a fonte da verdade tanto para a `Tabela`
// quanto para os testes de pontuação.

// Nas categorias numéricas você soma só os dados de um mesmo número, então os
// valores possíveis são `numero * quantidade de dados` (de 0 a 5 dados).
const numerica = (numero) =>
    Array.from({ length: 6 }, (_, dados) => numero * dados);

export const CATEGORIAS = [
    { categoria: 'ones', legenda: '1', pontos: numerica(1) },
    { categoria: 'twos', legenda: '2', pontos: numerica(2) },
    { categoria: 'threes', legenda: '3', pontos: numerica(3) },
    { categoria: 'fours', legenda: '4', pontos: numerica(4) },
    { categoria: 'fives', legenda: '5', pontos: numerica(5) },
    { categoria: 'sixes', legenda: '6', pontos: numerica(6) },
    // Especiais: o segundo valor é o "de mão" (combinação feita já na primeira
    // jogada, sem congelar nem re-rolar nenhum dado).
    {
        categoria: 'fullHouse',
        legenda: 'Fula',
        pontos: [0, 20, 25],
        especial: true,
    },
    {
        categoria: 'straight',
        legenda: 'Seq.',
        pontos: [0, 30, 35],
        especial: true,
    },
    {
        categoria: 'quadra',
        legenda: 'Quad.',
        pontos: [0, 40, 45],
        especial: true,
    },
    { categoria: 'general', legenda: 'Gen.', pontos: [0, 50], especial: true },
    // O General "de mão" é tão valioso que tem linha própria, valendo 100.
    {
        categoria: 'generalDeMao',
        legenda: 'De Mão',
        pontos: [0, 100],
        especial: true,
    },
];

export const pontosPossiveis = (categoria) =>
    CATEGORIAS.find((item) => item.categoria === categoria)?.pontos;
