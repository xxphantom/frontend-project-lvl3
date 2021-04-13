import 'bootstrap';
import initView from './view.js';
import { watchForUpdate, getContent } from './getContent.js';
import { inputValidate } from './utils.js';

const app = () => {
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
    preview: {
      postId: null,
    },
    form: {
      status: 'filling',
      url: null,
      error: null,
      feedback: null,
    },
    feeds: [],
    posts: [],
    uiState: {
      posts: {},
    },
  };

  const watched = initView(state, elements);
  watchForUpdate(watched);

  elements.postsBox.addEventListener('click', (e) => {
    const postId = e.target.dataset.id;
    if (e.target.tagName === 'BUTTON') {
      watched.preview.postId = postId;
      watched.uiState.posts = watched.uiState.posts.map((post) => {
        if (post.id === postId) {
          return ({ id: postId, status: 'read' });
        }
        return post;
      });
    }
    if (e.target.tagName === 'A') {
      watched.uiState.posts = watched.uiState.posts.map((post) => {
        if (post.id === postId) {
          return ({ id: postId, status: 'read' });
        }
        return post;
      });
    }
  });

  elements.input.addEventListener('change', (e) => {
    const url = e.currentTarget.value;
    const error = inputValidate(url);
    if (!error) {
      watched.form.status = 'filling';
      watched.form.error = null;
    } else {
      watched.form.status = 'invalid';
      watched.form.error = error.message;
    }
  });

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const sourceLink = elements.input.value.trim();
    const error = inputValidate(sourceLink);
    if ((error)) {
      watched.form.status = 'invalid';
      watched.form.error = error.message;
      return;
    }
    const double = watched.feeds.find((feed) => feed.sourceLink === sourceLink);
    if (double) {
      watched.form.status = 'invalid';
      watched.form.error = 'errors.addedAlready';
      return;
    }
    watched.form.status = 'downloading';
    getContent(watched, sourceLink);
  });
};
export default app;
