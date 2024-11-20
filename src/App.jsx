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
        <>
            <header>
                {/* TODO essa desgraça de logo não está funcionando */}
                {/* <img src="/img/logo.png" alt="Logo Marcador General" /> */}
                <h1 className="font-bold">Marcador de General</h1>
            </header>
            {!partidaIniciada ? (
                <CadastroJogadores onGameStart={handleGameStart} />
            ) : (
                <Marcador nomes={nomes} onGameReset={handleGameReset} />
            )}
        </>
    );
}

export default App;
