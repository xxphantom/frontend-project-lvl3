import * as yup from 'yup';
import _truncate from 'lodash/truncate';
import _differenceBy from 'lodash/differenceBy';
import _uniqueId from 'lodash/uniqueId';

const propsAllowList = ['title', 'description', 'link', 'guid'];

const domEltoObj = (el) => {
  const obj = propsAllowList.reduce((acc, propName) => {
    if (el.querySelector(`${el.tagName} > ${propName}`) !== null) {
      acc[propName] = el.querySelector(propName).textContent;
    }
    return acc;
  }, {});
  return obj;
};

const parse = (xmlString) => {
  const xmlParser = new DOMParser();
  const dom = xmlParser.parseFromString(xmlString, 'text/xml');
  const channelEl = dom.querySelector('channel');
  const postsEls = [...dom.querySelectorAll('item')];
  if (!channelEl) {
    throw Error('parseError');
  }
  const feed = domEltoObj(channelEl);
  const posts = postsEls.map(domEltoObj);
  return {
    feed, posts,
  };
};

const errCode = 'badURL';
const schema = yup.string().required(errCode).trim().url(errCode);
const inputValidate = (url) => {
  try {
    schema.validateSync(url);
    return null;
  } catch (err) {
    return err;
  }
};

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

export {
  initElements, inputValidate, parse, _differenceBy, _uniqueId, _truncate,
};
