import React, { useState } from 'react';

export function CadastroJogadores({ onGameStart }) {
    const [numJogadores, setNumJogadores] = useState(2);
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
        const jogadores = nomes.map((nome) => ({
            nome,
            pontos: {
                ones: undefined,
                twos: 0,
                total: 0,
            },
        }));
        onGameStart(jogadores);
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
