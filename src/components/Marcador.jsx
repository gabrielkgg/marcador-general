import React, { useState } from 'react';
import { Tabela } from './Tabela';
import { FimDeJogo } from './FimDeJogo';
import {
    criarPontosVazios,
    desmarcarPonto,
    marcarPonto,
} from '../game/jogadores';
import {
    BONUS_VALOR,
    calcularBonus,
    faltaParaBonus,
    totalComBonus,
} from '../game/pontuacao';
import { calcularRanking, partidaTerminada } from '../game/ranking';
import './../styles/Marcador.scss';
import check from './../assets/check-solid.svg';
import voltar from './../assets/arrow-left-solid-full.svg';

export function Marcador({ nomes, modo, onGameReset }) {
    const [jogadores, setJogadores] = useState(nomes);
    const [jogadorAtual, setJogadorAtual] = useState(0);
    const [marcouPonto, setMarcouPonto] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [listaNomes, setListaNomes] = useState([]);
    const [voltarJogada, setVoltarJogada] = useState({});
    // Histórico de jogadas confirmadas: array de objetos { jogadorIndex, categoria, pontos }
    const [historicoJogadas, setHistoricoJogadas] = useState([]);
    const bonusDe = (pontos) => calcularBonus(pontos, modo);
    const totalDe = (pontos) => totalComBonus(pontos, modo);
    const faltandoDe = (pontos) => faltaParaBonus(pontos, modo);

    const recomecarPartida = () => {
        // Reseta o jogo mantendo os mesmos jogadores e ordem
        const jogadoresResetados = jogadores.map((jogador) => ({
            nome: jogador.nome,
            pontos: criarPontosVazios(),
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

        // Adiciona a jogada atual ao histórico antes de confirmar. `marcouPonto`
        // só fica true junto com `voltarJogada`, então aqui ela sempre existe.
        setHistoricoJogadas((prev) => [
            ...prev,
            {
                jogadorIndex: voltarJogada.jogadorAtual,
                categoria: voltarJogada.obj,
                pontos: voltarJogada.pontos,
            },
        ]);

        setMarcouPonto(false);
        setJogadorAtual((jogadorAtual + 1) % jogadores.length);
        fimDoJogo();
    };

    const setPonto = (jogadorAtual, pontos, obj) => {
        // Se a categoria (ex: 'ones') já tiver um valor, não permite alteração
        if (jogadores[jogadorAtual].pontos[obj] !== undefined) {
            return;
        }

        // Se o jogador já marcou nessa rodada, desfaz a marcação anterior antes
        // de aplicar a nova, permitindo trocar de escolha antes de confirmar.
        const base = marcouPonto
            ? desmarcarPonto(
                  jogadores,
                  voltarJogada.jogadorAtual,
                  voltarJogada.obj,
                  voltarJogada.pontos
              )
            : jogadores;

        setJogadores(marcarPonto(base, jogadorAtual, obj, pontos));
        setMarcouPonto(true);
        setVoltarJogada({ jogadorAtual, obj, pontos });
    };

    const voltarJogadaHandler = () => {
        // A marcação ainda não confirmada é a primeira a ser desfeita: ela não
        // está no histórico, então nenhum clique posterior conseguiria removê-la
        // (era assim que uma célula ficava travada na primeira rodada).
        if (marcouPonto) {
            setJogadores(
                desmarcarPonto(
                    jogadores,
                    voltarJogada.jogadorAtual,
                    voltarJogada.obj,
                    voltarJogada.pontos
                )
            );
            setMarcouPonto(false);
            setVoltarJogada({});
            return;
        }

        // Sem marcação pendente, desfaz a última jogada confirmada.
        if (historicoJogadas.length === 0) {
            return;
        }

        const ultimaJogada = historicoJogadas[historicoJogadas.length - 1];
        setJogadores(
            desmarcarPonto(
                jogadores,
                ultimaJogada.jogadorIndex,
                ultimaJogada.categoria,
                ultimaJogada.pontos
            )
        );
        setHistoricoJogadas((prev) => prev.slice(0, -1));
        // Devolve a vez a quem fez a jogada desfeita.
        setJogadorAtual(ultimaJogada.jogadorIndex);
        setVoltarJogada({});
    };

    const fimDoJogo = () => {
        if (!partidaTerminada(jogadores)) {
            return;
        }
        setListaNomes(calcularRanking(jogadores, modo));
        setGameOver(true);
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
                            {totalDe(jogadores[jogadorAtual].pontos)} pontos
                        </p>
                        {bonusDe(jogadores[jogadorAtual].pontos) > 0 ? (
                            <p className="bonus-indicador font-regular">
                                Bônus +{BONUS_VALOR}
                            </p>
                        ) : (
                            faltandoDe(jogadores[jogadorAtual].pontos) !==
                                null && (
                                <p className="bonus-indicador bonus-faltando font-regular">
                                    Faltam{' '}
                                    {faltandoDe(jogadores[jogadorAtual].pontos)}{' '}
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
