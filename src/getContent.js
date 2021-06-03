import axios from 'axios';
import parse from './parser.js';
import {
  _differenceBy, _uniqueId,
} from './utils.js';

const defaultInterval = 5000;
const proxyOrigins = 'https://hexlet-allorigins.herokuapp.com/get?disableCache=true';

const getProxiedURL = (url, proxy) => {
  const proxyURL = new URL(proxy);
  proxyURL.searchParams.set('url', url);
  return proxyURL.href;
};

export const periodicUpdateContent = (watched, updateInterval = defaultInterval) => {
  const promises = watched.feeds.map(({ url }) => {
    const queryURL = getProxiedURL(url, proxyOrigins);
    return axios.get(queryURL);
  });

  Promise.allSettled(promises)
    .then((results) => {
      results.forEach((result, i) => {
        const { feedId } = watched.feeds[i];
        if (result.status === 'rejected') {
          throw result.reason;
        }
        if (result.status === 'fulfilled') {
          const { contents } = result.value.data;
          const parsedData = parse(contents);
          const { items } = parsedData;
          const oldPosts = watched.posts.filter((post) => post.feedId === feedId);
          const newPosts = _differenceBy(items, oldPosts, ({ guid }) => guid);
          const newPostsWithFeedId = newPosts.map((post) => ({ ...post, feedId }));
          watched.posts.unshift(...newPostsWithFeedId);
        }
      });
    })
    .finally(setTimeout(() => periodicUpdateContent(watched), updateInterval));
};

export const getContent = (watched, url) => {
  const queryURL = getProxiedURL(url, proxyOrigins);
  watched.requestRSS = { status: 'requested', error: null };
  axios.get(queryURL)
    .then((response) => {
      const feedId = _uniqueId();
      if (!response.data) {
        const error = new Error('Parse error: response.data empty');
        error.isParseError = true;
        throw error;
      }
      const data = parse(response.data.contents);
      const { title, description, items } = data;
      const newFeedWithMeta = {
        url, feedId, title, description,
      };
      watched.feeds.unshift(newFeedWithMeta);
      const newPostsWithFeedId = items.map((post) => ({ ...post, feedId }));
      watched.posts.unshift(...newPostsWithFeedId);
      watched.requestRSS = { status: 'finished', error: null };
      watched.form = { status: 'idle', error: null };
    })
    .catch((error) => {
      watched.requestRSS = { status: 'failed', error };
    });
};
