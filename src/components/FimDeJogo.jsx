import React from 'react';

export function FimDeJogo({ listaJogadores, onGameReset }) {
    return (
        <div>
            Fim de jogo:
            <ul>
                {listaJogadores.map((jogador, index) => {
                    return (
                        <li key={index}>
                            {jogador.nome} - {jogador.pontos}
                            {jogador.vencedor ? ' \u{1F3C6}' : ' \u{1F986}'}
                        </li>
                    );
                })}
            </ul>
            <button onClick={onGameReset}>Reiniciar partida</button>
        </div>
    );
}
