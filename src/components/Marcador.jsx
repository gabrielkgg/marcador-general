import React, { useState } from 'react';

export function Marcador({ nomes, onGameReset }) {
    const [jogadores, setJogadores] = useState(nomes);
    const [jogadorAtual, setJogadorAtual] = useState(0);
    const arrayPontosOne = [1, 2, 3, 4, 5, 6];
    const proximoJogador = () => {
        setJogadorAtual((jogadorAtual + 1) % nomes.length);
    };

    const setPonto = (jogadorAtual, pontos, obj) => {
        // Evita alterar diretamente o array nomes
        const novosJogadores = [...jogadores];

        // Se a categoria (ex: 'ones') já tiver um valor, não permite alteração
        if (novosJogadores[jogadorAtual].pontos[obj] !== undefined) {
            return;
        }

        novosJogadores[jogadorAtual].pontos[obj] = pontos;
        novosJogadores[jogadorAtual].pontos['total'] += pontos;

        setJogadores(novosJogadores);
    };

    return (
        <div>
            <p>Vez de {nomes[jogadorAtual].nome}</p>
            <p>Total pontos: {nomes[jogadorAtual].pontos.total}</p>
            <table>
                <tbody>
                    <tr>
                        <th>1:</th>
                        {arrayPontosOne.map((valor, index) => (
                            <td
                                key={index}
                                onClick={() =>
                                    setPonto(jogadorAtual, valor, 'ones')
                                }
                                className={
                                    jogadores[jogadorAtual].pontos['ones'] !==
                                    undefined
                                        ? 'preenchido'
                                        : ''
                                }
                            >
                                {jogadores[jogadorAtual].pontos['ones'] ===
                                valor ? (
                                    <strong>{valor}</strong>
                                ) : (
                                    valor
                                )}
                            </td>
                        ))}
                    </tr>
                </tbody>
            </table>
            <button onClick={proximoJogador}>Finalizar jogada</button>
            <button onClick={onGameReset}>Reiniciar partida</button>
        </div>
    );
}
