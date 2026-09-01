import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FimDeJogo } from './FimDeJogo';

const TROFEU = '\u{1F3C6}';
const APERTO_DE_MAO = '\u{1F91D}';
const OLHOS_ARREGALADOS = '\u{1F633}';
const PATO = '\u{1F986}';

const renderRanking = (ranking, props = {}) => {
    render(
        <FimDeJogo
            listaJogadores={ranking}
            onGameReset={() => {}}
            onRecomecarPartida={() => {}}
            {...props}
        />
    );
};

// Emoji exibido ao lado de um jogador do ranking.
const emojiDe = (nome) =>
    within(screen.getByText(nome).closest('.fim-de-jogo-list-item'))
        .getByText(
            new RegExp(
                `[${TROFEU}${APERTO_DE_MAO}${OLHOS_ARREGALADOS}${PATO}]`,
                'u'
            )
        )
        .textContent.trim();

const jogador = (nome, pontos, extras = {}) => ({
    nome,
    pontos,
    bonus: false,
    vencedor: false,
    ...extras,
});

describe('tela de fim de jogo', () => {
    it('dá o troféu ao vencedor e o pato a quem ficou bem atrás', () => {
        renderRanking([
            jogador('Ana', 200, { vencedor: true }),
            jogador('Bob', 100),
        ]);

        expect(emojiDe('Ana')).toBe(TROFEU);
        expect(emojiDe('Bob')).toBe(PATO);
    });

    it('marca empate com aperto de mão', () => {
        renderRanking([
            jogador('Ana', 200, { vencedor: true }),
            jogador('Bob', 200, { vencedor: true }),
        ]);

        expect(emojiDe('Ana')).toBe(APERTO_DE_MAO);
        expect(emojiDe('Bob')).toBe(APERTO_DE_MAO);
    });

    it('sinaliza disputa apertada quando a diferença é de até 10 pontos', () => {
        renderRanking([
            jogador('Ana', 200, { vencedor: true }),
            jogador('Bob', 195),
        ]);

        expect(emojiDe('Bob')).toBe(OLHOS_ARREGALADOS);
    });

    it('avisa quando a pontuação inclui o bônus', () => {
        renderRanking([jogador('Ana', 135, { vencedor: true, bonus: true })]);

        expect(screen.getByText(/inclui bônus \+35/i)).toBeInTheDocument();
    });

    it('oferece recomeçar a partida e começar uma nova', async () => {
        const usuario = userEvent.setup();
        const onRecomecarPartida = jest.fn();
        const onGameReset = jest.fn();
        renderRanking([jogador('Ana', 200, { vencedor: true })], {
            onRecomecarPartida,
            onGameReset,
        });

        await usuario.click(
            screen.getByRole('button', { name: /recomeçar partida/i })
        );
        await usuario.click(
            screen.getByRole('button', { name: /nova partida/i })
        );

        expect(onRecomecarPartida).toHaveBeenCalledTimes(1);
        expect(onGameReset).toHaveBeenCalledTimes(1);
    });

});
