// js/modal-artists.js
import {
  fetchArtistDetailsWithTracks,
  fetchArtistDetailsWithAlbums,
} from './apiService.js'; // Імпартуем функцыі API

// ===============================================
// 1. Кэшаванне DOM-элементаў
// ===============================================
const artistModal = document.getElementById('artistModal');
const closeModalButton = artistModal
  ? artistModal.querySelector('.close-modal')
  : null;
const modalLoader = document.getElementById('modalLoader');
const modalTitle = artistModal
  ? artistModal.querySelector('.modal-title')
  : null;
const heroArtistImg = artistModal
  ? artistModal.querySelector('.hero-artist-img')
  : null;

const artistInfoList = artistModal
  ? artistModal.querySelector('.artist-info-list')
  : null;
const artistBioParagraph = artistModal
  ? artistModal.querySelector('.artist-info-bio-text')
  : null;
const genresList = artistModal
  ? artistModal.querySelector('.genres-list')
  : null;
const artistAlbumsListContainer = artistModal
  ? artistModal.querySelector('.artist-albums-list')
  : null;

// ===============================================
// 2. Пераменныя для кіравання пагінацыяй альбомаў у мадальным акне
// ===============================================
let allAlbums = [];
let currentAlbumPage = 1;
const albumsPerPage = 8; // Па 8 альбомаў на старонку ў мадальным акне

// ===============================================
// 3. Функцыі апрацоўшчыкаў закрыцця мадальнага акна
// ===============================================
function closeArtistModal() {
  if (artistModal) {
    artistModal.classList.remove('open');
  }
  if (document.body) {
    document.body.classList.remove('modal-open');
  }
  // Ачыстка кантэнту пры закрыцці, каб не было старых дадзеных
  if (modalTitle) modalTitle.textContent = 'Назва выканаўцы';
  if (heroArtistImg) {
    heroArtistImg.src = '';
    heroArtistImg.alt = '';
  }
  if (artistInfoList) artistInfoList.innerHTML = '';
  if (artistBioParagraph) artistBioParagraph.innerHTML = '';
  if (genresList) genresList.innerHTML = '';
  if (artistAlbumsListContainer) artistAlbumsListContainer.innerHTML = '';

  // Схаваць лоадер
  if (modalLoader) modalLoader.style.display = 'none';

  // Выдаліць кнопкі пагінацыі, калі яны былі створаны
  const existingPaginationControls = artistModal.querySelector(
    '.pagination-controls'
  );
  if (existingPaginationControls) {
    existingPaginationControls.remove();
  }
}

function outsideClickHandler(e) {
  if (e.target === artistModal) {
    closeArtistModal();
  }
}

function escapeKeyHandler(e) {
  if (e.key === 'Escape') {
    closeArtistModal();
  }
}

