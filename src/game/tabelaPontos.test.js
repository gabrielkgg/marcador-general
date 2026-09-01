import { CATEGORIAS, pontosPossiveis } from './tabelaPontos';

describe('tabela de pontos', () => {
    it('oferece, nas categorias numéricas, um valor por quantidade de dados (0 a 5)', () => {
        expect(pontosPossiveis('threes')).toEqual([0, 3, 6, 9, 12, 15]);
    });

    it('oferece nas combinações especiais o valor normal e o valor "de mão"', () => {
        expect(pontosPossiveis('fullHouse')).toEqual([0, 20, 25]);
        expect(pontosPossiveis('straight')).toEqual([0, 30, 35]);
        expect(pontosPossiveis('quadra')).toEqual([0, 40, 45]);
    });

    it('separa o General (50) do General de mão, que tem linha própria valendo 100', () => {
        expect(pontosPossiveis('general')).toEqual([0, 50]);
        expect(pontosPossiveis('generalDeMao')).toEqual([0, 100]);
    });

    it('lista as categorias na ordem da tabela, marcando quais são especiais', () => {
        expect(CATEGORIAS.map((item) => item.categoria)).toEqual([
            'ones',
            'twos',
            'threes',
            'fours',
            'fives',
            'sixes',
            'fullHouse',
            'straight',
            'quadra',
            'general',
            'generalDeMao',
        ]);
        expect(
            CATEGORIAS.filter((item) => item.especial).map(
                (item) => item.categoria
            )
        ).toEqual([
            'fullHouse',
            'straight',
            'quadra',
            'general',
            'generalDeMao',
        ]);
    });
});
