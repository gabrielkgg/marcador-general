import React from 'react';
import './../styles/FimDeJogo.scss';

export function FimDeJogo({ listaJogadores, onGameReset }) {
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
                                {jogador.vencedor ? ' \u{1F3C6}' : ' \u{1F986}'}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="flex justify-center">
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
