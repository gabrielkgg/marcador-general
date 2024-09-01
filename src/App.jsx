import React, { useState } from 'react';
import { CadastroJogadores } from './components/CadastroJogadores';
import { Marcador } from './components/Marcador';

function App() {
    const [partidaIniciada, setPartidaIniciada] = useState(false);
    const [nomes, setNomes] = useState([]);

    const handleGameStart = (nomes) => {
        setPartidaIniciada(true);
        setNomes(nomes);
    };

    return (
        <div>
            <h1>Marcador de General</h1>
            {!partidaIniciada ? (
                <CadastroJogadores onGameStart={handleGameStart} />
            ) : (
                <div>
                    {/* Jogadores
                    <ul>
                        {nomes.map((nome, i) => {
                            return <li key={i}>{nome}</li>;
                        })}
                    </ul> */}

                    <Marcador nomes={nomes} />
                </div>
            )}
        </div>
    );
}

export default App;
