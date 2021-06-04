import localizeTemplate from './localize/template.js';
import onChange from 'on-change';
import render from './renderings.js';

const initView = (state, elements, i18n) => {
  localizeTemplate(i18n);

  const watched = onChange(state, (path) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Path: ${path}:`);
      console.dir(state);
    }
    render(state, path, elements, i18n);
  });
  return watched;
};

export default initView;
