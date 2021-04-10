import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as yup from 'yup';
import initView from './view.js';
import contentUpdate from './updater.js';

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
  };

  const watched = initView(state, elements);

  yup.setLocale({
    string: {
      url: 'errors.badURL',
    },
  });
  const schema = yup.string().trim().url();

  const validateURL = (url) => {
    try {
      schema.validateSync(url);
      return null;
    } catch (err) {
      return err;
    }
  };

  elements.postsBox.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
      watched.preview.postId = e.target.dataset.id;
    }
  });

  elements.input.addEventListener('change', (e) => {
    const url = e.currentTarget.value;
    const error = validateURL(url);
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
    if (state.form.status === 'invalid') {
      return;
    }
    const double = watched.feeds.find((feed) => feed.sourceLink === sourceLink);
    if (double) {
      watched.form.status = 'invalid';
      watched.form.error = 'errors.addedAlready';
      return;
    }
    watched.form.status = 'downloading';
    contentUpdate(watched, sourceLink);
  });
};
export default app;
