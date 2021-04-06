import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import eng from '../locales/en.js';
import rus from '../locales/ru.js';

const localize = () => {
  i18next.use(LanguageDetector)
    .init({
      fallbackLng: 'en',
      debug: true,
      resources: {
        en: {
          translation: eng,
        },
        ru: {
          translation: rus,
        },
      },
    }).then((t) => {
      const sample = document.querySelector('p.text-muted');
      sample.textContent = t('sample');
    });
};

export default localize;
