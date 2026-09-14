/**
 * @jest-environment node
 */
const path = require('path');
const { execFileSync } = require('child_process');
const webpackConfig = require('../webpack.config');

const raiz = path.resolve(__dirname, '..');

// Resolve a config do jeito que o webpack-cli faz: chamando (env, argv).
function configPara(mode) {
    return webpackConfig({}, { mode });
}

function opcoesDoBabelLoader(config) {
    const regra = config.module.rules.find(
        (r) => r.use && r.use.loader === 'babel-loader'
    );
    return regra.use.options || {};
}

// Transpila um JSX com as mesmas opções que o babel-loader receberia. Roda num
// processo Node à parte porque o Babel 8 é só ESM e porque o `npm run build`
// roda sem NODE_ENV/BABEL_ENV (o Jest define NODE_ENV=test, o que esconderia o
// problema).
function transpilaJsx(mode) {
    const opcoes = {
        ...opcoesDoBabelLoader(configPara(mode)),
        filename: path.join(raiz, 'src', 'Exemplo.jsx'),
        cwd: raiz,
    };
    const script = `
        import { transformSync } from '@babel/core';
        const opcoes = JSON.parse(process.env.OPCOES_BABEL);
        process.stdout.write(transformSync('const el = <div />;', opcoes).code);
    `;
    const { NODE_ENV, BABEL_ENV, ...env } = process.env;

    return execFileSync(
        process.execPath,
        ['--input-type=module', '-e', script],
        { cwd: raiz, env: { ...env, OPCOES_BABEL: JSON.stringify(opcoes) } }
    ).toString();
}

describe('webpack.config', () => {
    it('não usa o jsx-dev-runtime no build de produção', () => {
        const codigo = transpilaJsx('production');

        expect(codigo).toContain('react/jsx-runtime');
        expect(codigo).not.toContain('jsxDEV');
    });

    it('usa o jsx-dev-runtime no desenvolvimento', () => {
        expect(configPara(undefined).mode).toBe('development');
        expect(transpilaJsx(undefined)).toContain('react/jsx-dev-runtime');
    });

    it('usa o modo passado na linha de comando', () => {
        expect(configPara('production').mode).toBe('production');
    });
});
