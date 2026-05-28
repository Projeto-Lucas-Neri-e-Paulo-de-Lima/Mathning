import type { ConceptProblem } from "../types.js";

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function choice(
  prompt: string,
  options: string[],
  correctIndex: number,
  explanation: string,
  minTier: 1 | 2 | 3 = 1,
): ConceptProblem {
  return { kind: "choice", prompt, options, correctIndex, explanation, minTier };
}

function numeric(
  prompt: string,
  answer: number,
  explanation: string,
  minTier: 1 | 2 | 3 = 1,
): ConceptProblem {
  return { kind: "numeric", prompt, answer, explanation, minTier };
}

const POOLS: Record<string, ConceptProblem[]> = {
  "number-system": [
    choice(
      "Qual conjunto inclui números negativos como −5?",
      ["Naturais (ℕ)", "Inteiros (ℤ)", "Apenas frações"],
      1,
      "Inteiros incluem negativos, zero e positivos.",
    ),
    choice(
      "0,5 é um exemplo de número…",
      ["Irracional", "Racional", "Natural"],
      1,
      "0,5 = 1/2, portanto é racional.",
    ),
    numeric(
      "Na reta numérica, qual é maior: −2 ou −7? (responda com o maior)",
      -2,
      "−2 fica à direita de −7, então −2 é maior.",
    ),
    choice(
      "Todo número natural é também inteiro?",
      ["Sim", "Não", "Só se for par"],
      0,
      "Na escola, costumamos ver ℕ ⊂ ℤ.",
      2,
    ),
    numeric("Qual é o resultado de −4 + 7?", 3, "Na reta, somar 7 a −4 leva a 3."),
  ],
  "reading-writing": [
    choice(
      "No número 4.028, o algarismo 2 vale…",
      ["2 unidades", "20 unidades", "200 unidades"],
      1,
      "O 2 está na casa das dezenas: vale 20.",
    ),
    choice(
      "Como se lê 4.028 em português (Brasil)?",
      ["Quatro mil e vinte e oito", "Quatrocentos e vinte e oito", "Quarenta e vinte e oito"],
      0,
      "4 mil + 28 = quatro mil e vinte e oito.",
    ),
    numeric("Quantas centenas há em 3.500?", 35, "3.500 = 35 × 100, logo 35 centenas."),
    choice(
      "No Brasil, qual símbolo separa a parte decimal?",
      ["Vírgula", "Ponto", "Barra"],
      0,
      "Ex.: 3,14 usa vírgula para os décimos.",
      2,
    ),
    numeric("Quantos milhares há em 12.000?", 12, "12.000 = 12 × 1.000, logo 12 milhares."),
  ],
  "place-value": [
    choice(
      "No número 353, o 3 da esquerda vale…",
      ["3 unidades", "30 unidades", "300 unidades"],
      2,
      "Posição das centenas: 3 × 100 = 300.",
    ),
    numeric("Qual é o valor posicional do 7 em 7.204?", 7000, "O 7 está na casa dos milhares."),
    choice(
      "Quantas ordens há em uma classe (sistema brasileiro)?",
      ["2", "3", "10"],
      1,
      "Unidade, dezena e centena formam uma classe.",
    ),
    numeric("Decomponha: 4.000 + 60 + 9 = ?", 4069, "Some as partes: 4069.", 2),
  ],
  comparison: [
    numeric("Qual é o maior: 12 ou 9?", 12, "12 > 9."),
    choice(
      "Como comparamos −3 e 2?",
      ["−3 > 2", "−3 < 2", "−3 = 2"],
      1,
      "Negativos são menores que positivos neste caso.",
    ),
    choice(
      "O símbolo 5 < 8 significa que…",
      ["5 é maior que 8", "5 é menor que 8", "5 é igual a 8"],
      1,
      "A ponta do < aponta para o menor número.",
    ),
    numeric("Ordene mentalmente: qual é menor, −1 ou 0?", -1, "−1 fica à esquerda de 0 na reta.", 2),
    choice(
      "Qual afirmação é verdadeira?",
      ["−10 é maior que −3", "−10 é menor que −3", "−10 é igual a −3"],
      1,
      "Quanto mais à esquerda na reta, menor o número: −10 < −3.",
    ),
  ],
  "fraction-intro": [
    choice(
      "Em 3/4, o denominador indica…",
      ["Quantas partes pegamos", "Em quantas partes o inteiro foi dividido", "O valor decimal"],
      1,
      "O denominador 4 divide o inteiro em 4 partes iguais.",
    ),
    choice(
      "3/4 é uma fração…",
      ["Própria", "Imprópria", "Igual a zero"],
      0,
      "Numerador (3) < denominador (4).",
    ),
    numeric(
      "Um bolo foi dividido em 8 pedaços iguais. Você come 3. Que fração comeu? (numerador)",
      3,
      "3 partes de 8 → numerador 3 (resposta pede só o numerador da fração 3/8).",
      2,
    ),
    choice("O denominador de uma fração pode ser zero?", ["Sim", "Não", "Só em decimais"], 1, "Dividir em zero partes não faz sentido."),
    choice(
      "O que representa o numerador em 5/8?",
      ["Em quantas partes dividimos o inteiro", "Quantas partes estamos considerando", "O valor decimal exato"],
      1,
      "O numerador indica quantas fatias (partes) estamos falando.",
    ),
  ],
  "fraction-simplify": [
    numeric("Simplifique 6/8: qual é o numerador da forma irredutível?", 3, "6/8 = 3/4 (dividimos por 2)."),
    numeric("Simplifique 10/15: qual é o denominador irredutível?", 3, "10/15 = 2/3."),
    choice(
      "Para simplificar 12/18, dividimos numerador e denominador por…",
      ["2", "6", "12"],
      1,
      "MDC(12,18) = 6 → 12/18 = 2/3.",
      2,
    ),
    numeric("8/12 simplificado: qual é o numerador?", 2, "8/12 = 2/3."),
  ],
  "fraction-decimal": [
    numeric("1/4 em decimal (use ponto: 0.25)", 0.25, "1 ÷ 4 = 0,25."),
    numeric("1/2 em decimal", 0.5, "Um meio = 0,5."),
    choice(
      "0,25 equivale a qual fração simplificada?",
      ["1/4", "1/2", "2/5"],
      0,
      "25/100 = 1/4.",
    ),
    numeric("3/4 em decimal", 0.75, "3 ÷ 4 = 0,75.", 2),
  ],
  "fraction-ops": [
    numeric("1/5 + 2/5 = ? (só o numerador; denominador continua 5)", 3, "Mesmo denominador: 1+2=3 → 3/5."),
    numeric("2/4 + 1/4 = ? (numerador da resposta)", 3, "2+1=3 → 3/4."),
    choice(
      "Para somar 1/2 + 1/4, primeiro devemos…",
      ["Somar os numeradores direto", "Igualar os denominadores", "Multiplicar os denominadores"],
      1,
      "1/2 = 2/4, depois somamos numeradores.",
      2,
    ),
    numeric("(2/3) × (1/2): qual é o numerador do resultado antes de simplificar?", 2, "2×1=2; 3×2=6 → 2/6 = 1/3."),
  ],
  "percent-intro": [
    choice("50% significa…", ["Metade do total", "Dobro do total", "Um quinto do total"], 0, "50 de cada 100 = metade."),
    numeric("25% de 200 = ?", 50, "0,25 × 200 = 50."),
    choice(
      "3/4 em porcentagem é…",
      ["25%", "50%", "75%"],
      2,
      "3 ÷ 4 = 0,75 → 75%.",
    ),
    numeric("Com 20% de desconto em R$ 100, quanto você paga?", 80, "Paga 80%: 100 − 20 = 80.", 2),
  ],
  "length-units": [
    numeric("Quantos metros há em 2 km?", 2000, "1 km = 1000 m → 2 × 1000 = 2000."),
    choice(
      "Qual unidade é mais adequada para medir a largura de um livro?",
      ["Quilômetro", "Centímetro", "Quilômetro e metro"],
      1,
      "Centímetro é escala adequada para objetos pequenos.",
    ),
    numeric("350 cm = quantos metros?", 3.5, "Divida por 100: 3,5 m."),
    choice("1 m equivale a quantos cm?", ["10", "100", "1000"], 1, "1 m = 100 cm.", 2),
  ],
  "mass-units": [
    numeric("2 kg = quantas gramas?", 2000, "1 kg = 1000 g."),
    numeric("500 g = quantos kg? (use decimal com ponto)", 0.5, "500 ÷ 1000 = 0,5 kg."),
    choice(
      "Para uma receita de 250 g de farinha, a balança deve mostrar…",
      ["0,25 kg", "2,5 kg", "25 kg"],
      0,
      "250 g = 0,25 kg.",
    ),
    numeric("1,5 kg = quantas gramas?", 1500, "1,5 × 1000 = 1500 g.", 2),
  ],
  "time-units": [
    numeric("2 horas = quantos minutos?", 120, "2 × 60 = 120 min."),
    numeric("90 minutos = quantas horas? (decimal com ponto)", 1.5, "90 ÷ 60 = 1,5 h."),
    choice("60 segundos equivalem a…", ["1 minuto", "1 hora", "10 minutos"], 0, "60 s = 1 min."),
    numeric("3 minutos = quantos segundos?", 180, "3 × 60 = 180 s.", 2),
  ],
  "unit-conversion": [
    numeric("3,5 km em metros", 3500, "3,5 × 1000 = 3500 m."),
    choice(
      "Para converter metros em quilômetros, devemos…",
      ["Multiplicar por 1000", "Dividir por 1000", "Somar 1000"],
      1,
      "Km é unidade maior: o número em km é menor.",
    ),
    numeric("2500 m = quantos km?", 2.5, "2500 ÷ 1000 = 2,5 km."),
    choice(
      "3 km é maior ou menor que 300 m?",
      ["Maior", "Menor", "Igual"],
      0,
      "3 km = 3000 m > 300 m.",
      2,
    ),
  ],
  shapes: [
    choice(
      "Quantos lados tem um triângulo?",
      ["3", "4", "5"],
      0,
      "Tri = três lados.",
    ),
    choice(
      "Um quadrado é também um retângulo?",
      ["Sim", "Não", "Só se for grande"],
      0,
      "Quadrado tem 4 lados iguais e 4 ângulos retos — caso especial de retângulo.",
    ),
    choice(
      "Qual figura tem todos os lados iguais e 4 ângulos retos?",
      ["Losango", "Quadrado", "Trapézio"],
      1,
      "Quadrado: lados iguais + ângulos retos.",
      2,
    ),
    numeric("Quantos vértices tem um pentágono?", 5, "Penta = cinco vértices."),
    choice(
      "Quantos lados tem um hexágono?",
      ["5", "6", "8"],
      1,
      "Hexa = seis lados.",
    ),
  ],
  "area-perimeter": [
    choice(
      "Perímetro mede…",
      ["O contorno da figura", "O espaço interno", "O volume"],
      0,
      "Perímetro = soma dos lados do contorno.",
    ),
    numeric("Retângulo 5 cm × 3 cm: qual é a área (cm²)?", 15, "Área = base × altura = 5×3 = 15."),
    numeric("Quadrado de lado 4 cm: qual é o perímetro (cm)?", 16, "4 lados × 4 cm = 16 cm."),
    numeric("Triângulo com base 6 cm e altura 4 cm: área (cm²)?", 12, "(6×4)/2 = 12.", 2),
  ],
  "circle-intro": [
    choice(
      "A linha que vai do centro até a borda do círculo chama-se…",
      ["Diâmetro", "Raio", "Corda"],
      1,
      "Raio = metade do diâmetro.",
    ),
    numeric("Círculo com raio 3 cm: qual é o diâmetro (cm)?", 6, "Diâmetro = 2 × raio = 6."),
    choice(
      "π (pi) aparece nas fórmulas de…",
      ["Área e comprimento do círculo", "Área do quadrado", "Perímetro do triângulo"],
      0,
      "Círculo usa π nas fórmulas de comprimento e área.",
      2,
    ),
    choice("O diâmetro é sempre…", ["Maior que o raio", "Menor que o raio", "Igual ao raio"], 0, "d = 2r."),
    numeric("Circunferência com raio 1 (use π ≈ 3,14): 2 × π × 1 ≈ ?", 6.28, "2πr = 2 × 3,14 × 1 ≈ 6,28.", 2),
  ],
  variables: [
    choice(
      "Em 2x + 5, a letra x representa…",
      ["Um número desconhecido (variável)", "Sempre 2", "Uma operação"],
      0,
      "Variáveis representam valores que podem mudar.",
    ),
    numeric("Se x = 4, quanto vale 2x?", 8, "2 × 4 = 8."),
    choice(
      "Qual expressão tem a variável x?",
      ["7 + 3", "x − 1", "12"],
      1,
      "x − 1 contém a variável x.",
    ),
    numeric("Se a = 3, quanto vale a + 7?", 10, "3 + 7 = 10.", 2),
    choice(
      "Em y = 2x, se x = 5, quanto vale y?",
      ["7", "10", "25"],
      1,
      "y = 2 × 5 = 10.",
    ),
  ],
  expressions: [
    numeric("Calcule 3 + 4 × 2 (sem variáveis)", 11, "Multiplicação antes: 4×2=8; 3+8=11."),
    choice(
      "Em 5 + 2x, o termo 2x é chamado de…",
      ["Termo com variável", "Constante pura", "Equação"],
      0,
      "2x depende do valor de x.",
    ),
    numeric("Simplifique mentalmente: 2x + 3x quando x=1 vale quanto?", 5, "2+3=5 quando substituímos x=1 em 5x."),
    choice(
      "Qual é equivalente a 4 + 4 + 4?",
      ["4 × 3", "4 + 3", "4 − 3"],
      0,
      "Três somas de 4 → 4×3.",
      2,
    ),
    numeric("Calcule: 10 − 3 × 2", 4, "Multiplicação antes: 3×2=6; 10−6=4."),
  ],
  "equations-basic": [
    numeric("Resolva: x + 3 = 10. Qual é x?", 7, "x = 10 − 3 = 7."),
    numeric("Resolva: 2x = 12. Qual é x?", 6, "x = 12 ÷ 2 = 6."),
    choice(
      "Para isolar x em x − 5 = 2, fazemos…",
      ["Somar 5 aos dois lados", "Dividir por 5", "Subtrair 5 só da esquerda"],
      0,
      "Somamos 5: x = 7.",
    ),
    numeric("x/4 = 3. Qual é x?", 12, "x = 3 × 4 = 12.", 2),
  ],
  "word-problems": [
    numeric("Ana tem 5 balas e ganha mais 3. Quantas tem agora?", 8, "5 + 3 = 8."),
    numeric("Havia 20 reais e gastou 7. Quanto sobrou?", 13, "20 − 7 = 13."),
    choice(
      "‘Dobro de um número’ se escreve como…",
      ["n + 2", "2n", "n/2"],
      1,
      "Dobro = multiplicar por 2.",
      2,
    ),
    numeric("3 caixas com 4 lápis cada: total de lápis?", 12, "3 × 4 = 12."),
    choice(
      "Pedro leu 12 páginas em 3 dias, no mesmo ritmo. Em 5 dias, lê quantas páginas?",
      ["20", "15", "9"],
      0,
      "4 páginas/dia × 5 dias = 20.",
      2,
    ),
  ],
  "rule-of-three": [
    choice(
      "Regra de três serve para…",
      ["Proporções com grandezas relacionadas", "Somar frações", "Medir ângulos"],
      0,
      "Relaciona duas razões proporcionais.",
    ),
    numeric("Se 2 kg custam R$ 10, quanto custam 4 kg (mesmo preço por kg)?", 20, "Dobro da massa → dobro do preço: R$ 20."),
    numeric("5 livros custam R$ 50. Quanto custa 1 livro (R$)?", 10, "50 ÷ 5 = 10."),
    numeric("3 metros de tecido custam R$ 24. Quanto custam 5 m?", 40, "8 reais/m × 5 = 40.", 2),
    choice(
      "Uma receita usa 2 xícaras de farinha para 8 bolinhos. Para 12 bolinhos (mesma receita), precisa de…",
      ["3 xícaras", "2 xícaras", "16 xícaras"],
      0,
      "Proporção: 8 bolinhos → 2 xícaras; 12 é 1,5×8 → 3 xícaras.",
      2,
    ),
  ],
  "logic-reasoning": [
    choice(
      "Se todos os A são B, e João é A, então João…",
      ["É B", "Não é B", "Pode ou não ser B"],
      0,
      "Conclusão direta do enunciado.",
    ),
    choice(
      "Qual sequência continua 2, 4, 6, 8, …?",
      ["10", "9", "12"],
      0,
      "Padrão: +2 a cada passo → 10.",
    ),
    choice(
      "‘Se chove, levo guarda-chuva’ — choveu e não levou. Isso é…",
      ["Coerente com a regra", "Contradição da regra", "Sem relação"],
      1,
      "Quebrar a consequência contradiz o ‘se… então…’.",
      2,
    ),
    numeric("Próximo número: 1, 3, 5, 7, …?", 9, "Números ímpares consecutivos."),
    choice(
      "Se A implica B e B é falso, o que podemos concluir sobre A?",
      ["A é necessariamente falso", "A pode ser verdadeiro ou falso", "B é verdadeiro"],
      0,
      "Se A fosse verdadeiro, B teria que ser verdadeiro; como B é falso, A não pode ser verdadeiro.",
      2,
    ),
  ],
  "graphs-intro": [
    choice(
      "Em um gráfico de barras, a altura da barra mostra…",
      ["A quantidade da categoria", "A cor favorita", "O tempo sempre em segundos"],
      0,
      "Altura ∝ valor da categoria.",
    ),
    choice(
      "Eixo horizontal (x) costuma representar…",
      ["Categorias ou tempo", "Sempre o preço", "Apenas temperatura"],
      0,
      "X costuma ser categoria ou tempo.",
    ),
    choice(
      "Qual gráfico é melhor para comparar partes de um todo?",
      ["Gráfico de pizza", "Reta numérica", "Tabela de multiplicação"],
      0,
      "Pizza mostra frações do total.",
      2,
    ),
    numeric("Três barras com alturas 2, 5 e 3: qual categoria é a maior?", 5, "A barra de altura 5 é a maior."),
    choice(
      "Em um gráfico de linhas, os pontos ligados costumam mostrar…",
      ["Evolução ao longo do tempo ou sequência", "Só totais absolutos", "Ângulos de um triângulo"],
      0,
      "Linhas conectam valores ordenados (tempo, idade, ordem…).",
    ),
  ],
};

