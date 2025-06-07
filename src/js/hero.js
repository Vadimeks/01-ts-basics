// hero-images.js
document.addEventListener('DOMContentLoaded', () => {
  // === ЛОГІКА ДЛЯ ЗАГРУЗКІ МАЛЮНКАЎ АРТЫСТАЎ ===
  const heroColumnOne = document.querySelector('.hero-column-one');
  const heroColumnTwo = document.querySelector('.hero-column-two');

  async function fetchArtists() {
    try {
      const response = await fetch(
        'https://sound-wave.b.goit.study/api/artists?limit=6'
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.artists || [];
    } catch (error) {
      console.error('Памылка пры загрузцы артыстаў:', error);
      return [];
    }
  }

  async function displayHeroArtists() {
    const artists = await fetchArtists();

    if (artists.length === 0) {
      console.warn(
        'Няма дадзеных пра артыстаў для адлюстравання ў Hero-секцыі.'
      );
      return;
    }

    const columnOneArtists = artists.slice(0, 3);
    const columnTwoArtists = artists.slice(3, 6);

    function populateColumn(columnElement, artistData) {
      const imgElements = columnElement.querySelectorAll('.hero-artist-img');
      artistData.forEach((artist, index) => {
        if (imgElements[index]) {
          imgElements[index].src = artist.strArtistThumb;
          imgElements[index].alt = artist.strArtist || 'Artist photo';
        }
      });
    }

    populateColumn(heroColumnOne, columnOneArtists);
    populateColumn(heroColumnTwo, columnTwoArtists);
  }

  // Выклікаем функцыю для адлюстравання малюнкаў пры загрузцы DOM
  displayHeroArtists();

  // --- НОВАЯ ЛОГІКА ДЛЯ КНОПКІ "EXPLORE ARTISTS" ---
  const exploreBtn = document.querySelector('.explore-btn');

  if (exploreBtn) {
    exploreBtn.addEventListener('click', event => {
      // event.preventDefault(); // Гэта можна выкарыстоўваць, калі кнопка ўнутры формы,
      // каб прадухіліць адпраўку формы

      const targetSectionId = 'artists'; // ID вашай секцыі Artists
      const targetSection = document.getElementById(targetSectionId);

      if (targetSection) {
        targetSection.scrollIntoView({
          behavior: 'smooth', // Плаўная пракрутка
        });
      } else {
        console.warn(`Секцыя з ID "${targetSectionId}" не знойдзена.`);
      }
    });
  }
});
