import React from 'react';

export function Tabela({ jogadorAtual, jogadores, setPonto }) {
    const arrayPontosOne = [0, 1, 2, 3, 4, 5, 6];
    // const arrayPontosTwo = [0, 2, 4, 6, 8, 10, 12];

    return (
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
                {/* <tr>
                    <th>2:</th>
                    {arrayPontosTwo.map((valor, index) => (
                        <td
                            key={index}
                            onClick={() =>
                                setPonto(jogadorAtual, valor, 'twos')
                            }
                            className={
                                jogadores[jogadorAtual].pontos['twos'] !==
                                undefined
                                    ? 'preenchido'
                                    : ''
                            }
                        >
                            {jogadores[jogadorAtual].pontos['twos'] ===
                            valor ? (
                                <strong>{valor}</strong>
                            ) : (
                                valor
                            )}
                        </td>
                    ))}
                </tr> */}
            </tbody>
        </table>
    );
}
