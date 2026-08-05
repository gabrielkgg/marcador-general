import React, { useEffect, useState } from 'react';
import { CadastroJogadores } from './components/CadastroJogadores';
import { Marcador } from './components/Marcador';
import { Splash } from './components/Splash';
import './styles/global.scss';
import logo from './assets/logo.png';
import reset from './assets/arrow-rotate-left-solid-full.svg';

const SPLASH_DURACAO_MS = 3000;
const SPLASH_FADE_MS = 300;

function App() {
    const [partidaIniciada, setPartidaIniciada] = useState(false);
    const [nomes, setNomes] = useState([]);
    const [mostrarSplash, setMostrarSplash] = useState(true);
    const [fechandoSplash, setFechandoSplash] = useState(false);

    // Splash de abertura: exibida uma única vez ao montar o app.
    // Após SPLASH_DURACAO_MS inicia o fade-out e, ao fim dele, é desmontada.
    useEffect(() => {
        const timerFade = setTimeout(() => {
            setFechandoSplash(true);
        }, SPLASH_DURACAO_MS);

        const timerRemover = setTimeout(() => {
            setMostrarSplash(false);
        }, SPLASH_DURACAO_MS + SPLASH_FADE_MS);

        return () => {
            clearTimeout(timerFade);
            clearTimeout(timerRemover);
        };
    }, []);

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
            {mostrarSplash && <Splash fechando={fechandoSplash} />}
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
