import { faltaParaBonus, totalComBonus } from './pontuacao';
import { criarPontosVazios } from './jogadores';

const pontosCom = (valores) => ({ ...criarPontosVazios(), ...valores });

describe('bônus de seção superior', () => {
    it('no modo clássico o total é a soma das categorias, mesmo com 63+ nos números', () => {
        const pontos = pontosCom({
            ones: 5,
            twos: 10,
            threes: 15,
            fours: 20,
            fives: 25,
            sixes: 30,
            total: 105,
        });

        expect(totalComBonus(pontos, 'classico')).toBe(105);
    });

    it('no modo bônus, somar 63 ou mais nos números (1 a 6) rende +35', () => {
        const pontos = pontosCom({
            ones: 3,
            twos: 6,
            threes: 9,
            fours: 12,
            fives: 15,
            sixes: 18,
            total: 63,
        });

        expect(totalComBonus(pontos, 'bonus')).toBe(63 + 35);
    });

    it('informa quanto ainda falta para o bônus enquanto o limiar não é atingido', () => {
        const pontos = pontosCom({ ones: 3, twos: 6, threes: 9, total: 18 });

        expect(faltaParaBonus(pontos, 'bonus')).toBe(63 - 18);
    });

    it('para de cobrar o bônus depois que ele é alcançado', () => {
        const pontos = pontosCom({
            ones: 5,
            twos: 10,
            threes: 15,
            fours: 20,
            fives: 25,
            total: 75,
        });

        expect(faltaParaBonus(pontos, 'bonus')).toBeNull();
    });

    it('para de cobrar o bônus quando a seção superior fecha sem atingir o limiar', () => {
        const pontos = pontosCom({
            ones: 0,
            twos: 0,
            threes: 0,
            fours: 0,
            fives: 0,
            sixes: 0,
            total: 0,
        });

        expect(faltaParaBonus(pontos, 'bonus')).toBeNull();
    });
});
