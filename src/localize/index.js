import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from '../locales/en.js';
import ru from '../locales/ru.js';

const options = {
  debug: process.env.NODE_ENV !== 'production',
  lng: process.env.NODE_ENV === 'test' ? 'ru' : null,
  fallbackLng: 'en',
  initImmediate: false,
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
  const i18nInstance = i18next.createInstance();
  const promise = i18nInstance.use(LanguageDetector).init(options);
  return promise;
};

export default localize;
