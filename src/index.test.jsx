import { act, screen } from '@testing-library/react';

describe('ponto de entrada', () => {
    it('monta o app dentro do #root', async () => {
        document.body.innerHTML = '<div id="root"></div>';

        await act(async () => {
            await import('./index');
        });

        expect(screen.getByLabelText('Carregando')).toBeInTheDocument();
    });
});
