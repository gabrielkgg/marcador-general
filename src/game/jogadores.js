import { CATEGORIAS } from './tabelaPontos';

// Placar zerado: toda categoria começa `undefined` (= ainda não preenchida) e
// recebe um número ao ser marcada. `total` acumula a soma das categorias.
export const criarPontosVazios = () => ({
    ...Object.fromEntries(
        CATEGORIAS.map(({ categoria }) => [categoria, undefined])
    ),
    total: 0,
});

export const criarJogadores = (nomes) =>
    nomes.map((nome) => ({ nome, pontos: criarPontosVazios() }));
