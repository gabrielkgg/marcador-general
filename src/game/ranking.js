import { CATEGORIAS } from './tabelaPontos';
import { calcularBonus, totalComBonus } from './pontuacao';

// A partida acaba quando todos os jogadores preencheram todas as categorias.
export const partidaTerminada = (jogadores) =>
    jogadores.every((jogador) =>
        CATEGORIAS.every(
            ({ categoria }) => jogador.pontos[categoria] !== undefined
        )
    );

// Ranking final: ordena por pontuação (já com bônus) e marca o vencedor.
// Ordena sobre uma cópia para não mutar a lista de jogadores, que continua na
// ordem de cadastro para o "Recomeçar partida".
export const calcularRanking = (jogadores, modo) => {
    const ordenados = [...jogadores].sort(
        (a, b) => totalComBonus(b.pontos, modo) - totalComBonus(a.pontos, modo)
    );
    const maiorPontuacao = totalComBonus(ordenados[0].pontos, modo);

    return ordenados.map((jogador) => ({
        nome: jogador.nome,
        pontos: totalComBonus(jogador.pontos, modo),
        bonus: calcularBonus(jogador.pontos, modo) > 0,
        vencedor: totalComBonus(jogador.pontos, modo) === maiorPontuacao,
    }));
};
