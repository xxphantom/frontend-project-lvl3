import 'bootstrap/js/dist/util';
import 'bootstrap/js/dist/modal';
import initView from './view.js';
import localize from './localize';
import { periodicUpdateContent, getContent } from './getContent.js';
import { inputValidate } from './utils.js';

const app = () => {
  const i18n = localize();
  const elements = {
    formBox: document.querySelector('div.col-md-8'),
    feedsBox: document.querySelector('div.feeds'),
    postsBox: document.querySelector('div.posts'),
    form: document.querySelector('form.rss-form'),
    input: document.querySelector('input.form-control'),
    button: document.querySelector('button.btn-primary'),
    modalEls: {
      title: document.querySelector('h5.modal-title'),
      description: document.querySelector('div.modal-body'),
      link: document.querySelector('a.full-article'),
    },
  };

  const state = {
    preview: { postId: null },
    form: { status: 'filling' },
    requestRSS: { status: null },
    feeds: [],
    posts: [],
    uiState: {
      posts: new Map(),
    },
  };

  const watched = initView(state, elements, i18n);
  periodicUpdateContent(watched);

  const postBoxHandler = ({ target }) => {
    const { tagName, dataset: { id } } = target;
    if (tagName !== 'A' && tagName !== 'BUTTON') {
      return;
    }

    if (tagName === 'BUTTON') {
      watched.preview = { postId: id };
    }
    watched.uiState.posts.set(id, { status: 'read' });
  };

  const formHandler = (e) => {
    e.preventDefault();
    const url = elements.input.value.trim();
    const error = inputValidate(url);
    if (error) {
      watched.form = { status: 'notValid' };
      return;
    }
    const doubledFeed = watched.feeds.find((feed) => feed.url === url);
    if (doubledFeed) {
      watched.requestRSS = { status: 'addedAlready' };
      return;
    }
    watched.form = { status: 'blocked' };
    getContent(watched, url);
  };

  elements.postsBox.addEventListener('click', postBoxHandler);
  elements.form.addEventListener('submit', formHandler);
};
export default app;
