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

// Devolve uma nova lista com o placar de um jogador atualizado. Nada é mutado:
// os demais jogadores seguem sendo os mesmos objetos.
const comPontosAtualizados = (jogadores, indice, mudanca) =>
    jogadores.map((jogador, i) =>
        i === indice
            ? {
                  ...jogador,
                  pontos: { ...jogador.pontos, ...mudanca(jogador.pontos) },
              }
            : jogador
    );

export const marcarPonto = (jogadores, indice, categoria, pontos) =>
    comPontosAtualizados(jogadores, indice, (atual) => ({
        [categoria]: pontos,
        total: atual.total + pontos,
    }));

export const desmarcarPonto = (jogadores, indice, categoria, pontos) =>
    comPontosAtualizados(jogadores, indice, (atual) => ({
        [categoria]: undefined,
        total: atual.total - pontos,
    }));
