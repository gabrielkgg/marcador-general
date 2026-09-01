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
