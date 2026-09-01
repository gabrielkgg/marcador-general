# Documentação técnica — marcador-general

Documentação voltada para desenvolvimento: arquitetura, fluxo de estado, como rodar o
projeto e o que planejamos implementar. Para as **regras do jogo** e o "como jogar",
veja o [README.md](./README.md).

## Stack

- **React 19** (componentes funcionais + hooks) — sem gerenciador de estado externo.
- **Webpack 5** + **Babel** (`@babel/preset-env`, `@babel/preset-react`) como bundler/transpiler.
- **Sass (SCSS)** para estilos, carregado via `style-loader` → `css-loader` → `sass-loader`.
- **Capacitor 8** para empacotar o app web como app nativo (Android/iOS).
- **Jest 30** + **React Testing Library** para os testes (ambiente jsdom).
- **Prettier** para formatação.

O projeto roda em **Node 24** (`engines` no `package.json` e `.nvmrc`).

Não há backend nem persistência: todo o estado vive em memória enquanto a partida acontece.

## Como rodar

```bash
npm install        # instala dependências
npm start          # sobe o webpack-dev-server e abre no navegador
npm run build      # build de produção em dist/
npm test           # roda a suíte de testes (Jest)
npm run test:watch # roda os testes em watch
npm run test:coverage # roda os testes com relatório de cobertura
npm run format     # roda o Prettier
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
  game/                  # regras puras, sem React (o que os testes cobrem 100%)
    tabelaPontos.js        # categorias, legendas e valores possíveis de cada uma
    jogadores.js           # criação de jogadores, marcar/desmarcar pontos
    pontuacao.js           # bônus de seção superior, total, quanto falta
    ranking.js             # fim de partida, ordenação e vencedores
  styles/                # global.scss (base/utilitárias, importado 1x em App.jsx) +
                         # SCSS por componente + parciais (_variaveis, _fontes, _botoes...)
  assets/                # logo, ícones (svg), favicon
test/
  setup.js               # carrega os matchers do @testing-library/jest-dom
  mockArquivo.js         # stub para imports de imagem/ícone nos testes
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

- Controla `numJogadores` (2–20, default 2) e `nomes[]`.
- Botões `+`/`-` e input numérico ajustam a quantidade; `useEffect` liga/desliga os
  botões nos limites (2 e 20).
- Enquanto se digita, o campo aceita valor vazio ou abaixo do mínimo (quem digita
  "12" passa por "1"); `handleBlur` devolve o mínimo ao sair do campo. O máximo é
  barrado na hora, para não renderizar dezenas de campos de nome.
- `handleSalvar()` monta os jogadores com `criarJogadores` e chama
  `onGameStart(jogadores, modo)`.
- **Modo de jogo**: estado `modo` (`'classico'` default | `'bonus'`), escolhido num toggle
  de dois botões acima de "Iniciar partida". No modo `'bonus'`, atingir 63+ nas categorias
  numéricas (1 a 6) rende +35 pontos.

**Formato do jogador** (a "fonte da verdade" do placar), montado por
`criarJogadores` em `src/game/jogadores.js`:

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
marcada. `total` acumula a soma **das categorias** (sem o bônus).

> **Bônus de seção superior:** no modo `'bonus'`, o bônus é **derivado** das categorias
> 1–6 (`calcularBonus`/`totalComBonus`, em `src/game/pontuacao.js`) em vez de ser guardado
> em `pontos`. Assim ele acompanha automaticamente as jogadas e o "voltar jogada", e o
> total exibido/ranqueado é `total + bônus`. Constantes: `BONUS_LIMIAR = 63`,
> `BONUS_VALOR = 35`.

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
     desfaz a marcação anterior antes de aplicar a nova, permitindo **trocar de escolha**
     antes de confirmar.
   - Grava o valor, soma no `total` e guarda em `voltarJogada`.
2. **`proximoJogador()`** (botão **Confirmar**):
   - Só age se `marcouPonto` for `true`.
   - Empurra a jogada para `historicoJogadas`.
   - Reseta `marcouPonto`, avança `jogadorAtual` de forma circular (`% jogadores.length`)
     e chama `fimDoJogo()`.
3. **`voltarJogadaHandler()`** (botão **voltar**), nesta ordem:
   - Se o jogador da vez tem uma marcação **ainda não confirmada**, desfaz só ela e a vez
     continua dele. Isso vem primeiro porque essa marcação não está no histórico: se o
     botão fosse direto ao histórico, a célula ficaria travada para sempre (era o caso da
     primeira rodada, com o histórico vazio).
   - Caso contrário, desempilha a última jogada confirmada de `historicoJogadas`, zera
     aquela categoria, subtrai do `total` e devolve a vez ao jogador que a fez.
4. **`fimDoJogo()`**: delega para `src/game/ranking.js`.
   - `partidaTerminada` verifica se **todas** as categorias de **todos** os jogadores
     estão preenchidas.
   - Se sim, `calcularRanking` ordena por total (já com bônus) desc e marca `vencedor`
     para quem tem a maior pontuação (permite múltiplos vencedores em empate); o
     `Marcador` só liga `gameOver`.

> ⚠️ **Nota de implementação:** `marcouPonto` distingue a jogada **em andamento** (ainda
> trocável antes de confirmar) da jogada **confirmada** (que vai para o `historicoJogadas`).
> São dois estados diferentes de "desfazer", e o botão **voltar** atende aos dois: primeiro
> a marcação pendente, depois o histórico. Marcar e desmarcar passam por `marcarPonto` /
> `desmarcarPonto` (`src/game/jogadores.js`), que devolvem uma nova lista em vez de mutar
> os jogadores.

### `Tabela.jsx`

- Renderiza `CATEGORIAS` (`src/game/tabelaPontos.js`), a definição das categorias e suas
  pontuações possíveis. A `Tabela` não conhece as regras: só desenha o que vem de lá.
- Cada célula chama `setPonto(jogadorAtual, valor, categoria)` no clique.
- Classes CSS: `marcado` (célula escolhida na rodada), `preenchido` (categoria já fechada
  com outro valor). As linhas especiais usam `colSpan={2}`.

### `FimDeJogo.jsx`

- Recebe o ranking já ordenado e decide o emoji de cada colocado (`getEmoji`):
  troféu (vencedor), aperto de mão (empate), olhos arregalados (diferença ≤ 10 pts) e
  pato (demais).
- Botões: `Recomeçar partida` (`onRecomecarPartida` → mantém jogadores, zera placar) e
  `Nova partida` (`onGameReset` → volta ao cadastro).

## Testes

Runner: **Jest** com ambiente `jsdom` (config em `jest.config.js`), transpilando via
`babel-jest` e o `.babelrc` do projeto. Os componentes são exercitados com **React
Testing Library** e `user-event`; SCSS e imagens são mapeados para stubs em `test/`.

Os testes ficam ao lado do código, como `*.test.js` / `*.test.jsx`:

| Arquivo                              | O que cobre                                                     |
| ------------------------------------ | --------------------------------------------------------------- |
| `game/tabelaPontos.test.js`          | valores de cada categoria: numéricas, especiais e "de mão"       |
| `game/jogadores.test.js`             | placar inicial (categorias vazias, total zerado)                  |
| `game/pontuacao.test.js`             | bônus de seção superior, total com bônus, quanto falta            |
| `game/ranking.test.js`               | fim de partida, ordenação, empates e bônus no ranking             |
| `components/Marcador.test.jsx`       | fluxo de jogada: marcar, trocar, confirmar, voltar, fim de jogo   |
| `components/FimDeJogo.test.jsx`      | emojis do ranking e botões de recomeçar/nova partida              |
| `components/CadastroJogadores.test.jsx` | validação de nomes, escolha de modo e quantidade de jogadores  |
| `App.test.jsx`                       | splash, troca cadastro ↔ partida e confirmação do reset          |
| `index.test.jsx`                     | montagem do app no `#root`                                       |

