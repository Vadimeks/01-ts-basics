// js/hero.js
import axios from 'axios';

document.addEventListener('DOMContentLoaded', () => {
  // === ЛОГІКА ДЛЯ ЗАГРУЗКІ МАЛЮНКАЎ АРТЫСТАЎ У HERO-СЕКЦЫЮ ===
  const heroColumnOne = document.querySelector('.hero-column-one');
  const heroColumnTwo = document.querySelector('.hero-column-two');

  const API_BASE_URL = 'https://sound-wave.b.goit.study/api';

  async function fetchHeroArtists() {
    try {
      // Запытваем 6 артыстаў для Hero-секцыі
      const response = await axios.get(`${API_BASE_URL}/artists?limit=6`);
      // API вяртае аб'ект з полем 'artists' або наўпрост масіў
      const artists = response.data.artists || response.data || [];
      return artists;
    } catch (error) {
      console.error('Памылка пры загрузцы артыстаў для Hero-секцыі:', error);
      return [];
    }
  }

  async function displayHeroArtists() {
    const artists = await fetchHeroArtists();

    if (artists.length === 0) {
      console.warn(
        'Няма дадзеных пра артыстаў для адлюстравання ў Hero-секцыі. Праверце API.'
      );
      return;
    }

    const columnOneArtists = artists.slice(0, 3);
    const columnTwoArtists = artists.slice(3, 6);

    function populateColumn(columnElement, artistData) {
      const imgElements = columnElement.querySelectorAll('.hero-artist-img');
      artistData.forEach((artist, index) => {
        if (imgElements[index]) {
          imgElements[index].src =
            artist.strArtistThumb ||
            'https://via.placeholder.com/150x150?text=No+Image';
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
