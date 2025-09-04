const adjectives = [
  'Смешной', 'Глупый', 'Летающий', 'Бешеный', 'Танцующий', 'Магический',
  'Сонный', 'Пушистый', 'Безумный', 'Взрывной', 'Лени́вый', 'Шумный', 'Скользкий'
];

const nouns = [
  'Кот', 'Пес', 'Дракон', 'Рыцарь', 'Зомби', 'Бабка', 'Космонавт',
  'Бобёр', 'Ниндзя', 'Повар', 'Тролль', 'Гном', 'Кролик'
];

const suffixes = [
  '123', 'XYZ', 'XD', 'LOL', '!!!', '🐱', '🔥', '💀', '🤖', '🍕'
];

export function generateFunnyNick(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const useSuffix = Math.random() > 0.5;
  const suffix = useSuffix ? suffixes[Math.floor(Math.random() * suffixes.length)] : '';
  return `${adj}${noun}${suffix}`;
}
