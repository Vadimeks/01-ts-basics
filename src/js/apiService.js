// apiService.js
import axios from 'axios';

const API_BASE_URL = 'https://sound-wave.b.goit.study/api';

/**
 * Атрымлівае спіс жанраў.
 * @returns {Promise<Array>} - Масіў аб'ектаў жанраў.
 */
export async function fetchGenres() {
  try {
    const response = await axios.get(`${API_BASE_URL}/genres`);
    return response.data;
  } catch (error) {
    console.error('Памылка пры загрузцы спісу жанраў:', error);
    throw error;
  }
}

/**
 * Атрымлівае спіс артыстаў з пагінацыяй.
 * @param {number} limit - Колькасць артыстаў на старонку.
 * @param {number} page - Нумар старонкі.
 * @returns {Promise<Object>} - Аб'ект з масівам артыстаў, агульнай колькасцю і інфармацыяй аб пагінацыі.
 */
export async function fetchArtists(limit = 10, page = 1) {
  try {
    const response = await axios.get(`${API_BASE_URL}/artists`, {
      params: { limit, page },
    });
    return response.data; // { artists: [], totalArtists: number, page: string, limit: string }
  } catch (error) {
    console.error('Памылка пры загрузцы спісу артыстаў:', error);
    throw error;
  }
}

/**
 * Атрымлівае падрабязную інфармацыю пра артыста па ID.
 * Гэты эндпоінт, як бачна з вашых дадзеных, уключае 'albumsList'.
 * @param {string} artistId - ID артыста.
 * @returns {Promise<Object>} - Аб'ект з падрабязнай інфармацыяй пра артыста.
 */
export async function fetchArtistDetailsWithAlbums(artistId) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/artists/${artistId}/albums`
    );
    return response.data; // Уключае albumsList
  } catch (error) {
    console.error(
      `Памылка пры загрузцы дэталяў артыста з альбомамі (ID: ${artistId}):`,
      error
    );
    throw error;
  }
}

/**
 * Атрымлівае падрабязную інфармацыю пра артыста па ID.
 * Гэты эндпоінт, як бачна з вашых дадзеных, уключае 'tracksList'.
 * @param {string} artistId - ID артыста.
 * @returns {Promise<Object>} - Аб'ект з падрабязнай інфармацыяй пра артыста.
 */
export async function fetchArtistDetailsWithTracks(artistId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/artists/${artistId}`); // Эндпоінт /artists/{id} вяртае tracksList
    return response.data; // Уключае tracksList
  } catch (error) {
    console.error(
      `Памылка пры загрузцы дэталяў артыста з трэкамі (ID: ${artistId}):`,
      error
    );
    throw error;
  }
}

/**
 * Адпраўляе новы водгук.
 * @param {Object} feedbackData - Аб'ект з дадзенымі водгуку.
 * @param {string} feedbackData.name - Імя карыстальніка.
 * @param {number} feedbackData.rating - Рэйтынг (напрыклад, ад 1 да 5).
 * @param {string} feedbackData.descr - Апісанне/каментар.
 * @returns {Promise<Object>} - Аб'ект з паведамленнем аб апрацоўцы.
 */
export async function submitFeedback(feedbackData) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/feedbacks`,
      feedbackData
    );
    return response.data; // { message: "Feedback is processed" }
  } catch (error) {
    console.error('Памылка пры адпраўцы водгуку:', error);
    throw error;
  }
}

/**
 * Атрымлівае спіс водгукаў з пагінацыяй.
 * @param {number} limit - Колькасць водгукаў на старонку.
 * @param {number} page - Нумар старонкі.
 * @returns {Promise<Object>} - Аб'ект з масівам водгукаў, агульнай колькасцю і інфармацыяй аб пагінацыі.
 */
export async function fetchFeedbacks(limit = 10, page = 1) {
  try {
    const response = await axios.get(`${API_BASE_URL}/feedbacks`, {
      params: { limit, page },
    });
    return response.data; // { data: [], total: number, page: string, limit: string }
  } catch (error) {
    console.error('Памылка пры загрузцы спісу водгукаў:', error);
    throw error;
  }
}

// Функцыі для рэгістрацыі і ўваходу (пакуль без рэалізацыі, бо не было падрабязных прыкладаў адказу)
// Іх варта дадаць, калі будзе патрэба і вы дасце больш інфармацыі пра іх выкарыстанне і апрацоўку apiKey.

/**
 * Рэгістрацыя карыстальніка.
 * @param {Object} userData - Дадзеныя для рэгістрацыі.
 * @param {string} userData.email - Адрас электроннай пошты.
 * @param {string} userData.password - Пароль.
 * @returns {Promise<Object>} - Аб'ект з apiKey.
 */
export async function registerUser(userData) {
  try {
    // Рэалізацыя запыту для рэгістрацыі.
    // Меркаваны эндпоінт і структура:
    const response = await axios.post(`${API_BASE_URL}/register`, userData); // Мяркуемы эндпоінт
    return response.data; // { apiKey: "..." }
  } catch (error) {
    console.error('Памылка пры рэгістрацыі карыстальніка:', error);
    throw error;
  }
}

/**
 * Уваход карыстальніка.
 * @param {Object} credentials - Уліковыя дадзеныя карыстальніка.
 * @param {string} credentials.email - Адрас электроннай пошты.
 * @param {string} credentials.password - Пароль.
 * @returns {Promise<Object>} - Аб'ект з apiKey.
 */
export async function loginUser(credentials) {
  try {
    // Рэалізацыя запыту для ўваходу.
    // Меркаваны эндпоінт і структура:
    const response = await axios.post(`${API_BASE_URL}/login`, credentials); // Мяркуемы эндпоінт
    return response.data; // { apiKey: "..." }
  } catch (error) {
    console.error('Памылка пры ўваходзе карыстальніка:', error);
    throw error;
  }
}