// ===============================================
// 4. Функцыя для адлюстравання альбомаў (з пагінацыяй)
// ===============================================
function renderAlbums(page) {
  if (!artistAlbumsListContainer) return;

  const startIndex = (page - 1) * albumsPerPage;
  const endIndex = startIndex + albumsPerPage;
  const albumsToDisplay = allAlbums.slice(startIndex, endIndex);

  artistAlbumsListContainer.innerHTML = ''; // Ачыстка спісу альбомаў перад запаўненнем

  if (albumsToDisplay.length === 0) {
    artistAlbumsListContainer.innerHTML = `<li class="artist-albums-item"><p>Інфармацыя пра альбомы адсутнічае.</p></li>`;
    return;
  }

  albumsToDisplay.forEach(album => {
    let albumItemHtml = `<li class="artist-albums-item">
                                <h3>${album.strAlbum || 'Назва альбому'} (${
      album.intYearReleased || 'Год'
    })</h3>
                                <ul class="album-track-list">`;

    // Загаловак табліцы трэкаў
    albumItemHtml += `<li class="album-track-item track-header">
                                <ul class="track-info-list">
                                    <li class="track-info-item">Трэк</li>
                                    <li class="track-info-item">Час</li>
                                    <li class="track-info-item">Спасылка</li>
                                </ul>
                            </li>`;

    if (album.tracks && album.tracks.length > 0) {
      album.tracks.forEach((track, index) => {
        const rowClass = index % 2 === 0 ? 'even-row' : 'odd-row';
        albumItemHtml += `<li class="album-track-item ${rowClass}">
                                        <ul class="track-info-list">
                                            <li class="track-info-item">${
                                              track.strTrack ||
                                              'Назва кампазіцыі'
                                            }</li>
                                            <li class="track-info-item">${
                                              track.intDuration
                                                ? formatDuration(
                                                    track.intDuration
                                                  )
                                                : '-'
                                            }</li>
                                            <li class="track-info-item">`;
        // Праверка на карэктнасць URL: пачынаецца з http і не роўна "null"
        if (
          track.movie && // Выкарыстоўваем 'movie' для YouTube спасылак
          track.movie !== 'null' &&
          (track.movie.startsWith('http://') ||
            track.movie.startsWith('https://'))
        ) {
          albumItemHtml += `<button class="yt-button" data-url="${track.movie}">YouTube</button>`;
        } else {
          albumItemHtml += `-`;
        }
        albumItemHtml += `</li>
                                        </ul>
                                    </li>`;
      });
    } else {
      albumItemHtml += `<li class="album-track-item"><p>Няма кампазіцый для гэтага альбому.</p></li>`;
    }
    albumItemHtml += `</ul></li>`;
    artistAlbumsListContainer.insertAdjacentHTML('beforeend', albumItemHtml);
  });

  // ===============================================
  // Стварэнне кнопак пагінацыі (за межамі ul.artist-albums-list)
  // ===============================================
  const totalPages = Math.ceil(allAlbums.length / albumsPerPage);

  const existingPaginationControls = artistModal.querySelector(
    '.pagination-controls'
  );
  if (existingPaginationControls) {
    existingPaginationControls.remove();
  }

  if (totalPages > 1) {
    const paginationControls = document.createElement('div');
    paginationControls.className = 'pagination-controls';

    const prevButton = document.createElement('button');
    prevButton.textContent = 'Папярэдняя';
    prevButton.disabled = page === 1;
    prevButton.addEventListener('click', () => {
      currentAlbumPage--;
      renderAlbums(currentAlbumPage);
    });

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Наступная';
    nextButton.disabled = page === totalPages;
    nextButton.addEventListener('click', () => {
      currentAlbumPage++;
      renderAlbums(currentAlbumPage);
    });

    const pageInfo = document.createElement('span');
    pageInfo.textContent = ` ${page} / ${totalPages} `;

    paginationControls.appendChild(prevButton);
    paginationControls.appendChild(pageInfo);
    paginationControls.appendChild(nextButton);

    if (artistAlbumsListContainer.parentElement) {
      artistAlbumsListContainer.parentElement.appendChild(paginationControls);
    } else {
      artistModal.appendChild(paginationControls);
    }
  }

  // ===============================================
  // Прывязваем падзеі да кнопак YouTube пасля абнаўлення DOM
  // ===============================================
  const ytButtons = artistModal.querySelectorAll('.yt-button');
  ytButtons.forEach(btn => {
    btn.addEventListener('click', function (e) {
      const url = e.target.dataset.url;
      if (url) {
        window.open(url, '_blank');
      }
    });
  });
}

