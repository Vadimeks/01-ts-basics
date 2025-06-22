// Задача 6. Узагальнені типи (файл task-6.ts)

// Функція getFirstElement приймає масив і повертає його перший елемент.

// function getFirstElement(arr) {
//   return arr[0];
// }

// getFirstElement([1, 2, 3]);
// getFirstElement(["a", "b", "c"]);
// getFirstElement([true, false, true]);

// Завдання:

// Зроби функцію узагальненою, використовуючи тип T, щоб вона працювала з масивами будь-якого типу.
// Додай явну типізацію дженериків у виклики функцій.
// Переконайся, що тип елемента, який повертається, точно відповідає типу елементів у масиві.
// Перевір, що TypeScript не дозволяє передати масив змішаних типів без відповідного типу.
export {};
function getFirstElement<T>(arr: T[]): T | undefined {
  if (arr.length === 0) {
    return undefined;
  }
  return arr[0];
}
const numResult = getFirstElement<number>([1, 2, 3]);
console.log(`First number: ${numResult}, Type: ${typeof numResult}`);
const stringResult = getFirstElement<string>(['a', 'b', 'c']);
console.log(`First string: ${stringResult}, Type: ${typeof stringResult}`);
const booleanResult = getFirstElement<boolean>([true, false, true]);
console.log(`First boolean: ${booleanResult}, Type: ${typeof booleanResult}`);
const mixedTypeArray = [1, 'two', true];
const mixedResult = getFirstElement<number | string | boolean>(mixedTypeArray);
console.log(`First mixed: ${mixedResult}, Type: ${typeof mixedResult}`);
const emptyResult = getFirstElement<string>([]);
console.log(
  `First el of empty arr: ${emptyResult}, Type: ${typeof emptyResult}`
);
