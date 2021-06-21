import 'bootstrap/js/dist/tooltip';
import 'bootstrap/js/dist/modal';
import * as yup from 'yup';
import initView from './view.js';
import localize from './localize';
import { periodicUpdateContent, getContent } from './getContent.js';

const updateInterval = 5000;

const initElements = () => {
  const elements = {
    formBox: document.querySelector('div.col-md-10'),
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

const validateInput = (inputData, watched) => {
  const errCode = 'badURL';
  const schema = yup.string().required(errCode).trim().url(errCode)
    .notOneOf(watched.feeds.map(({ url }) => url), 'addedAlready');
  try {
    schema.validateSync(inputData);
    return null;
  } catch (error) {
    error.isValidation = true;
    return error;
  }
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
  const error = validateInput(url, watched);
  if (error) {
    watched.form = { status: 'invalid', error };
    return;
  }
  watched.form = { status: 'valid', error: null };
  getContent(watched, url);
};

const app = () => {
  const i18next = localize();
  const promise = i18next.then((t) => {
    const elements = initElements();
    const state = {
      preview: { postId: null },
      form: {
        status: 'idle',
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
    periodicUpdateContent(watched, updateInterval);
    elements.postsBox.addEventListener('click', (e) => postBoxHandler(e, watched));
    elements.form.addEventListener('submit', (e) => formHandler(e, watched, elements));
  });
  return promise;
};

export default app;
