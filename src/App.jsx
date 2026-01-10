import React, { useState } from 'react';
import { CadastroJogadores } from './components/CadastroJogadores';
import { Marcador } from './components/Marcador';
import './styles/App.scss';
import logo from './assets/logo.png';
import reset from './assets/arrow-rotate-left-solid-full.svg';

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
                <div className="header-holder">
                    {partidaIniciada ? (
                        <img
                            onClick={handleGameReset}
                            src={reset}
                            className="reset"
                        />
                    ) : (
                        <div></div>
                    )}
                    <img
                        src={logo}
                        alt="Logo Marcador General"
                        className="logo"
                    />
                    <div></div>
                </div>
                {!partidaIniciada ? (
                    <h1 className="font-bold">Marcador de General</h1>
                ) : (
                    ''
                )}
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