A suíte cobre **100%** de `src/` (statements, branches, funções e linhas), e o
`jest.config.js` tem `coverageThreshold` em 100: `npm run test:coverage` falha se algo
novo entrar sem teste.

> Ao mexer nas regras, prefira escrever o teste primeiro (red) e só depois a
> implementação (green): foi assim que `src/game/` nasceu, extraído do `Marcador`.

## Roadmap / implementações futuras

_(itens migrados dos antigos TODOs do README + decisões recentes)_

- [x] **Testes unitários para validar as pontuações**: feito. Jest + React Testing Library
      configurados, as regras extraídas para `src/game/` e 100% de cobertura em `src/`
      (ver a seção [Testes](#testes)).
- [ ] **Publicar nas lojas** (App Store e Play Store) via Capacitor.
- [ ] **Domínio próprio `marcadorgeneral.com.br`**: domínio registrado no registro.br
      (pagamento pendente). Assim que for pago/liberado, adicionar o domínio no projeto
      da Vercel e apontar o DNS para lá (nameservers da Vercel ou registros A/CNAME que
      ela indicar) no painel do registro.br.
- [ ] **Espaço para ads**
      ([#7](https://github.com/gabrielkgg/marcador-general/issues/7)): reservar um espaço
      de anúncios no layout. A issue ainda não tem detalhes; falta definir onde (ex.: rodapé
      da partida, tela de fim de jogo), qual rede e como isso se comporta no app empacotado
      pelo Capacitor.
- [ ] **Favicon não chega no build**: o arquivo existe (`src/assets/favicon.ico`) e o
      `index.html` referencia `./assets/favicon.ico`, mas o webpack não copia o `.ico` para
      `dist/`, então o app publicado fica sem ícone (404 no caminho). Resolver com a opção
      `favicon` do `HtmlWebpackPlugin` ou com `copy-webpack-plugin`, e aproveitar para
      revisar o ícone em si (PNGs em vários tamanhos, `apple-touch-icon`).

## Bugs conhecidos / limitações

- **Validação de nomes frágil**: `handleSalvar` só checa `nomes.length`, não campos vazios
  entre jogadores; é possível iniciar com nomes em branco em certas situações. Ex.: com 3
  jogadores, preencher só o 1º e o 3º passa na validação.
- **Estado apenas em memória** — recarregar a página perde a partida em andamento (sem
  persistência).
