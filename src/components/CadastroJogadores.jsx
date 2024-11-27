import React, { useEffect, useState } from 'react';
import './../styles/CadastroJogadores.scss';

export function CadastroJogadores({ onGameStart }) {
    const [numJogadores, setNumJogadores] = useState(2);
    const [nomes, setNomes] = useState([]);
    const [podeDiminuirJogador, setPodeDiminuirJogador] = useState(true);
    const [podeAumentarJogador, setPodeAumentarJogador] = useState(true);

    const handleNumJogadoresChange = (e) => {
        let valor = parseInt(e.target.value, 10);

        // Permite valor vazio temporariamente, mas impede que seja menor que 1
        if (
            valor === '' ||
            (parseInt(valor, 10) >= 1 && parseInt(valor, 10) <= 20)
        ) {
            setNumJogadores(valor);
        }
    };

    const handleBlur = () => {
        // Se o valor for vazio ao sair do campo, redefine para 1
        if (numJogadores === '' || numJogadores < 1) {
            setNumJogadores(1);
        } else if (numJogadores > 20) {
            setNumJogadores(20);
        }
    };

    const handleMenosJogador = () => {
        // Não diminuir jogador se só tiver um
        if (numJogadores === 1) {
            return;
        }
        setNumJogadores(numJogadores - 1);
    };

    useEffect(() => {
        setPodeDiminuirJogador(true);
        setPodeAumentarJogador(true);
        if (numJogadores === 20) {
            setPodeAumentarJogador(false);
        }
        if (numJogadores === 1) {
            setPodeDiminuirJogador(false);
        }
    }, [numJogadores]);

    const handleMaisJogador = () => {
        // Não deixa passar de 20 jogadores
        if (numJogadores === 20) {
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
        if (nomes.length < numJogadores) {
            alert('Preencha corretamente o nome de todos os jogadores');
            return;
        }

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
        <div className="container holder">
            <label className="quantidade-jogadores">
                <div className="flex">
                    <button
                        className={`minus font-bold ${podeDiminuirJogador ? '' : 'desativado'}`}
                        onClick={handleMenosJogador}
                    >
                        -
                    </button>
                    <input
                        type="number"
                        value={numJogadores >= 1 ? numJogadores : 1}
                        onChange={handleNumJogadoresChange}
                        onBlur={handleBlur}
                        inputMode="numeric"
                        className="font-bold"
                        min="1"
                        max="20"
                    />
                    <button
                        className={`plus font-bold ${podeAumentarJogador ? '' : 'desativado'}`}
                        onClick={handleMaisJogador}
                    >
                        +
                    </button>
                </div>
                jogadores
            </label>
            <div className="nome-jogadores">
                {Array.from({ length: numJogadores }, (_, i) => (
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
