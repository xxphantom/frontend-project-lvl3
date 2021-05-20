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
  const itemsEls = [...dom.querySelectorAll('item')];
  const { title, description } = domEltoObj(channelEl);
  const items = itemsEls.map(domEltoObj);
  return { title, description, items };
};

export {
  parse, _differenceBy, _uniqueId, _truncate,
};
