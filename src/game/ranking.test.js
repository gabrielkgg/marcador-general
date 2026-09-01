import { calcularRanking, partidaTerminada } from './ranking';
import { criarJogadores } from './jogadores';
import { CATEGORIAS } from './tabelaPontos';

// Preenche todas as categorias de um jogador com o mesmo valor.
const preencherTudo = (jogador, valor = 0) => ({
    ...jogador,
    pontos: {
        ...jogador.pontos,
        ...Object.fromEntries(
            CATEGORIAS.map(({ categoria }) => [categoria, valor])
        ),
        total: valor * CATEGORIAS.length,
    },
});

// Jogador com a tabela fechada e um total conhecido.
const comTotal = (nome, total) => {
    const [jogador] = criarJogadores([nome]);
    return {
        ...preencherTudo(jogador),
        pontos: { ...preencherTudo(jogador).pontos, total },
    };
};

describe('fim de jogo', () => {
    it('não termina enquanto algum jogador tem categoria em aberto', () => {
        const [ana, bob] = criarJogadores(['Ana', 'Bob']);

        expect(partidaTerminada([preencherTudo(ana), bob])).toBe(false);
    });

    it('termina quando todos preencheram todas as categorias', () => {
        const jogadores = criarJogadores(['Ana', 'Bob']).map((jogador) =>
            preencherTudo(jogador, 5)
        );

        expect(partidaTerminada(jogadores)).toBe(true);
    });
});

describe('ranking', () => {
    it('ordena do maior para o menor e dá o troféu para quem tem mais pontos', () => {
        const jogadores = [
            comTotal('Ana', 120),
            comTotal('Bob', 200),
            comTotal('Cid', 150),
        ];

        expect(calcularRanking(jogadores, 'classico')).toEqual([
            { nome: 'Bob', pontos: 200, bonus: false, vencedor: true },
            { nome: 'Cid', pontos: 150, bonus: false, vencedor: false },
            { nome: 'Ana', pontos: 120, bonus: false, vencedor: false },
        ]);
    });

    it('em caso de empate na maior pontuação, todos os empatados vencem', () => {
        const jogadores = [
            comTotal('Ana', 200),
            comTotal('Bob', 200),
            comTotal('Cid', 150),
        ];

        expect(
            calcularRanking(jogadores, 'classico').map((jogador) => [
                jogador.nome,
                jogador.vencedor,
            ])
        ).toEqual([
            ['Ana', true],
            ['Bob', true],
            ['Cid', false],
        ]);
    });

    it('no modo bônus ranqueia pelo total já com o bônus, não pelo total bruto', () => {
        const comBonus = {
            ...comTotal('Ana', 100),
            pontos: {
                ...comTotal('Ana', 100).pontos,
                ones: 5,
                twos: 10,
                threes: 15,
                fours: 20,
                fives: 25,
                sixes: 30,
                total: 100,
            },
        };
        const semBonus = comTotal('Bob', 120);

        expect(calcularRanking([semBonus, comBonus], 'bonus')).toEqual([
            { nome: 'Ana', pontos: 135, bonus: true, vencedor: true },
            { nome: 'Bob', pontos: 120, bonus: false, vencedor: false },
        ]);
    });
});
