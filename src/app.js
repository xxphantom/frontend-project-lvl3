import 'bootstrap/js/dist/util';
import 'bootstrap/js/dist/modal';
import * as yup from 'yup';
import initView from './view.js';
import localize from './localize';
import { periodicUpdateContent, getContent } from './getContent.js';

const initElements = () => {
  const elements = {
    formBox: document.querySelector('div.col-md-8'),
    feedsBox: document.querySelector('div.feeds'),
    postsBox: document.querySelector('div.posts'),
    form: document.querySelector('form.rss-form'),
    input: document.querySelector('input.form-control'),
    button: document.querySelector('button.btn-primary'),
    modal: {
      title: document.querySelector('h5.modal-title'),
      description: document.querySelector('div.modal-body'),
      link: document.querySelector('a.full-article'),
    },
  };
  return elements;
};

const postBoxHandler = ({ target }, watched) => {
  const { tagName, dataset } = target;
  if (!dataset.id) {
    return;
  }
  const { id } = dataset;
  if (tagName === 'BUTTON') {
    watched.preview = { postId: id };
  }
  watched.uiState.readPosts.add(id);
};

const formHandler = (e, watched) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const url = formData.get('url').trim();

  const errCode = 'badURL';
  const { url: doubledURL } = watched.feeds.find((feed) => feed.url === url) ?? '';
  const schema = yup.string().required(errCode).trim().url(errCode)
    .notOneOf([doubledURL], 'addedAlready');
  try {
    schema.validateSync(url);
  } catch (error) {
    watched.form = { status: 'notValid', error };
    return;
  }
  watched.form = { status: 'blocked', error: null };
  getContent(watched, url);
};

const app = () => {
  const i18next = localize();
  const promise = i18next.then((t) => {
    const elements = initElements();
    const state = {
      preview: { postId: null },
      form: {
        status: 'empty',
        error: null,
      },
      requestRSS: {
        status: 'idle',
        error: null,
      },
      feeds: [],
      posts: [],
      uiState: {
        readPosts: new Set(),
      },
    };
    const watched = initView(state, elements, t);
    periodicUpdateContent(watched);
    elements.postsBox.addEventListener('click', (e) => postBoxHandler(e, watched));
    elements.form.addEventListener('submit', (e) => formHandler(e, watched, elements));
  });
  return promise;
};

export default app;
