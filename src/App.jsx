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

    const handleGameReset = () => {
        const reset = confirm(
            'Esta ação reiniciará o jogo completamente, prosseguir?'
        );
        if (reset) {
            setPartidaIniciada(false);
        }
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

                    <Marcador nomes={nomes} onGameReset={handleGameReset} />
                </div>
            )}
        </div>
    );
}

export default App;
