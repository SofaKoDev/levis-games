export const MIN = 1;
export const MAX = 20;
const START_MAX = 8;

export const voiceFile = (question) =>
  `${question.operation}-${question.current}-${question.amount}.wav`;

const draw = (random, min, max) => min + Math.floor(random() * (max - min + 1));

function drawFriendlyAmount(random, maxStep) {
  if (maxStep <= 1) return 1;
  const r = random();
  // ~75% tiny finger-counting steps (1–3), ~13% medium (4–5), ~12% bigger challenge steps
  if (r < 0.75) {
    const cap = Math.min(3, maxStep);
    return 1 + Math.floor((r / 0.75) * cap);
  }
  if (r < 0.88 && maxStep > 3) {
    const cap = Math.min(5, maxStep);
    return 4 + Math.floor(((r - 0.75) / 0.13) * (cap - 3));
  }
  if (maxStep > 5) {
    return 6 + Math.floor(((r - 0.88) / 0.12) * (maxStep - 5));
  }
  return maxStep;
}

export function makeQuestion(current, random = Math.random) {
  if (!Number.isInteger(current) || current < MIN || current > MAX)
    throw new RangeError('Current number must be 1–20');
  const plus = MAX - current;
  const minus = current - MIN;
  // Slightly favor addition when low and gentle subtraction when high to stay in a 4-year-old-friendly range
  const addChance = current <= 6 ? 0.72 : current >= 13 ? 0.35 : 0.6;
  const operation = plus && minus ? (random() < addChance ? 'add' : 'subtract') : plus ? 'add' : 'subtract';
  const maxStep = operation === 'add' ? plus : minus;
  const amount = drawFriendlyAmount(random, maxStep);
  const answer = current + (operation === 'add' ? amount : -amount);
  const distractors = [];
  for (let distance = 1; distractors.length < 2 && distance < MAX; distance++) {
    for (const candidate of [answer - distance, answer + distance])
      if (candidate >= MIN && candidate <= MAX && candidate !== answer && !distractors.includes(candidate))
        distractors.push(candidate);
  }
  const choices = [answer, ...distractors.slice(0, 2)];
  for (let i = choices.length - 1; i > 0; i--) {
    const j = draw(random, 0, i);
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  return {
    current,
    operation,
    amount,
    answer,
    choices,
    instruction: operation === 'add' ? `Add ${amount}!` : `Take away ${amount}!`,
    equation: `${current} ${operation === 'add' ? '+' : '−'} ${amount} = ?`,
  };
}

export function createJourney(random = Math.random) {
  let current = draw(random, MIN, START_MAX);
  let hearts = 3;
  let question = makeQuestion(current, random);
  return {
    get current() {
      return current;
    },
    get hearts() {
      return hearts;
    },
    get question() {
      return question;
    },
    choose(value) {
      if (!question.choices.includes(value)) throw new RangeError('Unknown destination');
      if (value === question.answer) {
        current = value;
        hearts = Math.min(3, hearts + 1);
        question = makeQuestion(current, random);
        return 'correct';
      }
      hearts--;
      if (hearts === 0) {
        current = draw(random, MIN, START_MAX);
        hearts = 3;
        question = makeQuestion(current, random);
        return 'restart';
      }
      return 'wrong';
    },
  };
}
