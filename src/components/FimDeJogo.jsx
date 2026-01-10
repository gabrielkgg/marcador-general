import React from 'react';
import './../styles/FimDeJogo.scss';

export function FimDeJogo({ listaJogadores, onGameReset, onRecomecarPartida }) {
    const getEmoji = (jogador, index) => {
        // Verifica se há empate (mesma pontuação que anterior ou próximo)
        const temEmpateAnterior =
            index > 0 && listaJogadores[index - 1].pontos === jogador.pontos;
        const temEmpateProximo =
            index < listaJogadores.length - 1 &&
            listaJogadores[index + 1].pontos === jogador.pontos;

        if (temEmpateAnterior || temEmpateProximo) {
            return ' \u{1F91D}'; // Handshake para empates
        }

        if (jogador.vencedor) {
            return ' \u{1F3C6}'; // Troféu para o vencedor
        }

        // Verifica se o próximo colocado está muito próximo (diferença de 10 pontos ou menos)
        if (index < listaJogadores.length - 1) {
            const proximoJogador = listaJogadores[index + 1];
            const diferencaPontos = jogador.pontos - proximoJogador.pontos;

            if (diferencaPontos >= 0 && diferencaPontos <= 10) {
                return ' \u{1F633}'; // Cara com olhos arregalados quando próximo está muito perto
            }
        }

        // Verifica se o jogador anterior está muito próximo (diferença de 10 pontos ou menos)
        if (index > 0) {
            const jogadorAnterior = listaJogadores[index - 1];
            const diferencaPontos = jogadorAnterior.pontos - jogador.pontos;

            if (diferencaPontos >= 0 && diferencaPontos <= 10) {
                return ' \u{1F633}'; // Cara com olhos arregalados quando anterior está muito perto
            }
        }

        return ' \u{1F986}'; // Pato para os demais
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
