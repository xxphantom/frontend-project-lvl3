import * as yup from 'yup';

export const parser = (xmlString) => {
  const xmlParser = new DOMParser();
  const dom = xmlParser.parseFromString(xmlString, 'text/xml');
  const channelEl = dom.querySelector('channel');
  const postsEls = [...dom.querySelectorAll('item')];
  if (!channelEl) {
    throw Error('parseError');
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

const errCode = 'errors.badURL';
const schema = yup.string().required(errCode).trim().url(errCode);

export const inputValidate = (url) => {
  try {
    schema.validateSync(url);
    return null;
  } catch (err) {
    return err;
  }
};
