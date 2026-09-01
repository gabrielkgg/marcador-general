import { criarJogadores, desmarcarPonto, marcarPonto } from './jogadores';
import { CATEGORIAS } from './tabelaPontos';

describe('criação de jogadores', () => {
    it('começa a partida com todas as categorias vazias e total zerado', () => {
        const [jogador] = criarJogadores(['Ana']);

        expect(jogador.nome).toBe('Ana');
        expect(jogador.pontos.total).toBe(0);
        CATEGORIAS.forEach(({ categoria }) => {
            expect(jogador.pontos).toHaveProperty(categoria);
            expect(jogador.pontos[categoria]).toBeUndefined();
        });
    });
});

describe('marcar e desmarcar pontos', () => {
    it('grava o valor na categoria e soma no total', () => {
        const jogadores = marcarPonto(
            criarJogadores(['Ana', 'Bob']),
            0,
            'threes',
            9
        );

        expect(jogadores[0].pontos.threes).toBe(9);
        expect(jogadores[0].pontos.total).toBe(9);
    });

    it('não mexe nos outros jogadores nem na lista original', () => {
        const original = criarJogadores(['Ana', 'Bob']);
        const jogadores = marcarPonto(original, 0, 'threes', 9);

        expect(jogadores[1]).toBe(original[1]);
        expect(original[0].pontos.threes).toBeUndefined();
        expect(original[0].pontos.total).toBe(0);
    });

    it('libera a categoria e devolve o total ao desmarcar', () => {
        const jogadores = desmarcarPonto(
            marcarPonto(criarJogadores(['Ana']), 0, 'threes', 9),
            0,
            'threes',
            9
        );

        expect(jogadores[0].pontos).toHaveProperty('threes');
        expect(jogadores[0].pontos.threes).toBeUndefined();
        expect(jogadores[0].pontos.total).toBe(0);
    });
});
