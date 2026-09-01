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

const nomeDaVez = () => screen.getByText(/vez de/i);

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

describe('confirmar sem marcar', () => {
    it('não passa a vez enquanto nenhuma célula foi escolhida', async () => {
        const usuario = renderMarcador();

        await confirmar(usuario);

        expect(screen.getByText(/vez de ana/i)).toBeInTheDocument();
        expect(placar()).toBe('0 pontos');
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

    it('desfaz a marcação ainda não confirmada, liberando a categoria', async () => {
        const usuario = renderMarcador();

        await marcar(usuario, '3', 9);
        await voltar(usuario);

        expect(screen.getByText(/vez de ana/i)).toBeInTheDocument();
        expect(placar()).toBe('0 pontos');

        // A categoria volta a aceitar outro valor.
        await marcar(usuario, '3', 15);
        expect(placar()).toBe('15 pontos');
    });

    it('desfaz primeiro a marcação pendente, sem comer a jogada do outro jogador', async () => {
        const usuario = renderMarcador();

        await marcar(usuario, '1', 5);
        await confirmar(usuario);
        await marcar(usuario, '2', 10);
        await voltar(usuario);

        // A vez continua do Bob, agora sem a marcação pendente.
        expect(screen.getByText(/vez de bob/i)).toBeInTheDocument();
        expect(placar()).toBe('0 pontos');

        // O segundo clique é que desfaz a jogada confirmada da Ana.
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

    it('perde o bônus ao voltar a jogada que o havia garantido', async () => {
        const usuario = renderMarcador({ nomes: ['Ana'], modo: 'bonus' });

        for (const [legenda, valor] of SECAO_SUPERIOR_COM_BONUS) {
            await marcar(usuario, legenda, valor);
            await confirmar(usuario);
        }
        await voltar(usuario);

        expect(screen.queryByText(/bônus \+35/i)).not.toBeInTheDocument();
        expect(
            screen.getByText(/faltam 18 pts para o bônus/i)
        ).toBeInTheDocument();
        expect(placar()).toBe('45 pontos');
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

    it('no modo bônus, encerra somando o bônus e avisando no ranking', async () => {
        const usuario = renderMarcador({
            nomes: ['Ana', 'Bob'],
            modo: 'bonus',
        });

        await jogarPartidaInteira(usuario, ['Ana', 'Bob'], {
            // Bob zera os números e fica sem bônus; Ana marca o máximo e ganha.
            Bob: {
                ones: 0,
                twos: 0,
                threes: 0,
                fours: 0,
                fives: 0,
                sixes: 0,
            },
        });

        const itens = screen.getAllByText(/pontos$/);
        // O texto do vencedor também traz o aviso do bônus, por isso o toMatch.
        expect(itens[0].textContent).toMatch(/^395 pontos/);
        expect(itens[1].textContent).toBe('255 pontos');
        expect(screen.getByText(/inclui bônus \+35/i)).toBeInTheDocument();
    });

    it('troca o rótulo para "Revanche" da segunda partida em diante', async () => {
        const usuario = renderMarcador({ nomes: ['Ana'] });

        await jogarPartidaInteira(usuario, ['Ana']);
        expect(
            screen.getByRole('button', { name: /mesmos jogadores/i })
        ).toBeInTheDocument();

        await usuario.click(
            screen.getByRole('button', { name: /mesmos jogadores/i })
        );
        await jogarPartidaInteira(usuario, ['Ana']);

        expect(
            screen.getByRole('button', { name: /revanche/i })
        ).toBeInTheDocument();
    });

    it('recomeça a partida com os mesmos jogadores, na ordem de cadastro e zerada', async () => {
        const usuario = renderMarcador();

        await jogarPartidaInteira(usuario, ['Ana', 'Bob'], {
            Ana: { generalDeMao: 0 },
        });
        await usuario.click(
            screen.getByRole('button', { name: /mesmos jogadores/i })
        );

        // Bob venceu, mas quem recomeça é a Ana: a ordem de cadastro é mantida.
        expect(screen.getByText(/vez de ana/i)).toBeInTheDocument();
        expect(placar()).toBe('0 pontos');
        expect(
            within(linha('3')).getByRole('cell', { name: '15' })
        ).not.toHaveClass('preenchido');
    });
});

describe('sinal visual no nome da vez', () => {
    it('pisca uma vez ao confirmar a jogada', async () => {
        const usuario = renderMarcador();

        await marcar(usuario, '3', 9);
        await confirmar(usuario);

        expect(nomeDaVez()).toHaveClass('piscar-simples');
    });

    it('pisca do mesmo jeito quando só a marcação pendente é desfeita', async () => {
        const usuario = renderMarcador();

        await marcar(usuario, '3', 9);
        await voltar(usuario);

        expect(nomeDaVez()).toHaveClass('piscar-simples');
    });

    it('pisca de outro jeito quando a jogada confirmada é desfeita', async () => {
        const usuario = renderMarcador();

        await marcar(usuario, '3', 9);
        await confirmar(usuario);
        await voltar(usuario);

        expect(nomeDaVez()).toHaveClass('piscar-jogada');
    });

    it('não pisca ao apenas marcar uma célula', async () => {
        const usuario = renderMarcador();

        await marcar(usuario, '3', 9);

        expect(nomeDaVez().className).toBe('vez-de');
    });
});
