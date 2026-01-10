import React, { useState } from 'react';
import { Tabela } from './Tabela';
import { FimDeJogo } from './FimDeJogo';
import './../styles/Marcador.scss';
import check from './../assets/check-solid.svg';
import voltar from './../assets/arrow-left-solid-full.svg';

export function Marcador({ nomes, onGameReset }) {
    const [jogadores, setJogadores] = useState(nomes);
    const [jogadorAtual, setJogadorAtual] = useState(0);
    const [marcouPonto, setMarcouPonto] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [listaNomes, setListaNomes] = useState([]);
    const [voltarJogada, setVoltarJogada] = useState({});
    // Histórico de jogadas confirmadas: array de objetos { jogadorIndex, categoria, pontos }
    const [historicoJogadas, setHistoricoJogadas] = useState([]);

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
        setJogadorAtual((jogadorAtual + 1) % nomes.length);
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
            const jogadoresOrdenados = jogadores.sort(
                (a, b) => b.pontos.total - a.pontos.total
            );

            // Encontra a maior pontuação (primeiro jogador na lista ordenada)
            const maiorPontuacao = jogadoresOrdenados[0].pontos.total;

            const listaNomes = jogadoresOrdenados.map((jogador) => {
                return {
                    nome: jogador.nome,
                    pontos: jogador.pontos.total,
                    vencedor: maiorPontuacao === jogador.pontos.total,
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
                            Vez de {nomes[jogadorAtual].nome}
                        </p>
                        <p className="pontos">
                            {nomes[jogadorAtual].pontos.total} pontos
                        </p>
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
                />
            )}
        </>
    );
}
