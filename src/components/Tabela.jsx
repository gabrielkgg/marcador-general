import React from 'react';
import { CATEGORIAS } from '../game/tabelaPontos';
import './../styles/Tabela.scss';

// Índice da última categoria numérica: depois dela entram as linhas
// espaçadoras que separam a seção superior das combinações especiais.
const ULTIMA_NUMERICA =
    CATEGORIAS.filter(({ especial }) => !especial).length - 1;

export function Tabela({ jogadorAtual, jogadores, setPonto }) {
    const pontosDoJogador = jogadores[jogadorAtual].pontos;

    return (
        <div>
            <table>
                <tbody>
                    {CATEGORIAS.map(
                        ({ categoria, legenda, pontos, especial }, indice) => (
                            <React.Fragment key={categoria}>
                                <tr>
                                    <th>{legenda}</th>
                                    {pontos.map((valor) => (
                                        <td
                                            key={valor}
                                            onClick={() =>
                                                setPonto(
                                                    jogadorAtual,
                                                    valor,
                                                    categoria
                                                )
                                            }
                                            className={
                                                pontosDoJogador[categoria] ===
                                                valor
                                                    ? 'marcado'
                                                    : pontosDoJogador[
                                                            categoria
                                                        ] !== undefined
                                                      ? 'preenchido'
                                                      : ''
                                            }
                                            colSpan={especial ? 2 : 1}
                                        >
                                            {valor}
                                        </td>
                                    ))}
                                </tr>
                                {/* Linhas espaçadoras entre os números (1–6) e as especiais */}
                                {indice === ULTIMA_NUMERICA && (
                                    <>
                                        <tr
                                            className="linha-separadora"
                                            aria-hidden="true"
                                        >
                                            <td colSpan={7} />
                                        </tr>
                                        <tr
                                            className="linha-separadora"
                                            aria-hidden="true"
                                        >
                                            <td colSpan={7} />
                                        </tr>
                                    </>
                                )}
                            </React.Fragment>
                        )
                    )}
                </tbody>
            </table>
        </div>
    );
}
