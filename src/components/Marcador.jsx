import React, { useState } from 'react';
import { Tabela } from './Tabela';
import { FimDeJogo } from './FimDeJogo';
import './../styles/Marcador.scss';
import check from './../assets/check-solid.svg';
import voltar from './../assets/arrow-left-solid-full.svg';

// Bônus de seção superior (modo 'bonus'): se a soma das categorias numéricas
// (1 a 6) atingir BONUS_LIMIAR, o jogador ganha BONUS_VALOR pontos.
const CATEGORIAS_SUPERIORES = [
    'ones',
    'twos',
    'threes',
    'fours',
    'fives',
    'sixes',
];
const BONUS_LIMIAR = 63;
const BONUS_VALOR = 35;

export function Marcador({ nomes, modo, onGameReset }) {
    const [jogadores, setJogadores] = useState(nomes);
    const [jogadorAtual, setJogadorAtual] = useState(0);
    const [marcouPonto, setMarcouPonto] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [listaNomes, setListaNomes] = useState([]);
    const [voltarJogada, setVoltarJogada] = useState({});
    // Histórico de jogadas confirmadas: array de objetos { jogadorIndex, categoria, pontos }
    const [historicoJogadas, setHistoricoJogadas] = useState([]);

    // Soma das categorias numéricas (1–6) já marcadas.
    const somaSecaoSuperior = (pontos) =>
        CATEGORIAS_SUPERIORES.reduce(
            (soma, categoria) => soma + (pontos[categoria] || 0),
            0
        );

    const secaoSuperiorCompleta = (pontos) =>
        CATEGORIAS_SUPERIORES.every(
            (categoria) => pontos[categoria] !== undefined
        );

    // Bônus derivado das categorias 1–6 (não é armazenado): recalculado a cada
    // render, então acompanha automaticamente as jogadas e o "voltar jogada".
    const calcularBonus = (pontos) => {
        if (modo !== 'bonus') {
            return 0;
        }
        return somaSecaoSuperior(pontos) >= BONUS_LIMIAR ? BONUS_VALOR : 0;
    };

    // Quantos pontos ainda faltam para o bônus. Retorna null quando não se
    // aplica: fora do modo bônus, já alcançado, ou a seção superior já fechou
    // (não há mais como atingir o limiar).
    const faltaParaBonus = (pontos) => {
        if (modo !== 'bonus') {
            return null;
        }
        const restante = BONUS_LIMIAR - somaSecaoSuperior(pontos);
        if (restante <= 0 || secaoSuperiorCompleta(pontos)) {
            return null;
        }
        return restante;
    };

    // Total exibido/ranqueado = soma das categorias + eventual bônus de seção.
    const totalComBonus = (pontos) => pontos.total + calcularBonus(pontos);

    const recomecarPartida = () => {
        // Reseta o jogo mantendo os mesmos jogadores e ordem
        const jogadoresResetados = jogadores.map((jogador) => ({
            nome: jogador.nome,
            pontos: {
                ones: undefined,
                twos: undefined,
                threes: undefined,
                fours: undefined,
                fives: undefined,
                sixes: undefined,
                fullHouse: undefined,
                straight: undefined,
                quadra: undefined,
                general: undefined,
                generalDeMao: undefined,
                total: 0,
            },
        }));
        setJogadores(jogadoresResetados);
        setJogadorAtual(0);
        setMarcouPonto(false);
        setGameOver(false);
        setListaNomes([]);
        setVoltarJogada({});
        setHistoricoJogadas([]);
    };

    const proximoJogador = () => {
        if (!marcouPonto) {
            return;
        }

        // Adiciona a jogada atual ao histórico antes de confirmar
        if (voltarJogada.jogadorAtual !== undefined) {
            setHistoricoJogadas((prev) => [
                ...prev,
                {
                    jogadorIndex: voltarJogada.jogadorAtual,
                    categoria: voltarJogada.obj,
                    pontos: voltarJogada.pontos,
                },
            ]);
        }

        setMarcouPonto(false);
        setJogadorAtual((jogadorAtual + 1) % jogadores.length);
        fimDoJogo();
    };

    const setPonto = (jogadorAtual, pontos, obj) => {
        // Evita alterar diretamente o array nomes
        const novosJogadores = [...jogadores];

        // Se a categoria (ex: 'ones') já tiver um valor, não permite alteração
        if (novosJogadores[jogadorAtual].pontos[obj] !== undefined) {
            return;
        }

        // Se detectamos que o jogador já marcou ponto nessa rodada, reduzimos o que tinha marcado antes
        if (marcouPonto) {
            novosJogadores[voltarJogada.jogadorAtual].pontos[voltarJogada.obj] =
                undefined;
            novosJogadores[voltarJogada.jogadorAtual].pontos['total'] -=
                voltarJogada.pontos;
        }

        setMarcouPonto(true);
        novosJogadores[jogadorAtual].pontos[obj] = pontos;
        novosJogadores[jogadorAtual].pontos['total'] += pontos;
        setVoltarJogada({ jogadorAtual, obj, pontos });
        setJogadores(novosJogadores);
    };

    const voltarJogadaHandler = () => {
        // Verifica se há jogadas no histórico para desfazer
        if (historicoJogadas.length === 0) {
            return; // Não há jogadas para desfazer
        }

        // Pega a última jogada do histórico
        const ultimaJogada = historicoJogadas[historicoJogadas.length - 1];

        // Cria uma cópia dos jogadores para modificar
        const novosJogadores = [...jogadores];

        // Desfaz os pontos da última jogada
        const jogadorIndex = ultimaJogada.jogadorIndex;
        novosJogadores[jogadorIndex].pontos[ultimaJogada.categoria] = undefined;
        novosJogadores[jogadorIndex].pontos['total'] -= ultimaJogada.pontos;

        // Remove a última jogada do histórico
        setHistoricoJogadas((prev) => prev.slice(0, -1));

        // Atualiza os jogadores
        setJogadores(novosJogadores);

        // Volta para o jogador que fez a última jogada (que estamos desfazendo)
        setJogadorAtual(ultimaJogada.jogadorIndex);

        // Reseta o estado de marcação de ponto
        setMarcouPonto(false);
        setVoltarJogada({});
    };

    const fimDoJogo = () => {
        // Varre o array de jogadores verificando se todos preencheram tudo.
        const todosPontosMarcados = jogadores.every((jogador) =>
            Object.values(jogador.pontos).every((valor) => valor !== undefined)
        );

        if (todosPontosMarcados) {
            // Ordena sobre uma cópia para não mutar o array de estado `jogadores`.
            // Mutar aqui reordenava os jogadores por pontuação, e ao "Recomeçar
            // partida" eles reiniciavam fora da ordem de cadastro.
            const jogadoresOrdenados = [...jogadores].sort(
                (a, b) => totalComBonus(b.pontos) - totalComBonus(a.pontos)
            );

            // Encontra a maior pontuação (primeiro jogador na lista ordenada)
            const maiorPontuacao = totalComBonus(jogadoresOrdenados[0].pontos);

            const listaNomes = jogadoresOrdenados.map((jogador) => {
                return {
                    nome: jogador.nome,
                    pontos: totalComBonus(jogador.pontos),
                    bonus: calcularBonus(jogador.pontos) > 0,
                    vencedor: maiorPontuacao === totalComBonus(jogador.pontos),
                };
            });
            setListaNomes(listaNomes);
            setGameOver(true);
        }
    };

    return (
        <>
            {!gameOver ? (
                <div>
                    <div className="holder table-holder">
                        <p className="vez-de">
                            Vez de {jogadores[jogadorAtual].nome}
                        </p>
                        <p className="pontos">
                            {totalComBonus(jogadores[jogadorAtual].pontos)}{' '}
                            pontos
                        </p>
                        {calcularBonus(jogadores[jogadorAtual].pontos) > 0 ? (
                            <p className="bonus-indicador font-regular">
                                Bônus +{BONUS_VALOR}
                            </p>
                        ) : (
                            faltaParaBonus(jogadores[jogadorAtual].pontos) !==
                                null && (
                                <p className="bonus-indicador bonus-faltando font-regular">
                                    Faltam{' '}
                                    {faltaParaBonus(
                                        jogadores[jogadorAtual].pontos
                                    )}{' '}
                                    pts para o bônus
                                </p>
                            )
                        )}
                        <Tabela
                            jogadorAtual={jogadorAtual}
                            jogadores={jogadores}
                            setPonto={setPonto}
                        />
                        <div className="flex justify-center confirmar-jogada-holder">
                            <button
                                className="botao-opaco"
                                onClick={voltarJogadaHandler}
                            >
                                <img src={voltar} className="voltar" />
                            </button>
                            <button
                                onClick={proximoJogador}
                                className={`botao-padrao font-regular flex center check-button ${
                                    !marcouPonto ? 'desativado' : ''
                                }`}
                            >
                                Confirmar
                                <img src={check} className="check" />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <FimDeJogo
                    listaJogadores={listaNomes}
                    onGameReset={onGameReset}
                    onRecomecarPartida={recomecarPartida}
                />
            )}
        </>
    );
}
