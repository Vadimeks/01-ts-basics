// Завдання 8. HTTP-запити (файл task-8.ts)

// Функція fetchPosts робить GET-запит до API та повертає список постів.

// import axios from "axios";

// async function fetchPosts() {
//   const response = await axios.get(
//     '<https://jsonplaceholder.typicode.com/posts>'
//   );
//   return response.data;
// }

// fetchPosts().then((posts) => {
//   console.log(posts[0].title);
// });

// Завдання:

// Інсталюй бібліотеку axios командою npm i axios
// Створи інтерфейс Post, який описує об'єкт поста з такими полями:
// id: число
// title: рядок
// body: рядок
// 3. Типізуй axios.get, щоб вказати, що API повертає масив постів.
export {};
import axios from 'axios';
interface Post {
  id: number;
  title: string;
  body: string;
}
async function fetchPosts(): Promise<Post[]> {
  const response = await axios.get<Post[]>(
    'https://jsonplaceholder.typicode.com/posts'
  );
  return response.data;
}
fetchPosts()
  .then(posts => {
    if (posts.length > 0) {
      console.log(`First post (title): ${posts[0].title}`);
      console.log(`First post (body): ${posts[0].title}`);
      console.log(`First post type:`, posts[0]);
    } else {
      console.log('Posts not found');
    }
  })
  .catch(error => {
    console.error('Error during posts receiving:', error);
  });
