import React, { useState } from 'react';

export function Marcador({ nomes, onGameReset }) {
    const [jogadorAtual, setJogadorAtual] = useState(0);
    const proximoJogador = () => {
        setJogadorAtual((jogadorAtual + 1) % nomes.length);
    };

    return (
        <div>
            <p>Vez de {nomes[jogadorAtual].nome}</p>
            <p>Total pontos: {nomes[jogadorAtual].pontos}</p>
            <button onClick={proximoJogador}>Finalizar jogada</button>
            <button onClick={onGameReset}>Reiniciar partida</button>
        </div>
    );
}
