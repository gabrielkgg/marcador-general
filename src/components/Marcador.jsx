import React, { useState } from 'react';
import { Tabela } from './Tabela';

export function Marcador({ nomes, onGameReset }) {
    const [jogadores, setJogadores] = useState(nomes);
    const [jogadorAtual, setJogadorAtual] = useState(0);
    const [marcouPonto, setMarcouPonto] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [listaNomes, setListaNomes] = useState([]);

    const proximoJogador = () => {
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

        // Se detectamos que o jogador já marcou ponto nessa rodada, nada acontece
        if (marcouPonto) {
            return;
        }

        setMarcouPonto(true);
        novosJogadores[jogadorAtual].pontos[obj] = pontos;
        novosJogadores[jogadorAtual].pontos['total'] += pontos;
        setJogadores(novosJogadores);
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
            const listaNomes = jogadoresOrdenados.map((jogador) => {
                return { nome: jogador.nome, pontos: jogador.pontos.total };
            });
            setListaNomes(listaNomes);
            setGameOver(true);
        }
    };

    return (
        <div>
            {!gameOver ? (
                <div>
                    <p>Vez de {nomes[jogadorAtual].nome}</p>
                    <p>Total pontos: {nomes[jogadorAtual].pontos.total}</p>
                    <Tabela
                        jogadorAtual={jogadorAtual}
                        jogadores={jogadores}
                        setPonto={setPonto}
                    />
                    {/* //TODO adicionar botão de voltar jogada */}
                    <button onClick={proximoJogador}>Finalizar jogada</button>
                    <button onClick={onGameReset}>Reiniciar partida</button>
                </div>
            ) : (
                // TODO transformar isso num componente FimDeJogo
                <div>
                    Fim de jogo:
                    <ul>
                        {listaNomes.map((jogador, index) => {
                            return (
                                <li key={index}>
                                    {jogador.nome} - {jogador.pontos}
                                    {index === 0 ? ' \u{1F3C6}' : ' \u{1F986}'}
                                </li>
                            );
                        })}
                    </ul>
                    <button onClick={onGameReset}>Reiniciar partida</button>
                </div>
            )}
        </div>
    );
}
