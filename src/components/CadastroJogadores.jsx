import React, { useEffect, useState } from 'react';
import { criarJogadores } from '../game/jogadores';
import './../styles/CadastroJogadores.scss';

// O jogo exige no mínimo 2 jogadores (não se joga sozinho).
const MIN_JOGADORES = 2;
const MAX_JOGADORES = 20;

export function CadastroJogadores({ onGameStart }) {
    const [numJogadores, setNumJogadores] = useState(2);
    const [nomes, setNomes] = useState([]);
    const [podeDiminuirJogador, setPodeDiminuirJogador] = useState(true);
    const [podeAumentarJogador, setPodeAumentarJogador] = useState(true);
    // Modo de jogo: 'classico' (soma direta) ou 'bonus' (63+ nos números rende +35)
    const [modo, setModo] = useState('classico');

    const handleNumJogadoresChange = (e) => {
        const valor = e.target.value;

        // Aceita o campo vazio ou um valor abaixo do mínimo enquanto se digita
        // (quem digita "12" passa por "1"); o mínimo é garantido no blur. Já o
        // máximo é barrado na hora, para não renderizar dezenas de campos.
        if (valor === '' || Number(valor) <= MAX_JOGADORES) {
            setNumJogadores(valor === '' ? '' : Number(valor));
        }
    };

    const handleBlur = () => {
        // Ao sair do campo, garante o mínimo. O máximo já foi barrado ao digitar.
        if (numJogadores === '' || numJogadores < MIN_JOGADORES) {
            setNumJogadores(MIN_JOGADORES);
        }
    };

    const handleMenosJogador = () => {
        // Não diminuir abaixo do mínimo de jogadores
        if (numJogadores <= MIN_JOGADORES) {
            return;
        }
        setNumJogadores(numJogadores - 1);
    };

    useEffect(() => {
        setPodeDiminuirJogador(true);
        setPodeAumentarJogador(true);
        if (numJogadores === MAX_JOGADORES) {
            setPodeAumentarJogador(false);
        }
        if (numJogadores === MIN_JOGADORES) {
            setPodeDiminuirJogador(false);
        }
    }, [numJogadores]);

    const handleMaisJogador = () => {
        // Não deixa passar do máximo de jogadores
        if (numJogadores === MAX_JOGADORES) {
            return;
        }
        setNumJogadores(numJogadores + 1);
    };

    const handleNomesJogadores = (i, valor) => {
        const novosNomes = [...nomes];
        novosNomes[i] = valor;
        setNomes(novosNomes);
    };

    const handleSalvar = () => {
        // O mínimo de jogadores já é garantido pelo campo (ver `handleBlur`),
        // então aqui só resta conferir os nomes.
        if (nomes.length < numJogadores) {
            alert('Preencha corretamente o nome de todos os jogadores');
            return;
        }

        onGameStart(criarJogadores(nomes), modo);
    };

    return (
        <div className="container holder">
            <label className="quantidade-jogadores">
                <div className="flex">
                    <button
                        className={`minus font-bold ${podeDiminuirJogador ? '' : 'desativado'}`}
                        onClick={handleMenosJogador}
                        aria-label="Menos um jogador"
                    >
                        -
                    </button>
                    <input
                        type="number"
                        value={numJogadores}
                        onChange={handleNumJogadoresChange}
                        onBlur={handleBlur}
                        inputMode="numeric"
                        className="font-bold"
                        min={MIN_JOGADORES}
                        max={MAX_JOGADORES}
                    />
                    <button
                        className={`plus font-bold ${podeAumentarJogador ? '' : 'desativado'}`}
                        onClick={handleMaisJogador}
                        aria-label="Mais um jogador"
                    >
                        +
                    </button>
                </div>
                jogadores
            </label>
            <div className="nome-jogadores">
                {Array.from({ length: numJogadores || 0 }, (_, i) => (
                    <div key={i}>
                        <label htmlFor={nomes[i] || ''}>Jogador {i + 1}</label>
                        <input
                            type="text"
                            className="font-medium"
                            placeholder={`Nome do jogador ${i + 1}`}
                            autoComplete="off"
                            name={nomes[i] || ''}
                            onChange={(e) =>
                                handleNomesJogadores(i, e.target.value)
                            }
                        />
                    </div>
                ))}
            </div>
            <div className="modo-jogo">
                <span className="modo-jogo-titulo font-medium">
                    Modo de jogo
                </span>
                <div className="flex modo-jogo-opcoes">
                    <button
                        className={`modo-jogo-botao font-regular ${
                            modo === 'classico' ? 'ativo' : ''
                        }`}
                        onClick={() => setModo('classico')}
                    >
                        Clássico
                    </button>
                    <button
                        className={`modo-jogo-botao font-regular ${
                            modo === 'bonus' ? 'ativo' : ''
                        }`}
                        onClick={() => setModo('bonus')}
                    >
                        Com bônus
                    </button>
                </div>
                {modo === 'bonus' && (
                    <span className="modo-jogo-dica font-regular">
                        63+ nos números (1–6) rende +35 pontos
                    </span>
                )}
            </div>
            <div>
                <button
                    onClick={handleSalvar}
                    className="botao-padrao font-regular"
                >
                    Iniciar partida
                </button>
            </div>
        </div>
    );
}
