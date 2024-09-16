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
                twos: undefined,
                threes: undefined,
                fours: undefined,
                fives: undefined,
                sixes: undefined,
                fullHouse: undefined,
                straight: undefined,
                quadra: undefined,
                general: undefined,
                generalDeMao: undefined,
                total: 0,
            },
        }));
        onGameStart(jogadores);
    };

    return (
        <div className="container">
            <label>
                Número de jogadores:
                <input
                    value={numJogadores}
                    onChange={handleNumJogadoresChange}
                    inputMode="numeric"
                />
            </label>
            {Array.from({ length: numJogadores }, (_, i) => (
                <input
                    key={i}
                    type="text"
                    placeholder={`Nome do jogador ${i + 1}`}
                    autoComplete="off"
                    name={nomes[i] || ''}
                    onChange={(e) => handleNomesJogadores(i, e.target.value)}
                />
            ))}
            <button onClick={handleSalvar}>Iniciar partida</button>
        </div>
    );
}
