import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CadastroJogadores } from './CadastroJogadores';

const renderCadastro = () => {
    const usuario = userEvent.setup();
    const onGameStart = jest.fn();
    render(<CadastroJogadores onGameStart={onGameStart} />);
    return { usuario, onGameStart };
};

const preencher = (usuario, posicao, nome) =>
    usuario.type(
        screen.getByPlaceholderText(`Nome do jogador ${posicao}`),
        nome
    );

const iniciar = (usuario) =>
    usuario.click(screen.getByRole('button', { name: /iniciar partida/i }));

describe('cadastro de jogadores', () => {
    beforeEach(() => {
        jest.spyOn(window, 'alert').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('começa a partida no modo clássico com os jogadores cadastrados', async () => {
        const { usuario, onGameStart } = renderCadastro();

        await preencher(usuario, 1, 'Ana');
        await preencher(usuario, 2, 'Bob');
        await iniciar(usuario);

        const [jogadores, modo] = onGameStart.mock.calls[0];
        expect(jogadores.map(({ nome }) => nome)).toEqual(['Ana', 'Bob']);
        expect(jogadores.every(({ pontos }) => pontos.total === 0)).toBe(true);
        expect(modo).toBe('classico');
    });

    it('não inicia a partida enquanto faltar o nome de algum jogador', async () => {
        const { usuario, onGameStart } = renderCadastro();

        await preencher(usuario, 1, 'Ana');
        await iniciar(usuario);

        expect(onGameStart).not.toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalled();
    });

    it('inicia no modo bônus quando essa opção é escolhida', async () => {
        const { usuario, onGameStart } = renderCadastro();

        await preencher(usuario, 1, 'Ana');
        await preencher(usuario, 2, 'Bob');
        await usuario.click(screen.getByRole('button', { name: /com bônus/i }));
        await iniciar(usuario);

        expect(onGameStart.mock.calls[0][1]).toBe('bonus');
        expect(
            screen.getByText(/63\+ nos números.*rende \+35 pontos/i)
        ).toBeInTheDocument();
    });

    it('não deixa cadastrar menos de 2 jogadores', async () => {
        const { usuario } = renderCadastro();

        await usuario.click(
            screen.getByRole('button', { name: /menos um jogador/i })
        );

        expect(
            screen.getByPlaceholderText('Nome do jogador 2')
        ).toBeInTheDocument();
    });

    it('adiciona um campo de nome ao aumentar a quantidade de jogadores', async () => {
        const { usuario } = renderCadastro();

        await usuario.click(
            screen.getByRole('button', { name: /mais um jogador/i })
        );

        expect(
            screen.getByPlaceholderText('Nome do jogador 3')
        ).toBeInTheDocument();
    });
});
