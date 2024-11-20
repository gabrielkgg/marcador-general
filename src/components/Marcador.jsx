import React, { useState } from 'react';
import { Tabela } from './Tabela';
import { FimDeJogo } from './FimDeJogo';
import './../styles/Marcador.scss';

export function Marcador({ nomes, onGameReset }) {
    const [jogadores, setJogadores] = useState(nomes);
    const [jogadorAtual, setJogadorAtual] = useState(0);
    const [marcouPonto, setMarcouPonto] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [listaNomes, setListaNomes] = useState([]);
    const [voltarJogada, setVoltarJogada] = useState({});

    const proximoJogador = () => {
        // if (!marcouPonto) {
        //     return;
        // }

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
        // Previne que volte a jogada caso não tenha feito ainda
        if (!marcouPonto) {
            return;
        }

        const novosJogadores = [...jogadores];
        novosJogadores[voltarJogada.jogadorAtual].pontos[voltarJogada.obj] =
            undefined;
        novosJogadores[voltarJogada.jogadorAtual].pontos['total'] -=
            voltarJogada.pontos;
        setMarcouPonto(false);
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
                        {marcouPonto && (
                            <div className="flex justify-center confirmar-jogada-holder">
                                <button
                                    onClick={proximoJogador}
                                    className="botao-padrao font-regular"
                                >
                                    Confirmar jogada
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-center">
                        <button
                            onClick={onGameReset}
                            className="botao-opaco font-regular"
                        >
                            Reiniciar partida
                        </button>
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
