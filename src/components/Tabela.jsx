import React from 'react';

export function Tabela({ jogadorAtual, jogadores, setPonto }) {
    const arrayPontos = [
        {
            ones: { legenda: '1', pontos: [0, 1, 2, 3, 4, 5] },
        },
        {
            twos: { legenda: '2', pontos: [0, 2, 4, 6, 8, 10] },
        },
        {
            threes: { legenda: '3', pontos: [0, 3, 6, 9, 12, 15] },
        },
        {
            fours: { legenda: '4', pontos: [0, 4, 8, 12, 16, 20] },
        },
        {
            fives: { legenda: '5', pontos: [0, 5, 10, 15, 20, 25] },
        },
        {
            sixes: { legenda: '6', pontos: [0, 6, 12, 18, 24, 30] },
        },
        {
            fullHouse: { legenda: 'Fula', pontos: [0, 20, 25] },
        },
        {
            straight: { legenda: 'Sequência', pontos: [0, 30, 35] },
        },
        {
            quadra: { legenda: 'Quadra', pontos: [0, 40, 45] },
        },
        {
            general: { legenda: 'General', pontos: [0, 50] },
        },
        {
            generalDeMao: { legenda: 'General de Mão', pontos: [0, 100] },
        },
    ];

    return (
        <div>
            <table>
                <tbody>
                    {arrayPontos.map((pontos, indexPontos) => {
                        const nomePropriedade = Object.keys(pontos)[0]; // Acessa o nome da propriedade, ex: "ones" ou "twos"
                        const valores = pontos[nomePropriedade].pontos; // Acessa o array de valores (ex: [0, 1, 2, 3, 4, 5, 6])
                        const legenda = pontos[nomePropriedade].legenda;

                        return (
                            <tr key={indexPontos}>
                                <th>{legenda}:</th>
                                {valores.map((valor, indexValor) => (
                                    <td
                                        key={indexValor}
                                        onClick={() =>
                                            setPonto(
                                                jogadorAtual,
                                                valor,
                                                nomePropriedade
                                            )
                                        }
                                        className={
                                            jogadores[jogadorAtual].pontos[
                                                nomePropriedade
                                            ] !== undefined
                                                ? 'preenchido'
                                                : ''
                                        }
                                    >
                                        {jogadores[jogadorAtual].pontos[
                                            nomePropriedade
                                        ] === valor ? (
                                            <strong>{valor}</strong>
                                        ) : (
                                            valor
                                        )}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
