import * as yup from 'yup';

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

export const parse = (xmlString) => {
  const xmlParser = new DOMParser();
  const dom = xmlParser.parseFromString(xmlString, 'text/xml');
  const channelEl = dom.querySelector('channel');
  const postsEls = [...dom.querySelectorAll('item')];
  if (!channelEl) {
    throw Error('parseError');
  }

  const channelProps = domEltoObj(channelEl);
  const posts = postsEls.map(domEltoObj);

  return {
    feed: channelProps,
    posts,
  };
};

const errCode = 'badURL';
const schema = yup.string().required(errCode).trim().url(errCode);

export const inputValidate = (url) => {
  try {
    schema.validateSync(url);
    return null;
  } catch (err) {
    return err;
  }
};
