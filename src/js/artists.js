// js/artists.js
import { fetchArtists } from './apiService.js'; // Імпартуем функцыю для загрузкі артыстаў
import { openArtistModal } from './modal-artists.js'; // Імпартуем функцыю для адкрыцця мадальнага акна

// ===============================================
// 1. Кэшаванне DOM-элементаў
// ===============================================
const artistsContainer = document.getElementById('artists-cards-container'); // Бацькоўскі канэйнер для спісу артыстаў
const loadMoreBtn = document.querySelector('.load-more-btn'); // Кнопка "Load More"

// Пераменная для захавання спасылкі на створаны UL-элемент спісу артыстаў
let artistsListElement = null;

// ===============================================
// 2. Пераменныя для кіравання пагінацыяй
// ===============================================
let currentPage = 1; // Бягучая старонка, пачынаем з першай
const artistsPerPage = 8; // Колькасць артыстаў, якія загружаюцца за адзін раз

// ===============================================
// 3. Функцыя для генерацыі HTML-разметкі адной карткі артыста
// ===============================================
/**
 * Генеруе HTML-разметку для адной карткі артыста.
 * @param {Object} artist - Аб'ект артыста з дадзенымі.
 * @returns {string} - HTML-радок для карткі артыста.
 */
function createArtistCardMarkup(artist) {
  // Генеруем разметку для жанраў як асобных элементаў спісу
  const genresMarkup = Array.isArray(artist.genres)
    ? artist.genres
        .map(genre => `<li class="artist-genre-item">${genre}</li>`) // Кожны жанр - асобны li
        .join('')
    : '<li class="artist-genre-item">Невядома</li>'; // Калі жанраў няма

  // Абрэзка біяграфіі да першых двух сказаў
  const biographyPreview = artist.strBiographyEN
    ? artist.strBiographyEN.split('. ').slice(0, 2).join('. ') + '.' // Дадаем кропку ў канцы
    : 'Кароткі апісанне адсутнічае.'; // Запасны тэкст

  return `
    <li class="artist-item" data-artist-id="${artist._id}">
      <img src="${
        artist.strArtistThumb ||
        'https://via.placeholder.com/200x200?text=No+Image'
      }"
           alt="${artist.strArtist || 'Фота выканаўцы'}"
           class="artist-img">
      <ul class="artist-genres-list">
        ${genresMarkup}
      </ul>
      <h3 class="artist-name">${artist.strArtist || 'Невядомы выканаўца'}</h3>
      <p class="artist-description">${biographyPreview}</p>
      <button type="button" class="learn-more-btn button">Детальніше</button>
    </li>
  `;
}

// ===============================================
// 4. Функцыя для адлюстравання спісу артыстаў на старонцы
// ===============================================
/**
 * Адлюстроўвае масіў артыстаў у спісе, дадаючы іх у DOM.
 * @param {Array} artists - Масіў аб'ектаў артыстаў.
 * @param {boolean} clearPrevious - Калі true, ачышчае спіс перад даданнем новых артыстаў.
 */
