import i18next from 'i18next';
// import LanguageDetector from 'i18next-browser-languagedetector';
import en from '../locales/en.js';
import ru from '../locales/ru.js';

const options = {
  fallbackLng: 'en',
  lng: 'ru',
  resources: {
    en: {
      translation: en,
    },
    ru: {
      translation: ru,
    },
  },
};

const localize = () => {
  // i18next.use(LanguageDetector).init(options);
  i18next.init(options);
  return i18next;
};

export default localize;
