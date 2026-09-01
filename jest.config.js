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
    collectCoverageFrom: ['src/**/*.{js,jsx}', '!src/**/*.test.{js,jsx}'],
    // A suíte cobre o projeto inteiro: qualquer linha nova precisa vir com teste.
    coverageThreshold: {
        global: {
            statements: 100,
            branches: 100,
            functions: 100,
            lines: 100,
        },
    },
};
