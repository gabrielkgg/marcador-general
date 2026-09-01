import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Marcador } from './Marcador';
import { criarJogadores } from '../game/jogadores';
import { CATEGORIAS } from '../game/tabelaPontos';

const renderMarcador = ({ nomes = ['Ana', 'Bob'], modo = 'classico' } = {}) => {
    const usuario = userEvent.setup();
    render(
        <Marcador
            nomes={criarJogadores(nomes)}
            modo={modo}
            onGameReset={() => {}}
        />
    );
    return usuario;
};

// Localiza a linha da tabela pela legenda da categoria (ex.: '3', 'Quad.').
const linha = (legenda) =>
    screen
        .getAllByRole('row')
        .find((row) => row.querySelector('th')?.textContent === legenda);

const marcar = (usuario, legenda, valor) =>
    usuario.click(
        within(linha(legenda)).getByRole('cell', { name: String(valor) })
    );

const confirmar = (usuario) =>
    usuario.click(screen.getByRole('button', { name: /confirmar/i }));

const voltar = (usuario) => usuario.click(screen.getAllByRole('button')[0]);

const placar = () => screen.getByText(/pontos$/).textContent;

describe('fluxo de uma jogada', () => {
    it('soma no placar do jogador da vez a célula marcada', async () => {
        const usuario = renderMarcador();

        await marcar(usuario, '3', 9);

        expect(screen.getByText(/vez de ana/i)).toBeInTheDocument();
        expect(placar()).toBe('9 pontos');
    });

    it('passa a vez ao confirmar, zerando o placar exibido para o próximo', async () => {
        const usuario = renderMarcador();

        await marcar(usuario, '3', 9);
        await confirmar(usuario);

        expect(screen.getByText(/vez de bob/i)).toBeInTheDocument();
        expect(placar()).toBe('0 pontos');
    });

    it('permite trocar de célula antes de confirmar, substituindo a escolha', async () => {
        const usuario = renderMarcador();

        await marcar(usuario, '3', 9);
        await marcar(usuario, '5', 25);

        expect(placar()).toBe('25 pontos');
    });

    it('não deixa sobrescrever uma categoria já confirmada', async () => {
        const usuario = renderMarcador({ nomes: ['Ana'] });

        await marcar(usuario, '3', 9);
        await confirmar(usuario);
        await marcar(usuario, '3', 15);

        expect(placar()).toBe('9 pontos');
    });
});

describe('voltar jogada', () => {
    it('desfaz a última jogada confirmada e devolve a vez a quem a fez', async () => {
        const usuario = renderMarcador();

        await marcar(usuario, '3', 9);
        await confirmar(usuario);
        await voltar(usuario);

        expect(screen.getByText(/vez de ana/i)).toBeInTheDocument();
        expect(placar()).toBe('0 pontos');
    });

    it('não faz nada quando ainda não há jogada confirmada', async () => {
        const usuario = renderMarcador();

        await voltar(usuario);

        expect(screen.getByText(/vez de ana/i)).toBeInTheDocument();
        expect(placar()).toBe('0 pontos');
    });
});

// Seção superior fechada com exatamente 63 pontos (o limiar do bônus).
const SECAO_SUPERIOR_COM_BONUS = [
    ['1', 3],
    ['2', 6],
    ['3', 9],
    ['4', 12],
    ['5', 15],
    ['6', 18],
];

describe('indicador de bônus', () => {
    it('mostra quanto falta para o bônus no modo bônus', async () => {
        const usuario = renderMarcador({ modo: 'bonus' });

        await marcar(usuario, '3', 9);

        expect(
            screen.getByText(/faltam 54 pts para o bônus/i)
        ).toBeInTheDocument();
    });

    it('não mostra indicador de bônus no modo clássico', async () => {
        const usuario = renderMarcador({ modo: 'classico' });

        await marcar(usuario, '3', 9);

        expect(screen.queryByText(/bônus/i)).not.toBeInTheDocument();
    });

    it('sinaliza o bônus e o soma ao placar ao atingir 63 nos números', async () => {
        const usuario = renderMarcador({ nomes: ['Ana'], modo: 'bonus' });

        for (const [legenda, valor] of SECAO_SUPERIOR_COM_BONUS) {
            await marcar(usuario, legenda, valor);
            await confirmar(usuario);
        }

        expect(screen.getByText(/bônus \+35/i)).toBeInTheDocument();
        expect(placar()).toBe('98 pontos');
    });
});

describe('fim de jogo', () => {
    // Fecha a tabela inteira de todos os jogadores marcando o maior valor de
    // cada categoria, exceto onde `excecoes` pedir outro valor.
    const jogarPartidaInteira = async (usuario, jogadores, excecoes = {}) => {
        for (const { categoria, legenda, pontos } of CATEGORIAS) {
            for (const nome of jogadores) {
                const valor =
                    excecoes[nome]?.[categoria] ?? pontos[pontos.length - 1];
                await marcar(usuario, legenda, valor);
                await confirmar(usuario);
            }
        }
    };

    it('mostra o ranking ordenado com o troféu para o vencedor', async () => {
        const usuario = renderMarcador();

        await jogarPartidaInteira(usuario, ['Ana', 'Bob'], {
            Bob: { generalDeMao: 0 },
        });

        expect(screen.getByText(/fim de jogo/i)).toBeInTheDocument();
        const itens = screen.getAllByText(/pontos$/);
        // Marcando o maior valor de cada categoria dá 360; Bob abre mão dos
        // 100 do General de mão e fica em 260.
        expect(itens[0].textContent).toBe('360 pontos');
        expect(itens[1].textContent).toBe('260 pontos');
        expect(screen.getByText(/\u{1F3C6}/u)).toBeInTheDocument();
    });

});
