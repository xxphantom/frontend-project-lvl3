import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
// import _ from 'lodash';
import * as yup from 'yup';
import initView from './view.js';

const app = () => {
  const elements = {
    form: document.querySelector('form.rss-form'),
    input: document.querySelector('input.form-control'),
  };

  const state = {
    form: {
      status: 'filling',
    },
  };

  const watched = initView(state, elements);

  const schema = yup.string().trim().url();

  const validateInput = (url) => {
    schema.isValid(url)
      .then((valid) => {
        if (valid) {
          watched.form.status = 'filling';
        } else {
          watched.form.status = 'invalid';
        }
      });
  };

  elements.input.addEventListener('change', (e) => {
    const url = e.currentTarget.value;
    validateInput(url);
  });
};
export default app;
