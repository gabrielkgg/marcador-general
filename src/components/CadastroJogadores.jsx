import React, { useState } from 'react';

export function CadastroJogadores({ onGameStart }) {
    const [numJogadores, setNumJogadores] = useState(0);
    const [nomes, setNomes] = useState([]);

    const handleNumJogadoresChange = (e) => {
        setNumJogadores(Number(e.target.value));
    };

    const handleNomesJogadores = (i, valor) => {
        const novosNomes = [...nomes];
        novosNomes[i] = valor;
        setNomes(novosNomes);
    };

    const handleSalvar = () => {
        onGameStart(nomes);
    };

    return (
        <div>
            Insira o número de jogadores:
            <input
                type="number"
                value={numJogadores}
                onChange={handleNumJogadoresChange}
                min="1"
                max="10"
            />
            <div>
                {Array.from({ length: numJogadores }, (_, i) => (
                    <input
                        key={i}
                        type="text"
                        placeholder={`Nome do jogador ${i + 1}`}
                        autoComplete="off"
                        name={nomes[i] || ''}
                        onChange={(e) =>
                            handleNomesJogadores(i, e.target.value)
                        }
                    />
                ))}

                <button onClick={handleSalvar}>Iniciar partida</button>
            </div>
        </div>
    );
}
