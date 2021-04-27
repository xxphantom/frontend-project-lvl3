import 'bootstrap/js/dist/util';
import 'bootstrap/js/dist/modal';
import initView from './view.js';
import localize from './localize';
import { periodicUpdateContent, getContent } from './getContent.js';
import { inputValidate } from './utils.js';

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
  const { tagName, dataset: { id } } = target;
  if (tagName !== 'A' && tagName !== 'BUTTON') {
    return;
  }

  if (tagName === 'BUTTON') {
    watched.preview = { postId: id };
  }
  watched.uiState.readPosts.add(id);
};

const formHandler = (e, watched, elements) => {
  e.preventDefault();
  const url = elements.input.value.trim();
  const error = inputValidate(url);
  if (error) {
    watched.form = { status: 'notValid' };
    return;
  }
  const doubleFeed = watched.feeds.find((feed) => feed.url === url);
  if (doubleFeed) {
    watched.requestRSS = { status: 'addedAlready' };
    return;
  }
  watched.form = { status: 'blocked' };
  getContent(watched, url);
};

const app = () => {
  const i18n = localize();
  const elements = initElements();

  const state = {
    preview: { postId: null },
    form: { status: 'empty' },
    requestRSS: { status: null },
    feeds: [],
    posts: [],
    uiState: {
      readPosts: new Set(),
    },
    error: null,
  };

  const watched = initView(state, elements, i18n);
  periodicUpdateContent(watched);
  elements.postsBox.addEventListener('click', (e) => postBoxHandler(e, watched));
  elements.form.addEventListener('submit', (e) => formHandler(e, watched, elements));
};

export default app;
