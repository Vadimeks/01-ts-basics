// src/js/feedback.js

import Swiper from 'swiper/bundle';
import 'swiper/css/bundle';

import 'css-star-rating/css/star-rating.css';

import { fetchFeedbacks } from './apiService';

const swiperWrapper = document.querySelector('.swiper-wrapper');

async function initializeFeedbackSection() {
  try {
    const feedbacksData = await fetchFeedbacks(10, 1);
    const feedbackList = feedbacksData.data;

    if (!feedbackList || feedbackList.length === 0) {
      console.log('No feedback data received.');
      return;
    }

    feedbackList.forEach(({ rating, descr, name }) => {
      const slide = createFeedbackSlide({ rating, text: descr, user: name });
      swiperWrapper.appendChild(slide);
    });

    initSwiper();
  } catch (error) {
    console.error('Error initializing feedback section:', error);
  }
}

function createFeedbackSlide({ rating, text, user }) {
  const slide = document.createElement('div');
  slide.classList.add('swiper-slide');

  const roundedRating = Math.round(rating);
  slide.innerHTML = `
    <div class="feedback-card">
      <div class="feedback-stars">${renderStars(roundedRating)}</div>
      <p class="feedback-text">"${text}"</p>
      <p class="feedback-user">${user}</p>
    </div>
  `;
  return slide;
}

function renderStars(count) {
  const max = 5;
  return '★'.repeat(count) + '☆'.repeat(max - count);
}

function initSwiper() {
  new Swiper('.feedback-swiper', {
    loop: false,
    grabCursor: true,

    // Swiper Pagination (dots)
    pagination: {
      el: '.feedback-pagination',
      clickable: true,
    },

    // Swiper Navigation (arrows)
    navigation: {
      nextEl: '.feedback-button-next',
      prevEl: '.feedback-button-prev',
    },

    // Breakpoints for slidesPerView and spaceBetween
    breakpoints: {
      320: {
        slidesPerView: 1,
        spaceBetween: 10,
        // На мабільных выкарыстоўваем пагінацыю (кропкі), а не навігацыйныя стрэлкі
        // navigation: { enabled: false }, // Адключаем навігацыю на мабільных
        // Але лепш проста хаваць/паказваць іх праз CSS
      },
      768: {
        slidesPerView: 2,
        spaceBetween: 20,
        // navigation: { enabled: true }, // Уключаем навігацыю на планшэтах
      },
      1440: {
        slidesPerView: 3,
        spaceBetween: 30,
      },
    },
  });
}

initializeFeedbackSection();
