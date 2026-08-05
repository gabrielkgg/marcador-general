# Documentação técnica — marcador-general

Documentação voltada para desenvolvimento: arquitetura, fluxo de estado, como rodar o
projeto e o que planejamos implementar. Para as **regras do jogo** e o "como jogar",
veja o [README.md](./README.md).

## Stack

- **React 18** (componentes funcionais + hooks) — sem gerenciador de estado externo.
- **Webpack 5** + **Babel** (`@babel/preset-env`, `@babel/preset-react`) como bundler/transpiler.
- **Sass (SCSS)** para estilos, carregado via `style-loader` → `css-loader` → `sass-loader`.
- **Capacitor 6** para empacotar o app web como app nativo (Android/iOS).
- **Prettier** para formatação.

Não há backend nem persistência: todo o estado vive em memória enquanto a partida acontece.

## Como rodar

```bash
npm install        # instala dependências
npm start          # sobe o webpack-dev-server e abre no navegador
npm run build      # build de produção em dist/
npm run format     # roda o Prettier em src/**
```

O build gera `dist/`, que é o `webDir` consumido pelo Capacitor (ver `capacitor.config.ts`)
para empacotar as versões mobile.

## Estrutura de pastas

```
src/
  index.js               # ponto de entrada; monta <App /> no DOM
  index.html             # template do HtmlWebpackPlugin
  App.jsx                # raiz: alterna entre cadastro e partida; header + reset
  components/
    Splash.jsx             # tela de abertura (logo + spinner) exibida 1x ao abrir
    CadastroJogadores.jsx  # tela inicial: nº de jogadores + nomes
    Marcador.jsx           # coração do jogo: estado da partida, turnos, histórico
    Tabela.jsx             # grade de categorias × pontuações clicáveis
    FimDeJogo.jsx          # ranking final, emojis, recomeçar/nova partida
  styles/                # global.scss (base/utilitárias, importado 1x em App.jsx) +
                         # SCSS por componente + parciais (_variaveis, _fontes, _botoes...)
  assets/                # logo, ícones (svg), favicon
```

## Arquitetura e fluxo de estado

O app tem essencialmente **dois modos**, controlados por `App.jsx` via `partidaIniciada`:

1. **Cadastro** (`CadastroJogadores`) → quando `partidaIniciada === false`.
2. **Partida** (`Marcador`) → quando `partidaIniciada === true`.

### `App.jsx`

- `partidaIniciada` (bool) e `nomes` (array de jogadores).
- **Splash de abertura**: `mostrarSplash`/`fechandoSplash` controlam a `<Splash />`,
  exibida como overlay uma única vez ao montar o app. Um `useEffect` com dois `setTimeout`
  dispara o fade-out após `SPLASH_DURACAO_MS` (3s) e desmonta a splash após o fade
  (`SPLASH_FADE_MS`, 300ms). Os timers são limpos no cleanup.
- `handleGameStart(jogadores)`: recebe a lista pronta do cadastro e entra na partida.
- `handleGameReset()`: confirma via `confirm()` e volta ao cadastro (**nova partida**).

### `CadastroJogadores.jsx`

- Controla `numJogadores` (1–20, default 2) e `nomes[]`.
- Botões `+`/`-` e input numérico ajustam a quantidade; `useEffect` liga/desliga os
  botões nos limites (1 e 20).
- `handleSalvar()` monta o array de jogadores no formato canônico e chama `onGameStart`.

**Formato do jogador** (a "fonte da verdade" do placar):

```js
{
  nome: 'Fulano',
  pontos: {
    ones, twos, threes, fours, fives, sixes,   // categorias numéricas
    fullHouse, straight, quadra, general, generalDeMao, // especiais
    total: 0,
  }
}
```

Cada categoria começa `undefined` (= ainda não preenchida) e recebe um número ao ser
marcada. `total` acumula a soma.

### `Marcador.jsx` (núcleo)

Estado principal:

| Estado             | Papel                                                              |
| ------------------ | ----------------------------------------------------------------- |
| `jogadores`        | array de jogadores com seus `pontos` (fonte da verdade do placar) |
| `jogadorAtual`     | índice do jogador da vez                                           |
| `marcouPonto`      | se o jogador já escolheu uma célula na rodada atual               |
| `gameOver`         | dispara a tela de fim de jogo                                     |
| `listaNomes`       | ranking final calculado                                           |
| `voltarJogada`     | última célula marcada `{ jogadorAtual, obj, pontos }` (para troca)|
| `historicoJogadas` | pilha de jogadas **confirmadas** (para o "voltar jogada")         |

