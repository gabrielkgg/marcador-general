import React, { useState } from 'react';

export function Marcador({ nomes }) {
    const [jogadorAtual, setJogadorAtual] = useState(0);
    const proximoJogador = () => {
        setJogadorAtual((jogadorAtual + 1) % nomes.length);
    };

    return (
        <div>
            {nomes[jogadorAtual]}
            <button onClick={proximoJogador}>Finalizar jogada</button>
        </div>
    );
}
