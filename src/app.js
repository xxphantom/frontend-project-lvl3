import 'bootstrap/js/dist/tooltip';
import 'bootstrap/js/dist/modal';
import axios from 'axios';
import _differenceBy from 'lodash/differenceBy';
import _uniqueId from 'lodash/uniqueId';
import * as yup from 'yup';
import parse from './parser.js';
import initView from './view.js';
import localize from './localize';

const updateInterval = 5000;

const getProxiedURL = (url) => {
  const requestURL = new URL('/get', 'https://hexlet-allorigins.herokuapp.com');
  requestURL.searchParams.set('disableCache', true);
  requestURL.searchParams.set('url', url);
  return requestURL.href;
};

const updateFeedState = (watched, feedData, feedId) => {
  const { items } = feedData;
  const oldPosts = watched.posts.filter((post) => post.feedId === feedId);
  const newPosts = _differenceBy(items, oldPosts, ({ guid }) => guid);
  const newPostsWithFeedId = newPosts.map((post) => ({ ...post, feedId }));
  watched.posts.unshift(...newPostsWithFeedId);
};

const updateFeed = (watched, url, feedId) => {
  const requestURL = getProxiedURL(url);
  const result = axios.get(requestURL);
  return result.then((response) => {
    if (!response.data) {
      console.error('Parse error: response.data empty');
    } else {
      const { contents } = response.data;
      const feedData = parse(contents);
      updateFeedState(watched, feedData, feedId);
    }
  })
    .catch((e) => {
      console.error(e.message);
    });
};

const periodicUpdateContent = (watched, interval) => {
  const promises = watched.feeds.map(({ url, feedId }) => updateFeed(watched, url, feedId));
  Promise.all(promises)
    .finally(setTimeout(() => (
      periodicUpdateContent(watched, interval)
    ), interval));
};

const addFeed = (watched, url) => {
  const requestURL = getProxiedURL(url);
  const feedId = _uniqueId();
  watched.requestRSS = { status: 'requested', error: null };
  axios.get(requestURL)
    .then((response) => {
      if (!response.data) {
        const error = new Error('Parse error: response.data empty');
        error.isParseError = true;
        throw error;
      }
      const { contents } = response.data;
      const feedData = parse(contents);
      const { title, description } = feedData;
      const newFeedWithMeta = {
        url, feedId, title, description,
      };
      watched.feeds.unshift(newFeedWithMeta);
      updateFeedState(watched, feedData, feedId);
      watched.requestRSS = { status: 'finished', error: null };
      watched.form = { status: 'idle', error: null };
    })
    .catch((error) => {
      watched.requestRSS = { status: 'failed', error };
    });
};

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
  addFeed(watched, url);
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