function renderArtists(artists, clearPrevious = false) {
  if (!artistsContainer) {
    console.error('Элемент #artists-cards-container не знойдзены ў DOM.');
    return;
  }

  // Ствараем UL-элемент, калі яго яшчэ няма
  if (!artistsListElement) {
    artistsListElement = document.createElement('ul');
    artistsListElement.classList.add('artists-list'); // Дадаем клас 'artists-list'
    artistsContainer.appendChild(artistsListElement);
  }

  if (clearPrevious) {
    artistsListElement.innerHTML = ''; // Ачышчаем спіс, калі гэта першая загрузка або новы пошук
  }

  // Генеруем HTML для ўсіх артыстаў і ўстаўляем у DOM
  const markup = artists.map(createArtistCardMarkup).join('');
  artistsListElement.insertAdjacentHTML('beforeend', markup);

  // ===============================================
  // 5. Прывязваем апрацоўшчыкі падзей для кнопак "Детальніше"
  // ===============================================
  // Важна: шукаем кнопкі толькі ўнутры artistsListElement, каб апрацоўваць толькі новыя элементы
  artistsListElement.querySelectorAll('.learn-more-btn').forEach(button => {
    button.addEventListener('click', event => {
      const artistItem = event.target.closest('.artist-item');
      if (artistItem) {
        const artistId = artistItem.dataset.artistId; // Атрымліваем ID артыста з data-атрыбута

        // Знайсці аб'ект артыста з арыгінальнага спісу, каб атрымаць жанры
        const fullArtistData = artists.find(a => a._id === artistId);
        const artistGenres = fullArtistData ? fullArtistData.genres : []; // Атрымліваем жанры

        if (artistId) {
          // Выклікаем функцыю openArtistModal з modal-artists.js, перадаючы жанры
          openArtistModal(artistId, artistGenres); // <--- ВАЖНАЯ ЗМЕНА ТУТ
        } else {
          console.warn('Кнопка "Детальніше" не мае data-artist-id.');
        }
      }
    });
  });
}

// ===============================================
// 6. Функцыя для загрузкі артыстаў з API
// ===============================================
/**
 * Загружае артыстаў з API з улікам бягучай старонкі і адлюстроўвае іх.
 * Кіруе станам кнопкі "Load More".
 * @param {boolean} newSearch - Калі true, скідае нумар старонкі на 1 і ачышчае спіс.
 */
async function loadArtists(newSearch = false) {
  if (newSearch) {
    currentPage = 1; // Скідаем старонку, калі гэта новы пошук або першая загрузка
    // Калі гэта новая загрузка, і элемент спісу ўжо існуе, ачысцім яго перад пачаткам
    if (artistsListElement) {
      artistsListElement.innerHTML = '';
    }
  }

  try {
    // Выклікаем функцыю fetchArtists з apiService.js
    const data = await fetchArtists(artistsPerPage, currentPage);
    const artists = data.artists || [];
    const totalArtists = data.totalArtists || 0;

    renderArtists(artists, newSearch); // Адлюстроўваем артыстаў

    // ===============================================
    // 7. Логіка для паказу/хавання кнопкі "Load More"
    // ===============================================
    if (loadMoreBtn) {
      // Праверка на існаванне кнопкі
      if (currentPage * artistsPerPage >= totalArtists) {
        loadMoreBtn.classList.add('is-hidden'); // Хаваем, калі ўсе артысты загружаны
      } else {
        loadMoreBtn.classList.remove('is-hidden'); // Паказваем, калі ёсць яшчэ артысты
      }
    }
  } catch (error) {
    console.error('Памылка пры загрузцы артыстаў:', error);
    // Можна дадаць візуальнае паведамленне карыстальніку пра памылку
    if (loadMoreBtn) {
      loadMoreBtn.classList.add('is-hidden'); // Хаваем кнопку пры памылцы загрузкі
    }
    // Калі спіс пусты, пакажам паведамленне
    if (artistsListElement && artistsListElement.innerHTML === '') {
      artistsListElement.innerHTML = `<li class="artist-item"><p>Не ўдалося загрузіць выканаўцаў. Паспрабуйце пазней.</p></li>`;
    }
  }
}

// ===============================================
// 8. Прывязваем апрацоўшчык падзей да кнопкі "Load More"
// ===============================================
if (loadMoreBtn) {
  loadMoreBtn.addEventListener('click', () => {
    currentPage += 1; // Павялічваем нумар старонкі
    loadArtists(false); // Загружаем наступную порцыю без ачысткі папярэдніх
  });
}

// ===============================================
// 9. Запускаем загрузку артыстаў пры загрузцы DOM
// ===============================================
document.addEventListener('DOMContentLoaded', () => {
  loadArtists(true); // Першая загрузка: ачышчаем спіс і паказваем першых 8 артыстаў
});
