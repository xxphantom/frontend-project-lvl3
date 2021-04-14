import 'bootstrap';
import initView from './view.js';
import { periodicUpdateContent, getContent } from './getContent.js';
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
      posts: [],
    },
  };

  const watched = initView(state, elements);
  periodicUpdateContent(watched);

  const postBoxHandler = ({ target }) => {
    const { tagName, dataset: { id } } = target;
    if (tagName === 'LI') {
      return;
    }
    if (tagName === 'BUTTON') {
      watched.preview.postId = id;
    }
    watched.uiState.posts = watched.uiState.posts.map((post) => {
      if (post.id === id) {
        return ({ id, status: 'read' });
      }
      return post;
    });
  };

  const formHandler = (e) => {
    e.preventDefault();
    const sourceLink = elements.input.value.trim();
    const error = inputValidate(sourceLink);
    if ((error)) {
      watched.form.status = 'invalid';
      watched.form.error = error.message;
      return;
    }
    const doubledFeed = watched.feeds.find((feed) => feed.sourceLink === sourceLink);
    if (doubledFeed) {
      watched.form.status = 'invalid';
      watched.form.error = 'errors.addedAlready';
      return;
    }
    watched.form.error = null;
    watched.form.feedback = null;
    watched.form.status = 'downloading';
    getContent(watched, sourceLink);
  };

  elements.postsBox.addEventListener('click', postBoxHandler);
  elements.form.addEventListener('submit', formHandler);
};
export default app;