export function conceptProblemSignature(p: ConceptProblem): string {
  if (p.kind === "choice") {
    return `c:${p.prompt}`;
  }
  return `n:${p.prompt}:${p.answer}`;
}

export function hasConceptPractice(lessonId: string): boolean {
  return lessonId in POOLS;
}

export function generateConceptProblem(
  lessonId: string,
  tier: 1 | 2 | 3 = 1,
): ConceptProblem | null {
  return generateConceptProblemUnique(lessonId, tier, new Set());
}

/** Sorteia questão conceitual evitando repetir o mesmo enunciado na sessão. */
export function generateConceptProblemUnique(
  lessonId: string,
  tier: 1 | 2 | 3 = 1,
  usedSignatures: ReadonlySet<string>,
): ConceptProblem | null {
  const pool = POOLS[lessonId];
  if (!pool?.length) return null;

  const pickRandom = (list: ConceptProblem[]): ConceptProblem | null => {
    if (!list.length) return null;
    let available = list.filter(
      (q) => !usedSignatures.has(conceptProblemSignature(q)),
    );
    // Menos questões que o tamanho da sessão: permite repetir enunciado.
    if (!available.length) available = list;
    return available[randInt(0, available.length - 1)]!;
  };

  const eligible = pool.filter((q) => (q.minTier ?? 1) <= tier);
  const fromTier = pickRandom(eligible.length > 0 ? eligible : pool);
  if (fromTier) return fromTier;
  return pickRandom(pool);
}

export function checkConceptNumericAnswer(
  problem: ConceptProblem,
  userValue: number,
): boolean {
  if (problem.kind !== "numeric") return false;
  return Math.abs(userValue - problem.answer) < 1e-6;
}

export function checkConceptChoiceAnswer(
  problem: ConceptProblem,
  selectedIndex: number,
): boolean {
  if (problem.kind !== "choice") return false;
  return selectedIndex === problem.correctIndex;
}

export function explainConceptSolution(problem: ConceptProblem): string {
  return problem.explanation;
}
