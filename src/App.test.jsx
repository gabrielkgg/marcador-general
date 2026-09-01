import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

const SPLASH_TOTAL_MS = 3300;

const renderApp = () => {
    const usuario = userEvent.setup({
        advanceTimers: jest.advanceTimersByTime,
    });
    render(<App />);
    return usuario;
};

// Pula a splash de abertura para chegar na tela de cadastro.
const passarSplash = () => {
    act(() => {
        jest.advanceTimersByTime(SPLASH_TOTAL_MS);
    });
};

const cadastrar = async (usuario, nomes) => {
    for (const [posicao, nome] of nomes.entries()) {
        await usuario.type(
            screen.getByPlaceholderText(`Nome do jogador ${posicao + 1}`),
            nome
        );
    }
    await usuario.click(
        screen.getByRole('button', { name: /iniciar partida/i })
    );
};

describe('app', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    it('abre com a splash e a mantém durante o fade', () => {
        renderApp();

        expect(screen.getByLabelText('Carregando')).toBeInTheDocument();

        act(() => {
            jest.advanceTimersByTime(3000);
        });

        expect(screen.getByLabelText('Carregando')).toBeInTheDocument();
    });

    it('some com a splash depois do fade', () => {
        renderApp();

        passarSplash();

        expect(screen.queryByLabelText('Carregando')).not.toBeInTheDocument();
    });

    it('começa no cadastro e vai para a partida ao iniciar', async () => {
        const usuario = renderApp();
        passarSplash();

        expect(
            screen.getByRole('heading', { name: /marcador de general/i })
        ).toBeInTheDocument();

        await cadastrar(usuario, ['Ana', 'Bob']);

        expect(screen.getByText(/vez de ana/i)).toBeInTheDocument();
        expect(
            screen.queryByRole('heading', { name: /marcador de general/i })
        ).not.toBeInTheDocument();
    });

    it('volta para o cadastro quando o reset é confirmado', async () => {
        jest.spyOn(window, 'confirm').mockReturnValue(true);
        const usuario = renderApp();
        passarSplash();
        await cadastrar(usuario, ['Ana', 'Bob']);

        await usuario.click(screen.getByAltText(/reiniciar a partida/i));

        expect(
            screen.getByRole('heading', { name: /marcador de general/i })
        ).toBeInTheDocument();
    });

    it('continua na partida quando o reset é cancelado', async () => {
        jest.spyOn(window, 'confirm').mockReturnValue(false);
        const usuario = renderApp();
        passarSplash();
        await cadastrar(usuario, ['Ana', 'Bob']);

        await usuario.click(screen.getByAltText(/reiniciar a partida/i));

        expect(screen.getByText(/vez de ana/i)).toBeInTheDocument();
    });
});