// ===============================================
// 5. Функцыя для фарматавання часу (мілісекунды ў хвіліны:секунды)
// ===============================================
function formatDuration(ms) {
  if (typeof ms !== 'number' || isNaN(ms)) {
    return 'N/A';
  }
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// ===============================================
// 6. Галоўная функцыя для адкрыцця мадальнага акна артыста
// ===============================================
export async function openArtistModal(artistId) {
  // <<< ВОСЬ ТУТ ДАДАДЗЕНЫ 'export'
  // Кароткая праверка на існаванне асноўных элементаў модала
  if (
    !artistModal ||
    !modalLoader ||
    !modalTitle ||
    !heroArtistImg ||
    !artistInfoList ||
    !artistBioParagraph ||
    !genresList ||
    !artistAlbumsListContainer
  ) {
    console.error(
      'Адзін або некалькі элементаў мадальнага акна не знойдзены ў DOM. Праверце свае HTML ID і класы.'
    );
    return;
  }

  // Паказваем мадальнае акно і загрузнік
  document.body.classList.add('modal-open');
  artistModal.classList.add('open');
  modalLoader.style.display = 'block';

  // Ачыстка старога кантэнту перад загрузкай
  modalTitle.textContent = 'Загрузка...';
  heroArtistImg.src = '';
  heroArtistImg.alt = '';
  artistInfoList.innerHTML = '';
  artistBioParagraph.innerHTML = '';
  genresList.innerHTML = '';
  artistAlbumsListContainer.innerHTML = '';

  // Скід пагінацыі пры адкрыцці новага артыста
  currentAlbumPage = 1;
  allAlbums = [];

  // Выдаляем кнопкі пагінацыі, калі яны засталіся ад папярэдняга адкрыцця
  const existingPaginationControls = artistModal.querySelector(
    '.pagination-controls'
  );
  if (existingPaginationControls) {
    existingPaginationControls.remove();
  }

  try {
    // Выкарыстоўваем функцыю fetchArtistDetailsWithTracks,
    // бо яна вяртае tracksList непасрэдна з інфармацыяй пра артыста.
    // Калі вы хочаце выкарыстоўваць albumsList, заменіце на fetchArtistDetailsWithAlbums.
    const artistData = await fetchArtistDetailsWithTracks(artistId);

    modalLoader.style.display = 'none'; // Хаваем лоадер пасля атрымання дадзеных

    // Запаўняем асноўную інфармацыю пра артыста
    modalTitle.textContent = artistData.strArtist || 'Невядомы выканаўца';
    heroArtistImg.src =
      artistData.strArtistThumb ||
      'https://via.placeholder.com/250x250.png?text=No+Image'; // Заглушка
    heroArtistImg.alt = artistData.strArtist || 'Фота выканаўцы';

    // Інфармацыя пра артыста (годы, пол, удзельнікі, краіна)
    artistInfoList.innerHTML = `
                <li class="artist-info-item">
                    <h3>Гады актыўнасці</h3>
                    <p class="artist-info">${
                      artistData.intFormedYear || 'інфармацыя адсутнічае'
                    }</p>
                </li>
                <li class="artist-info-item">
                    <h3>Пол</h3>
                    <p class="artist-info">${
                      artistData.strGender || 'інфармацыя адсутнічае'
                    }</p>
                </li>
                <li class="artist-info-item">
                    <h3>Удзельнікі</h3>
                    <p class="artist-info">${
                      artistData.intMembers || 'інфармацыя адсутнічае'
                    }</p>
                </li>
                <li class="artist-info-item">
                    <h3>Краіна</h3>
                    <p class="artist-info">${
                      artistData.strCountry || 'інфармацыя адсутнічае'
                    }</p>
                </li>
            `;

    // Біяграфія
    artistBioParagraph.innerHTML =
      artistData.strBiographyEN || 'Біяграфія адсутнічае.';

    // Жанры (з artistData)
    genresList.innerHTML = ''; // Ачыстка перад даданнем
    if (artistData.genres && artistData.genres.length > 0) {
      artistData.genres.forEach(genre => {
        const li = document.createElement('li');
        li.className = 'ganres-item';
        li.textContent = genre;
        genresList.appendChild(li);
      });
    } else {
      const li = document.createElement('li');
      li.className = 'ganres-item';
      li.textContent = 'Жанры адсутнічаюць';
      genresList.appendChild(li);
    }

    // ===============================================
    // ЛОГІКА ДЛЯ АЛЬБОМАЎ З ПЕРАЎТВАРЭННЕМ ТРЭКАЎ
    // Выкарыстоўваем artistData.tracksList, бо гэты эндпоінт яго вяртае.
    // = Калі б вы выкарыстоўвалі fetchArtistDetailsWithAlbums, тут было б artistData.albumsList >
    // ===============================================
    if (artistData.tracksList && artistData.tracksList.length > 0) {
      // Групоўка трэкаў па альбомах
      const albumsMap = new Map();
      artistData.tracksList.forEach(track => {
        const albumName = track.strAlbum || 'Невядомы альбом';
        const albumId = track.idAlbum || albumName; // Выкарыстоўваем ID альбома або назву для унікальнасці
        if (!albumsMap.has(albumId)) {
          albumsMap.set(albumId, {
            strAlbum: albumName,
            intYearReleased: track.intYearReleased || 'Невядома', // Год можа быць не ва ўсіх трэках
            idAlbum: albumId,
            tracks: [],
          });
        }
        albumsMap.get(albumId).tracks.push(track);
      });

      // Пераўтвараем Map у масіў і сартуем па годзе выпуску (змяншальна)
      allAlbums = Array.from(albumsMap.values()).sort((a, b) => {
        // Парсім год, калі ён ёсць, інакш лічым 0
        const yearA = parseInt(a.intYearReleased) || 0;
        const yearB = parseInt(b.intYearReleased) || 0;
        return yearB - yearA; // Сартаванне ад новых да старых
      });

      renderAlbums(currentAlbumPage); // Адлюстроўваем першую старонку
    } else {
      artistAlbumsListContainer.innerHTML = `<li class="artist-albums-item"><p>Інфармацыя пра альбомы і трэкі адсутнічае.</p></li>`;
    }
  } catch (error) {
    modalLoader.style.display = 'none'; // Хаваем лоадер нават пры памылцы
    if (artistModal) {
      modalTitle.textContent = 'Памылка загрузкі дадзеных!';
      let errorMessage =
        'На жаль, не ўдалося загрузіць дадзеныя пра выканаўцу. ';
      if (error.response) {
        // Апрацоўка памылак axios
        errorMessage += `Статус: ${error.response.status}. `;
        if (error.response.status === 404) {
          errorMessage +=
            'Рэсурс не знойдзены па паказаным URL. Магчыма, няверны ID або API-шлях. Паспрабуйце іншы ID ці праверце дакументацыю API.';
        } else if (error.response.data && error.response.data.message) {
          errorMessage += `Паведамленне: ${error.response.data.message}`;
        }
      } else if (error.request) {
        errorMessage +=
          'Не ўдалося атрымаць адказ ад сервера. Магчыма, праблема з сеткай.';
      } else {
        errorMessage += `Паведамленне: ${error.message}`;
      }

      if (artistInfoList)
        artistInfoList.innerHTML = `<li class="artist-info-item"><p class="error">${errorMessage}</p></li>`;
      if (artistBioParagraph) artistBioParagraph.innerHTML = '';
      if (genresList) genresList.innerHTML = '';
      if (artistAlbumsListContainer) artistAlbumsListContainer.innerHTML = '';
    }
    console.error('Памылка атрымання дадзеных:', error);
  }
}

// ===============================================
// 7. Ініцыялізацыя апрацоўшчыкаў падзей для закрыцця мадальнага акна
// ===============================================
document.addEventListener('DOMContentLoaded', () => {
  if (closeModalButton) {
    closeModalButton.addEventListener('click', closeArtistModal);
  }
  if (artistModal) {
    artistModal.addEventListener('click', outsideClickHandler);
  }
  document.addEventListener('keydown', escapeKeyHandler);
});
