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
export default rssParser;
