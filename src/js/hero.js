// js/hero.js
import { fetchArtists } from './apiService.js'; // Імпартуем нашу функцыю з apiService.js

document.addEventListener('DOMContentLoaded', () => {
  // === ЛОГІКА ДЛЯ ЗАГРУЗКІ МАЛЮНКАЎ АРТЫСТАЎ У HERO-СЕКЦЫЮ ===
  const heroColumnOne = document.querySelector('.hero-column-one');
  const heroColumnTwo = document.querySelector('.hero-column-two');

  async function displayHeroArtists() {
    let artists = [];
    try {
      // Запытваем першых 6 артыстаў (limit=6, page=1)
      const response = await fetchArtists(6, 1);
      artists = response.artists || []; // Атрымліваем масіў артыстаў
    } catch (error) {
      console.error('Памылка пры загрузцы артыстаў для Hero-секцыі:', error);
      // Калі памылка, застанецца пусты масіў, і папярэджанне выведзецца ніжэй
    }

    if (artists.length === 0) {
      console.warn(
        'Няма дадзеных пра артыстаў для адлюстравання ў Hero-секцыі. Праверце API ці даступнасць дадзеных.'
      );
      return;
    }

    // Дзелім атрыманых артыстаў на дзве калонкі
    const columnOneArtists = artists.slice(0, 3);
    const columnTwoArtists = artists.slice(3, 6);

    function populateColumn(columnElement, artistData) {
      const imgElements = columnElement.querySelectorAll('.hero-artist-img');
      artistData.forEach((artist, index) => {
        if (imgElements[index]) {
          imgElements[index].src =
            artist.strArtistThumb ||
            'https://via.placeholder.com/150x150?text=No+Image'; // Запасны малюнак, калі фота няма
          imgElements[index].alt = artist.strArtist || 'Artist photo';
        }
      });
    }

    if (heroColumnOne) {
      populateColumn(heroColumnOne, columnOneArtists);
    }
    if (heroColumnTwo) {
      populateColumn(heroColumnTwo, columnTwoArtists);
    }
  }

  // Выклікаем функцыю для адлюстравання малюнкаў пры загрузцы DOM
  displayHeroArtists();

  // --- ЛОГІКА ДЛЯ КНОПКІ "EXPLORE ARTISTS" ---
  const exploreBtn = document.querySelector('.explore-btn');
  const artistsSection = document.getElementById('artists-section'); // Атрымліваем секцыю артыстаў

  if (exploreBtn && artistsSection) {
    exploreBtn.addEventListener('click', event => {
      // event.preventDefault(); // Залежыць ад таго, дзе кнопка размешчана
      artistsSection.scrollIntoView({
        behavior: 'smooth', // Плаўная пракрутка
      });
    });
  } else if (!artistsSection) {
    console.warn(
      `Секцыя з ID "artists-section" не знойдзена для кнопкі Explore.`
    );
  }
});
