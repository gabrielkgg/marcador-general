import React from 'react';
import './../styles/FimDeJogo.scss';

export function FimDeJogo({ listaJogadores, onGameReset, onRecomecarPartida }) {
    // `listaJogadores` chega ordenada do maior para o menor.
    const getEmoji = (jogador, index) => {
        const vizinhos = [
            listaJogadores[index - 1],
            listaJogadores[index + 1],
        ].filter(Boolean);

        if (vizinhos.some((vizinho) => vizinho.pontos === jogador.pontos)) {
            return ' \u{1F91D}'; // Aperto de mão para empates
        }

        if (jogador.vencedor) {
            return ' \u{1F3C6}'; // Troféu para o vencedor
        }

        // Disputa apertada: algum vizinho no ranking a 10 pontos ou menos.
        const disputaApertada = vizinhos.some(
            (vizinho) => Math.abs(vizinho.pontos - jogador.pontos) <= 10
        );

        return disputaApertada
            ? ' \u{1F633}' // Cara com olhos arregalados
            : ' \u{1F986}'; // Pato para os demais
    };

    return (
        <div className="container">
            <div className="holder fim-de-jogo-holder font-bold">
                <h2>Fim de jogo</h2>
                {listaJogadores.map((jogador, index) => {
                    return (
                        <div key={index} className="fim-de-jogo-list-item">
                            <div>
                                <div className="fim-de-jogo-nome">
                                    {jogador.nome}
                                </div>
                                <div className="fim-de-jogo-pontos font-regular">
                                    {jogador.pontos} pontos
                                    {jogador.bonus && (
                                        <span className="fim-de-jogo-bonus">
                                            {' '}
                                            (inclui bônus +35)
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="fim-de-jogo-icone">
                                {getEmoji(jogador, index)}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="flex justify-center" style={{ gap: '1em' }}>
                <button
                    onClick={onRecomecarPartida}
                    className="botao-padrao font-regular"
                >
                    Recomeçar partida
                </button>
                <button
                    onClick={onGameReset}
                    className="botao-padrao font-regular"
                >
                    Nova partida
                </button>
            </div>
        </div>
    );
}
