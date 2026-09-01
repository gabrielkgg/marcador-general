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

    it('permite digitar a quantidade de jogadores', async () => {
        const { usuario } = renderCadastro();
        const quantidade = screen.getByRole('spinbutton');

        await usuario.clear(quantidade);
        await usuario.type(quantidade, '12');

        expect(quantidade).toHaveValue(12);
        expect(
            screen.getByPlaceholderText('Nome do jogador 12')
        ).toBeInTheDocument();
    });

    it('ignora um valor acima do máximo de jogadores', async () => {
        const { usuario } = renderCadastro();
        const quantidade = screen.getByRole('spinbutton');

        await usuario.clear(quantidade);
        await usuario.type(quantidade, '99');

        // O "9" entra, o "99" é barrado por passar de 20.
        expect(quantidade).toHaveValue(9);
    });

    it('volta para o mínimo ao sair do campo vazio', async () => {
        const { usuario } = renderCadastro();
        const quantidade = screen.getByRole('spinbutton');

        await usuario.clear(quantidade);
        await usuario.tab();

        expect(quantidade).toHaveValue(2);
    });

    it('volta para o mínimo ao sair do campo com menos de 2', async () => {
        const { usuario } = renderCadastro();
        const quantidade = screen.getByRole('spinbutton');

        await usuario.clear(quantidade);
        await usuario.type(quantidade, '1');
        await usuario.tab();

        expect(quantidade).toHaveValue(2);
    });

    it('não aumenta além do máximo de jogadores', async () => {
        const { usuario } = renderCadastro();
        const quantidade = screen.getByRole('spinbutton');

        await usuario.clear(quantidade);
        await usuario.type(quantidade, '20');
        await usuario.click(
            screen.getByRole('button', { name: /mais um jogador/i })
        );

        expect(quantidade).toHaveValue(20);
    });

    it('volta para o modo clássico depois de escolher o bônus', async () => {
        const { usuario, onGameStart } = renderCadastro();

        await preencher(usuario, 1, 'Ana');
        await preencher(usuario, 2, 'Bob');
        await usuario.click(screen.getByRole('button', { name: /com bônus/i }));
        await usuario.click(screen.getByRole('button', { name: /clássico/i }));
        await iniciar(usuario);

        expect(onGameStart.mock.calls[0][1]).toBe('classico');
        expect(
            screen.queryByText(/rende \+35 pontos/i)
        ).not.toBeInTheDocument();
    });

    it('diminui a quantidade de jogadores acima do mínimo', async () => {
        const { usuario } = renderCadastro();
        const quantidade = screen.getByRole('spinbutton');

        await usuario.clear(quantidade);
        await usuario.type(quantidade, '5');
        await usuario.click(
            screen.getByRole('button', { name: /menos um jogador/i })
        );

        expect(quantidade).toHaveValue(4);
        expect(
            screen.queryByPlaceholderText('Nome do jogador 5')
        ).not.toBeInTheDocument();
    });

    it('normaliza a quantidade em branco para 2 ao tentar iniciar', async () => {
        const { usuario, onGameStart } = renderCadastro();

        await usuario.clear(screen.getByRole('spinbutton'));
        await iniciar(usuario);

        // Sair do campo já devolve o mínimo; o que barra é a falta dos nomes.
        expect(screen.getByRole('spinbutton')).toHaveValue(2);
        expect(onGameStart).not.toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalledWith(
            'Preencha corretamente o nome de todos os jogadores'
        );
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
