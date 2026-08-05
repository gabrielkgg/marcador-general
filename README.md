# marcador-general

Aplicação para marcar pontos de **General** (também conhecido como _Yahtzee_), um jogo de dados.

O app é um **placar**: ele não rola dados nem controla as jogadas físicas. Os jogadores jogam com os dados de verdade e usam o app para registrar a pontuação de cada rodada e apontar o vencedor no fim.

Link do protótipo: https://www.figma.com/design/w2wDnNJYO2hEUXcqDhLEAc/General-%5B2024%5D

> Procurando detalhes de arquitetura, como rodar o projeto ou o que planejamos implementar? Veja [DOCUMENTATION.md](./DOCUMENTATION.md).

## Objetivo

O jogo é jogado com **5 dados** entre **2 ou mais jogadores**. Cada jogador preenche todas as categorias da tabela ao longo da partida; ao final, **quem tiver a maior pontuação total vence**. Em caso de empate, todos com a maior pontuação são considerados vencedores.

## Como jogar

1. **Cadastre os jogadores** na tela inicial (nome de cada um).
2. A partida acontece em **turnos alternados**. Na sua vez, você rola os dados de verdade e escolhe **uma** categoria para registrar.
3. Toque na célula da tabela correspondente à pontuação que você fez e confirme a jogada com o botão **Confirmar**.
4. A vez passa para o próximo jogador. Isso se repete até **todos preencherem todas as categorias**.
5. Quando a tabela de todos estiver completa, o app mostra a tela de **Fim de jogo** com o ranking e o vencedor.

Cada categoria só pode ser preenchida **uma vez por jogador**. Depois de confirmada, ela não pode mais ser alterada.

### Riscar / anular uma categoria

Se você não conseguiu (ou não quis) fazer uma combinação, pode **anular** aquela categoria marcando o valor **0**. Isso "queima" o espaço com zero pontos — útil quando não há mais como pontuar nela.

## Categorias e pontuação

A tabela tem duas partes: as **categorias numéricas** (1 a 6) e as **combinações especiais**.

### Categorias numéricas (1 a 6)

Você soma apenas os dados de um mesmo número. A pontuação é `quantidade de dados × valor do número` (de 0 a 5 dados):

| Categoria | Pontuações possíveis |
| --------- | -------------------- |
| 1         | 0, 1, 2, 3, 4, 5     |
| 2         | 0, 2, 4, 6, 8, 10    |
| 3         | 0, 3, 6, 9, 12, 15   |
| 4         | 0, 4, 8, 12, 16, 20  |
| 5         | 0, 5, 10, 15, 20, 25 |
| 6         | 0, 6, 12, 18, 24, 30 |

### Combinações especiais

| Categoria           | Combinação                                | Pontos | "De mão" |
| ------------------- | ----------------------------------------- | ------ | -------- |
| **Fula** (Full)     | Uma trinca + um par                       | 20     | 25       |
| **Seq.** (Sequência)| Cinco dados em sequência                  | 30     | 35       |
| **Quad.** (Quadra)  | Quatro dados iguais                       | 40     | 45       |
| **Gen.** (General)  | Cinco dados iguais                        | 50     | —        |
| **De Mão**          | General feito "de mão" (cinco iguais direto) | —   | 100      |

### O que significa "de mão"

Uma combinação é **"de mão"** quando os cinco dados saem prontos **já na primeira jogada, sem congelar (freeze) nem re-rolar nenhum dado**. Nesse caso ela vale o valor extra (a coluna "De mão" da tabela acima). O General "de mão" é tão valioso que tem sua própria linha, valendo **100 pontos**.

## Fim de jogo

Quando todos completam a tabela, o app exibe o ranking ordenado por pontuação, sinalizado com emojis:

- 🏆 vencedor(es)
- 🤝 empate na pontuação
- 😳 disputa apertada (diferença de até 10 pontos para o vizinho no ranking)
- 🦆 demais colocados

Na tela de fim de jogo é possível **Recomeçar partida** (mesmos jogadores, placar zerado) ou iniciar uma **Nova partida** (volta ao cadastro de jogadores).
