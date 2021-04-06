import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import _ from 'lodash';
import * as yup from 'yup';
import axios from 'axios';
import initView from './view.js';
import localize from './localize.js';

const app = () => {
  const serverOrigins = 'https://hexlet-allorigins.herokuapp.com/get?url=';
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

  localize();

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

  const schema = yup.string().trim().url();

  const validateURL = (url) => {
    try {
      schema.validateSync(url);
      return null;
    } catch (err) {
      return err;
    }
  };

  const rssParser = (xmlString) => {
    const parser = new DOMParser();
    const dom = parser.parseFromString(xmlString, 'text/xml');
    const channelEl = dom.querySelector('channel');
    const postsEls = [...dom.querySelectorAll('item')];
    if (!channelEl) {
      throw Error('Ресурс не содержит валидный RSS');
    }
    const propsWhiteList = ['title', 'description', 'link', 'guid'];

    const domEltoObj = (el) => {
      const obj = propsWhiteList.reduce((acc, propName) => {
        if (el.querySelector(`${el.tagName} > ${propName}`) !== null) {
          acc[propName] = el.querySelector(propName).textContent;
        }
        return acc;
      }, {});
      return obj;
    };

    const channelProps = domEltoObj(channelEl);
    const posts = postsEls.map(domEltoObj);

    return {
      ...channelProps,
      posts,
    };
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
      watched.form.error = 'Проверьте корректность ввода URL';
    }
  });

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const feedSourceURL = elements.input.value.trim();
    if (state.form.status === 'invalid') {
      return;
    }
    const double = watched.feeds.find((feed) => feed.feedSourceURL === feedSourceURL);
    if (double) {
      watched.form.status = 'invalid';
      watched.form.error = 'Данный источник уже добавлен в список фидов';
      return;
    }
    watched.form.status = 'downloading';
    const queryURL = `${serverOrigins}${encodeURIComponent(feedSourceURL)}`;

    axios.get(queryURL)
      .then((response) => {
        const xmlString = response.data.contents;
        try {
          const feedId = _.uniqueId();
          const feedData = rssParser(xmlString);
          watched.feeds = [...watched.feeds, {
            feedSourceURL,
            feedId,
            title: feedData.title,
            description: feedData.description,
          }];
          watched.posts = [...watched.posts,
            ...feedData.posts.map((post) => ({ ...post, feedId }))];
          watched.form.status = 'success';
          watched.form.feedback = 'RSS успешно загружен!';
        } catch (err) {
          watched.form.status = 'parseFailed';
          watched.form.error = err.message;
        }
      })
      .catch((err) => {
        watched.form.status = 'failed';
        watched.form.error = err.message;
      });
  });
};
export default app;
