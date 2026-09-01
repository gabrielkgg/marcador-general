module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
    moduleNameMapper: {
        // SCSS importado pelos componentes: vira um proxy de classes.
        '\\.(css|scss)$': 'identity-obj-proxy',
        // Imagens/ícones: viram uma string, como o asset/resource faz no webpack.
        '\\.(png|jpe?g|gif|svg|ico)$': '<rootDir>/test/mockArquivo.js',
    },
    testMatch: ['<rootDir>/src/**/*.test.{js,jsx}'],
    collectCoverageFrom: ['src/**/*.{js,jsx}', '!src/index.js'],
};
