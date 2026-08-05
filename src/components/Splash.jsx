import React from 'react';
import './../styles/Splash.scss';
import logo from './../assets/logo.png';

export function Splash({ fechando }) {
    return (
        <div className={`splash ${fechando ? 'splash-fechando' : ''}`}>
            <img
                src={logo}
                alt="Logo Marcador General"
                className="splash-logo"
            />
            <div className="splash-spinner" aria-label="Carregando" />
        </div>
    );
}
