import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
// import _ from 'lodash';
import * as yup from 'yup';
import axios from 'axios';
import initView from './view.js';

const app = () => {
  const serverOrigins = 'https://hexlet-allorigins.herokuapp.com/get?url=';
  const elements = {
    formBox: document.querySelector('div.col-md-8'),
    form: document.querySelector('form.rss-form'),
    input: document.querySelector('input.form-control'),
    button: document.querySelector('button.btn-primary'),
  };

  const state = {
    form: {
      status: 'filling',
      url: null,
      error: null,
    },
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
    const titleEl = dom.querySelector('channel > title');
    const descriptionEl = dom.querySelector('channel > description');
    const postsEls = [...dom.querySelectorAll('item')];

    if (!titleEl || !descriptionEl || postsEls.length === 0) {
      throw new Error('Некорректный формат RSS - проверьте источник');
    }

    const posts = postsEls.map((item) => {
      const title = item.querySelector('title').textContent;
      const description = item.querySelector('description').textContent;
      const url = item.querySelector('link').textContent;
      const id = item.querySelector('guid').textContent;
      const post = {
        title, description, url, id,
      };
      return post;
    });

    const parsedData = {
      channelTitle: titleEl.textContent,
      channelDescription: descriptionEl.textContent,
      posts,
    };

    return parsedData;
  };

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
    const url = elements.input.value.trim();
    if (state.form.status === 'invalid') {
      return;
    }
    watched.form.status = 'downloading';
    const rssURL = `${serverOrigins}${encodeURIComponent(url)}`;

    axios.get(rssURL)
      .then((response) => {
        const xmlString = response.data.contents;
        try {
          const channelData = rssParser(xmlString);
          console.dir(channelData);
          watched.form.status = 'success';
        } catch (err) {
          watched.form.status = 'parseFailed';
          watched.form.error = err.message;
        }
      })
      .catch(() => {
        watched.form.status = 'failed';
        watched.form.error = 'Похоже, возникли проблемы с сетью';
      });
  });
};
export default app;
