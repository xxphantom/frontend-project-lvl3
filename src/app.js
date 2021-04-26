import 'bootstrap/js/dist/util';
import 'bootstrap/js/dist/modal';
import initView from './view.js';
import localize from './localize';
import { periodicUpdateContent, getContent } from './getContent.js';
import { inputValidate, initElements } from './utils.js';

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
