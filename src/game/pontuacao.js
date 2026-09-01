import { CATEGORIAS } from './tabelaPontos';

// Bônus de seção superior (modo 'bonus'): se a soma das categorias numéricas
// (1 a 6) atingir BONUS_LIMIAR, o jogador ganha BONUS_VALOR pontos.
export const BONUS_LIMIAR = 63;
export const BONUS_VALOR = 35;

const CATEGORIAS_SUPERIORES = CATEGORIAS.filter(
    ({ especial }) => !especial
).map(({ categoria }) => categoria);

// Soma das categorias numéricas (1 a 6) já marcadas.
export const somaSecaoSuperior = (pontos) =>
    CATEGORIAS_SUPERIORES.reduce(
        (soma, categoria) => soma + (pontos[categoria] || 0),
        0
    );

// O bônus não é armazenado: é derivado das categorias 1 a 6 a cada consulta,
// então acompanha automaticamente as jogadas e o "voltar jogada".
export const calcularBonus = (pontos, modo) => {
    if (modo !== 'bonus') {
        return 0;
    }
    return somaSecaoSuperior(pontos) >= BONUS_LIMIAR ? BONUS_VALOR : 0;
};

// Total exibido/ranqueado: soma das categorias + eventual bônus de seção.
export const totalComBonus = (pontos, modo) =>
    pontos.total + calcularBonus(pontos, modo);

const secaoSuperiorCompleta = (pontos) =>
    CATEGORIAS_SUPERIORES.every((categoria) => pontos[categoria] !== undefined);

// Quantos pontos ainda faltam para o bônus. Retorna null quando não se aplica:
// fora do modo bônus, quando o limiar já foi alcançado ou quando a seção
// superior fechou (não há mais como atingir o limiar).
export const faltaParaBonus = (pontos, modo) => {
    if (modo !== 'bonus') {
        return null;
    }
    const restante = BONUS_LIMIAR - somaSecaoSuperior(pontos);
    if (restante <= 0 || secaoSuperiorCompleta(pontos)) {
        return null;
    }
    return restante;
};
