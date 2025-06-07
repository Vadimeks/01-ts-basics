import axios from 'axios';

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
// 2. Пераменныя для кіравання пагінацыяй альбомаў
// ===============================================
let allAlbums = [];
let currentAlbumPage = 1;
const albumsPerPage = 8; // Па 8 альбомаў на старонку

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
  if (modalTitle) modalTitle.textContent = 'Назва виконавця';
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
      album.intYearReleased || 'Рік'
    })</h3>
                                <ul class="album-track-list">`;

    // Загаловак табліцы трэкаў
    albumItemHtml += `<li class="album-track-item track-header">
                                <ul class="track-info-list">
                                    <li class="track-info-item">Трек</li>
                                    <li class="track-info-item">Час</li>
                                    <li class="track-info-item">Посилання</li>
                                </ul>
                            </li>`;

    if (album.tracks && album.tracks.length > 0) {
      album.tracks.forEach((track, index) => {
        const rowClass = index % 2 === 0 ? 'even-row' : 'odd-row';
        albumItemHtml += `<li class="album-track-item ${rowClass}">
                                        <ul class="track-info-list">
                                            <li class="track-info-item">${
                                              track.strTrack ||
                                              'Назва композиції'
                                            }</li>
                                            <li class="track-info-item">${
                                              track.intDuration
                                                ? formatDuration(
                                                    track.intDuration
                                                  )
                                                : '-'
                                            }</li>
                                            <li class="track-info-item">`;
        // Проверка на корректность URL: начинается с http и не равно "null"
        if (
          track.strMusicBrainzID && // Выкарыстоўваем strMusicBrainzID для YouTube спасылак
          track.strMusicBrainzID !== 'null' &&
          (track.strMusicBrainzID.startsWith('http://') ||
            track.strMusicBrainzID.startsWith('https://'))
        ) {
          albumItemHtml += `<button class="yt-button" data-url="${track.strMusicBrainzID}">YouTube</button>`;
        } else {
          albumItemHtml += `-`;
        }
        albumItemHtml += `</li>
                                        </ul>
                                    </li>`;
      });
    } else {
      albumItemHtml += `<li class="album-track-item"><p>Немає композицій для цього альбому.</p></li>`;
    }
    albumItemHtml += `</ul></li>`;
    artistAlbumsListContainer.insertAdjacentHTML('beforeend', albumItemHtml);
  });

  // ===============================================
  // Стварэнне кнопак пагінацыі (за межамі ul.artist-albums-list, на адным узроўні з ім)
  // ===============================================
  const totalPages = Math.ceil(allAlbums.length / albumsPerPage);

  // Выдаліць старыя элементы пагінацыі, калі яны існуюць
  const existingPaginationControls = artistModal.querySelector(
    '.pagination-controls'
  );
  if (existingPaginationControls) {
    existingPaginationControls.remove();
  }

  if (totalPages > 1) {
    // Паказваем пагінацыю толькі калі больш адной старонкі
    const paginationControls = document.createElement('div');
    paginationControls.className = 'pagination-controls';

    const prevButton = document.createElement('button');
    prevButton.textContent = 'Попередня';
    prevButton.disabled = page === 1;
    prevButton.addEventListener('click', () => {
      currentAlbumPage--;
      renderAlbums(currentAlbumPage);
    });

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Наступна';
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

    // Дадаём пагінацыю пасля спісу альбомаў
    // Выкарыстоўваем insertAdjacentElement для лепшай сумяшчальнасці і яснасці
    if (artistAlbumsListContainer.parentElement) {
      artistAlbumsListContainer.parentElement.appendChild(paginationControls);
    } else {
      // Калі па нейкай прычыне artistAlbumsListContainer не мае бацькоўскага элемента,
      // што малаверагодна ў дадзеным кантэксце, можна дадаць яго пасля самога модала
      // або ў іншы даступны канэйнер.
      artistModal.appendChild(paginationControls);
    }
  }

  // ===============================================
  // Прывязваем падзеі да кнопак YouTube пасля абнаўлення DOM
  // ===============================================
  // Важна: шукаем кнопкі толькі ўнутры мадальнага акна, каб не ўплываць на іншыя часткі старонкі.
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
async function openArtistModal(artistId) {
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
  modalLoader.style.display = 'block'; // Паказваем лоадер

  // Ачыстка старога кантэнту перад загрузкай
  modalTitle.textContent = 'Загрузка...'; // Паказваем стан загрузкі
  heroArtistImg.src = ''; // Ачыстка выявы
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

  // Выкарыстоўваем правільны базавы URL API GoIT, які падтрымлівае CORS
  const API_BASE_URL = 'https://sound-wave.b.goit.study/api';
  // URL для атрымання інфармацыі пра канкрэтнага артыста па ID
  const artistDataEndpoint = `${API_BASE_URL}/artists/${artistId}`;

  try {
    const response = await axios.get(artistDataEndpoint);
    const data = response.data;

    modalLoader.style.display = 'none'; // Хаваем лоадер пасля атрымання дадзеных

    // Запаўняем асноўную інфармацыю пра артыста
    modalTitle.textContent = data.strArtist || 'Невядомы выканаўца';
    heroArtistImg.src =
      data.strArtistThumb ||
      'https://via.placeholder.com/250x250.png?text=No+Image'; // Заглушка
    heroArtistImg.alt = data.strArtist || 'Фота выканаўцы';

    // Інфармацыя пра артыста (годы, пол, удзельнікі, краіна)
    artistInfoList.innerHTML = `
                <li class="artist-info-item">
                    <h3>Гады актыўнасці</h3>
                    <p class="artist-info">${
                      data.intFormedYear || 'інфармацыя адсутнічае'
                    }</p>
                </li>
                <li class="artist-info-item">
                    <h3>Пол</h3>
                    <p class="artist-info">${
                      data.strGender || 'інфармацыя адсутнічае'
                    }</p>
                </li>
                <li class="artist-info-item">
                    <h3>Удзельнікі</h3>
                    <p class="artist-info">${
                      data.intMembers || 'інфармацыя адсутнічае'
                    }</p>
                </li>
                <li class="artist-info-item">
                    <h3>Краіна</h3>
                    <p class="artist-info">${
                      data.strCountry || 'інфармацыя адсутнічае'
                    }</p>
                </li>
            `;

    // Біяграфія (звярніце ўвагу, што біяграфія можа быць доўгай)
    artistBioParagraph.innerHTML =
      data.strBiographyEN || 'Біяграфія адсутнічае.';

    // Жанры (як масіў радкоў) - выпраўлена, цяпер яны прыходзяць як масіў 'genres'
    genresList.innerHTML = ''; // Ачыстка перад даданнем
    if (data.genres && data.genres.length > 0) {
      data.genres.forEach(genre => {
        const li = document.createElement('li');
        li.className = 'ganres-item'; // Ваш клас ganres-item
        li.textContent = genre; // Жанр - гэта радок
        genresList.appendChild(li);
      });
    } else {
      const li = document.createElement('li');
      li.className = 'ganres-item';
      li.textContent = 'Жанры адсутнічаюць';
      genresList.appendChild(li);
    }

    // ===============================================
    // НОВАЯ ЛОГІКА ДЛЯ АЛЬБОМАЎ З ПЕРАЎТВАРЭННЕМ ТРЭКАЎ
    // ===============================================
    if (data.tracks && data.tracks.length > 0) {
      // Групоўка трэкаў па альбомах
      const albumsMap = new Map();
      data.tracks.forEach(track => {
        const albumName = track.strAlbum || 'Невядомы альбом';
        const albumId = track.idAlbum; // Выкарыстоўваем ID альбома для унікальнасці
        if (!albumsMap.has(albumId)) {
          albumsMap.set(albumId, {
            strAlbum: albumName,
            intYearReleased: track.intYearReleased,
            idAlbum: albumId,
            tracks: [],
          });
        }
        albumsMap.get(albumId).tracks.push(track);
      });

      // Пераўтвараем Map у масіў і сартуем па годзе выпуску (змяншальна)
      allAlbums = Array.from(albumsMap.values()).sort((a, b) => {
        const yearA = parseInt(a.intYearReleased);
        const yearB = parseInt(b.intYearReleased);
        return yearB - yearA; // Сартаванне ад новых да старых
      });

      renderAlbums(currentAlbumPage); // Адлюстроўваем першую старонку
    } else {
      artistAlbumsListContainer.innerHTML = `<li class="artist-albums-item"><p>Інфармацыя пра альбомы адсутнічае.</p></li>`;
    }
  } catch (error) {
    modalLoader.style.display = 'none'; // Хаваем лоадер нават пры памылцы
    if (artistModal) {
      modalTitle.textContent = 'Памылка загрузкі дадзеных!';
      let errorMessage =
        'На жаль, не ўдалося загрузіць дадзеныя пра выканаўцу. ';
      if (axios.isAxiosError(error)) {
        if (error.response) {
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
// НОВАЯ ЛОГІКА ДЛЯ ДЫНАМІЧНАЙ ЗАГРУЗКІ І АДЛЮСТРАВАННЯ КАРТАК АРТЫСТАЎ
// (у секцыі "Нашыя выканаўцы")
// ===============================================
const artistsCardsContainer = document.getElementById(
  'artists-cards-container'
);

async function fetchAndRenderArtists() {
  if (!artistsCardsContainer) {
    console.error(
      'Кантэйнер для дынамічных картак артыстаў (#artists-cards-container) не знойдзены.'
    );
    return;
  }

  artistsCardsContainer.innerHTML =
    '<p class="loading-message">Загрузка выканаўцаў...</p>';

  try {
    // Запытваем спіс артыстаў. Абмежаванне на 9, калі трэба больш, змяніце 'limit'.
    const response = await axios.get(
      'https://sound-wave.b.goit.study/api/artists?limit=9'
    );
    // Ваш API вяртае спіс артыстаў напрамую ў data, не ў data.artists.
    // Аднак, калі API зменіцца і будзе вяртаць у data.artists, абодва варыянты будуць працаваць.
    const artists = response.data.artists || response.data || [];

    artistsCardsContainer.innerHTML = ''; // Ачышчаем паведамленне пра загрузку

    if (artists.length === 0) {
      artistsCardsContainer.innerHTML =
        '<p class="no-data-message">На жаль, не ўдалося загрузіць інфармацыю пра выканаўцаў.</p>';
      return;
    }

    artists.forEach(artist => {
      // Абыходжанне з доўгім апісаннем: абрэзаць да двух радкоў
      // Праверка на існаванне strBiographyEN, бо яна можа быць null
      const shortBio = artist.strBiographyEN
        ? artist.strBiographyEN.split('. ').slice(0, 2).join('. ') +
          (artist.strBiographyEN.split('. ').length > 2 ? '...' : '')
        : 'Кароткі апісанне адсутнічае.';

      // Жанры для адлюстравання ў картцы: толькі першыя два, калі ёсць
      // Выпраўлена: цяпер выкарыстоўваем artist.genres, якое з'яўляецца масівам радкоў
      const displayGenres =
        artist.genres && artist.genres.length > 0
          ? artist.genres.slice(0, 2).join(', ')
          : 'Без жанру';

      const artistCardHtml = `
                    <div class="artist-card">
                        <img src="${
                          artist.strArtistThumb ||
                          'https://via.placeholder.com/150x150?text=No+Image'
                        }"
                            alt="${artist.strArtist || 'Фота выканаўцы'}"
                            class="artist-card-img">
                        <div class="artist-card-content">
                            <h3>${artist.strArtist || 'Невядомы выканаўца'}</h3>
                            <p class="artist-card-genres">${displayGenres}</p>
                            <p class="artist-card-bio">${shortBio}</p>
                            <button class="learn-more-btn" data-artist-id="${
                              artist._id
                            }">Детальніше</button>
                        </div>
                    </div>
                `;
      artistsCardsContainer.insertAdjacentHTML('beforeend', artistCardHtml);
    });
  } catch (error) {
    console.error(
      'Памылка пры загрузцы выканаўцаў для секцыі "Artists":',
      error
    );
    artistsCardsContainer.innerHTML =
      '<p class="error-message">Памылка загрузкі выканаўцаў. Паспрабуйце абнавіць старонку.</p>';
    if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
      artistsCardsContainer.innerHTML +=
        '<p class="error-message">Магчыма, праблема з сеткай або CORS.</p>';
    }
  }
}

// ===============================================
// 7. Ініцыялізацыя апрацоўшчыкаў падзей
// ===============================================
document.addEventListener('DOMContentLoaded', () => {
  // Прымацоўваем апрацоўшчыкі падзей для закрыцця мадальнага акна
  if (closeModalButton) {
    closeModalButton.addEventListener('click', closeArtistModal);
  }
  if (artistModal) {
    artistModal.addEventListener('click', outsideClickHandler);
  }
  document.addEventListener('keydown', escapeKeyHandler);

  // Выклікаем загрузку артыстаў пры загрузцы DOM для секцыі "Нашыя выканаўцы"
  fetchAndRenderArtists();

  // Апрацоўка клікаў па кнопках "Детальніше" праз дэлегаванне падзей
  // Прымацоўваем апрацоўшчык да 'artists-cards-container', бо менавіта ў ім будуць дынамічныя карткі.
  const artistsSectionContainer = document.getElementById(
    'artists-cards-container'
  );

  if (artistsSectionContainer) {
    artistsSectionContainer.addEventListener('click', event => {
      const learnMoreBtn = event.target.closest('.learn-more-btn');

      if (learnMoreBtn) {
        const artistId = learnMoreBtn.dataset.artistId; // Атрымліваем ID артыста з data-атрыбута
        if (artistId) {
          console.log(
            'Націснута кнопка "Детальніше" для артыста ID:',
            artistId
          );
          openArtistModal(artistId);
        } else {
          console.warn(
            'Кнопка "Детальніше" не мае data-artist-id. Праверце HTML.'
          );
        }
      }
    });
  } else {
    console.error(
      'Кантэйнер для дынамічных артыстаў (#artists-cards-container) не знойдзены.'
    );
  }
});
