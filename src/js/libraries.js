// src/js/libraries.js (приклад)

// Normalize.css
import 'normalize.css';

// Swiper (імпорт стилів, якщо ви використовуєте Swiper)
import 'swiper/css/bundle';

// SimpleLightbox
import SimpleLightbox from 'simple-lightbox';

// Axios
import axios from 'axios';

// Vanilla-tilt
import VanillaTilt from 'vanilla-tilt';

// Body-scroll-lock
import {
  disableBodyScroll,
  enableBodyScroll,
  clearAllBodyScrollLocks,
} from 'body-scroll-lock';

// CSS Star Rating (імпорт стилів, якщо ви використовуєте цю бібліотеку)
import 'css-star-rating/css/star-rating.css';

// Якщо тобі потрібні Swiper, Axios, SimpleLightbox, body-scroll-lock або VanillaTilt
// в інших файлах, ти маєш їх експортувати, щоб вони були доступні:
export {
  SimpleLightbox,
  axios,
  disableBodyScroll,
  enableBodyLock, // Змінено на enableBodyLock, якщо це функція
  clearAllBodyScrollLocks,
  VanillaTilt,
  // Клас Swiper зазвичай імпортується безпосередньо у файлах, де він використовується (наприклад, feedback.js),
  // але якщо тобі потрібно зробити його доступним глобально через цей файл, розкоментуй наступний рядок:
  // Swiper,
};