Fluxo de uma jogada:

1. **`setPonto(jogadorAtual, pontos, obj)`** (disparado pelo clique numa célula da `Tabela`):
   - Ignora se a categoria já tem valor (não deixa sobrescrever categoria preenchida).
   - Se o jogador já havia marcado outra célula **nesta mesma rodada** (`marcouPonto`),
     desfaz a marcação anterior antes de aplicar a nova — permitindo **trocar de escolha**
     antes de confirmar.
   - Grava o valor, soma no `total` e guarda em `voltarJogada`.
2. **`proximoJogador()`** (botão **Confirmar**):
   - Só age se `marcouPonto` for `true`.
   - Empurra a jogada para `historicoJogadas`.
   - Reseta `marcouPonto`, avança `jogadorAtual` de forma circular (`% jogadores.length`)
     e chama `fimDoJogo()`.
3. **`voltarJogadaHandler()`** (botão **voltar**):
   - Desempilha a última jogada confirmada de `historicoJogadas`, zera aquela categoria,
     subtrai do `total` e devolve a vez ao jogador que a fez.
4. **`fimDoJogo()`**:
   - Verifica se **todas** as categorias de **todos** os jogadores estão preenchidas.
   - Se sim, ordena por `total` desc, marca `vencedor` para quem tem a maior pontuação
     (permite múltiplos vencedores em empate) e liga `gameOver`.

> ⚠️ **Nota de implementação:** `marcouPonto` distingue a jogada **em andamento** (ainda
> trocável antes de confirmar) da jogada **confirmada** (que vai para o `historicoJogadas`).
> São dois mecanismos de "desfazer" diferentes: trocar a célula antes de confirmar vs.
> voltar uma jogada já confirmada.

### `Tabela.jsx`

- Renderiza `arrayPontos`, a definição estática das categorias e suas pontuações possíveis.
- Cada célula chama `setPonto(jogadorAtual, valor, nomePropriedade)` no clique.
- Classes CSS: `marcado` (célula escolhida na rodada), `preenchido` (categoria já fechada
  com outro valor). As linhas especiais usam `colSpan={2}`.

### `FimDeJogo.jsx`

- Recebe o ranking já ordenado e decide o emoji de cada colocado (`getEmoji`):
  troféu (vencedor), aperto de mão (empate), olhos arregalados (diferença ≤ 10 pts) e
  pato (demais).
- Botões: `Recomeçar partida` (`onRecomecarPartida` → mantém jogadores, zera placar) e
  `Nova partida` (`onGameReset` → volta ao cadastro).

## Roadmap / implementações futuras

_(itens migrados dos antigos TODOs do README + decisões recentes)_

- [ ] **Modo de jogo selecionável no início da partida:**
      - _Clássico_ (comportamento atual: total é a soma direta das categorias).
      - _Com bônus de seção superior_: se a soma das categorias numéricas (1 a 6) atingir
        **63 ou mais**, o jogador ganha **+35 pontos** de bônus (regra do Yahtzee clássico).
      A escolha do modo deve ser feita na tela de cadastro, antes de iniciar.
- [ ] **Testes unitários para validar as pontuações** — cobrir o cálculo de pontos das
      categorias numéricas e especiais, a soma do `total`, o "de mão" (valores extras) e a
      lógica de fim de jogo/ranking (incluindo empates). Não há suíte de testes hoje;
      será preciso escolher e configurar um runner (ex.: Jest + React Testing Library).
- [ ] **Publicar nas lojas** (App Store e Play Store) via Capacitor.

## Bugs conhecidos / limitações

- **Sem bônus de seção superior** — o total é sempre a soma direta (ver roadmap para o
  modo selecionável).
- **Cadastro permite 1 jogador** — o mínimo do seletor é 1, mas o jogo pressupõe 2+.
- **Validação de nomes frágil** — `handleSalvar` só checa `nomes.length`, não campos vazios
  entre jogadores; é possível iniciar com nomes em branco em certas situações.
- **Estado apenas em memória** — recarregar a página perde a partida em andamento (sem
  persistência).
