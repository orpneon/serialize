function serialize(numbers: number[]): string {
  const freqMap = new Map<number, number>();

  // собираем hashMap
  for (const num of numbers) {
    freqMap.set(num, (freqMap.get(num) || 0) + 1);
  }

  let result: string[] = [];

  // в 2 прохода обходим полученный hashMap
  while (freqMap.size > 0) {
    let isCycleCompleted = false;
    const currentNumIterator = freqMap.keys();
    const segment: number[] = [];

    while (!isCycleCompleted) {
      const currentNum = currentNumIterator.next();
      const currentValue = currentNum.value;

      // фиксируем конец списка для выхода из цикла
      if (currentValue === undefined) {
        isCycleCompleted = true;
      }

      // если текущий отрезок пустой, либо текущий элемент на 1 больше предыдущего,
      // добавляем в отрезок и переходим к следующей итерации
      if (
        (!segment.length || currentValue - segment.at(-1) === 1) &&
        !isCycleCompleted
      ) {
        segment.push(currentValue);
        continue;
      }

      // иначе "собираем" интервал и добавляем в результирующий список
      const interval =
        segment.length === 1 ? segment[0] : `${segment[0]}-${segment.at(-1)}`;
      const amount = Math.min(...segment.map((num) => freqMap.get(num)));

      result.push(`${interval}${amount === 1 ? "" : `:${amount}`}`);

      // уменьшаем количество вхождений каждого числа в hashMap
      // если 0, удаляем ключ
      segment.forEach((num) => {
        const changedAmount = freqMap.get(num) - amount;

        if (changedAmount) {
          freqMap.set(num, changedAmount);
        } else {
          freqMap.delete(num);
        }
      });
      // очищаем текущий отрезок, т.к. уже обработали его
      segment.length = 0;

      // если не конец списка, добавляем текущий элемент в отрезок
      if (!isCycleCompleted) {
        segment.push(currentValue);
      }
    }
  }

  return result.join(",");
}

function deserialize(serialized: string): number[] {
  const result: number[] = [];

  for (const part of serialized.split(",")) {
    const [range, amount = 1] = part.split(":");
    const [start, end] = range.split("-").map((num) => Number(num));

    for (let currentNum = start; currentNum <= (end ?? start); currentNum++) {
      result.push.apply(result, Array(Number(amount)).fill(currentNum));
    }
  }

  return result;
}

function testCompression(numbers: number[]) {
  const original = JSON.stringify(numbers);
  const compressed = serialize(numbers);
  const decompressed = deserialize(compressed);
  const ratio = Math.max(
    (compressed.length / original.length).toFixed(2),
    0.01
  );
  const isValid =
    JSON.stringify(numbers.sort((a, b) => a - b)) ===
    JSON.stringify(decompressed.sort((a, b) => a - b));

  console.log(`Исходные данные: ${original}`);
  console.log(`Сжатая строка: ${compressed}`);
  console.log(`Восстановленные данные: ${JSON.stringify(decompressed)}`);
  console.log(`Коэффициент сжатия: ${ratio}`);
  console.log(
    `Корректность восстановления: ${isValid ? "✅ Успех" : "❌ Ошибка"}`
  );
  console.log("----------------------------");

  return isValid ? ratio : 1;
}

const compressionList: number[] = [];

// Тест 1: Простые случаи с повторениями
compressionList.push(testCompression([1, 2, 2, 3, 4, 4, 4, 5])); // "1-5,2,4:2"
compressionList.push(testCompression([1, 3, 3, 4, 4, 5, 5, 7])); // "1,3-5:2,7"
compressionList.push(testCompression([1, 3, 3, 4, 4, 5, 5, 5, 7, 8, 10])); // "1,3-5:2,7-8,10,5"

// Тест 2: 50 случайных чисел
compressionList.push(
  testCompression(
    Array.from({ length: 50 }, () => Math.floor(Math.random() * 300) + 1)
  )
);

// Тест 3: 100 случайных чисел
compressionList.push(
  testCompression(
    Array.from({ length: 100 }, () => Math.floor(Math.random() * 300) + 1)
  )
);

// Тест 4: 500 случайных чисел
compressionList.push(
  testCompression(
    Array.from({ length: 500 }, () => Math.floor(Math.random() * 300) + 1)
  )
);

// Тест 5: 1000 случайных чисел
compressionList.push(
  testCompression(
    Array.from({ length: 1000 }, () => Math.floor(Math.random() * 300) + 1)
  )
);

// Тест 6: Все числа одного значения, повторенные 50 раз
compressionList.push(testCompression(Array(50).fill(7))); // "7:50"

// Тест 7: Последовательность чисел, но каждое по 3 раза
compressionList.push(
  testCompression(
    [].concat(...Array(3).fill(Array.from({ length: 50 }, (_, i) => i + 1)))
  )
); // "1-50:3"

// Тест 8: Все числа от 1 до 300, у каждого по 2 повтора
compressionList.push(
  testCompression(
    [].concat(...Array(2).fill(Array.from({ length: 300 }, (_, i) => i + 1)))
  )
); // "1-300:2"

const avgRatio = (
  compressionList.reduce((a, b) => a + b, 0) / compressionList.length
).toFixed(2);

console.log(`Средний коэффициент сжатия: ${avgRatio}`);
