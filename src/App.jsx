import React, { useState } from 'react';
import { CadastroJogadores } from './components/CadastroJogadores';
import { Marcador } from './components/Marcador';
import './styles/App.scss';

function App() {
    const [partidaIniciada, setPartidaIniciada] = useState(false);
    const [nomes, setNomes] = useState([]);

    const handleGameStart = (nomes) => {
        setPartidaIniciada(true);
        setNomes(nomes);
    };

    const handleGameReset = () => {
        const reset = confirm('Esta ação reiniciará o jogo, prosseguir?');
        if (reset) {
            setPartidaIniciada(false);
        }
    };

    return (
        <div className="container">
            <h1>Marcador de General</h1>
            {!partidaIniciada ? (
                <CadastroJogadores onGameStart={handleGameStart} />
            ) : (
                <div>
                    <Marcador nomes={nomes} onGameReset={handleGameReset} />
                </div>
            )}
        </div>
    );
}

export default App;
