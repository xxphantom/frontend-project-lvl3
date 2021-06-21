import axios from 'axios';
import _differenceBy from 'lodash/differenceBy';
import _uniqueId from 'lodash/uniqueId';
import parse from './parser.js';

const getProxiedURL = (url) => {
  const proxyURL = new URL('https://hexlet-allorigins.herokuapp.com/get?disableCache=true');
  proxyURL.searchParams.set('url', url);
  return proxyURL.href;
};

const updateFeed = (watched, feedData, feedId) => {
  const { items } = feedData;
  const oldPosts = watched.posts.filter((post) => post.feedId === feedId);
  const newPosts = _differenceBy(items, oldPosts, ({ guid }) => guid);
  const newPostsWithFeedId = newPosts.map((post) => ({ ...post, feedId }));
  watched.posts.unshift(...newPostsWithFeedId);
};

export const periodicUpdateContent = (watched, interval) => {
  const promises = watched.feeds.map(({ url }) => {
    const queryURL = getProxiedURL(url);
    return axios.get(queryURL);
  });
  Promise.all(promises)
    .then((responses) => {
      responses.forEach((response, i) => {
        const { feedId } = watched.feeds[i];
        if (!response.data) {
          console.error('Parse error: response.data empty');
        } else {
          const { contents } = response.data;
          const feedData = parse(contents);
          updateFeed(watched, feedData, feedId);
        }
      });
    })
    .finally(setTimeout(() => (
      periodicUpdateContent(watched, interval)
    ), interval));
};

const addFeed = (watched, feedData, url) => {
  const feedId = _uniqueId();
  const { title, description } = feedData;
  const newFeedWithMeta = {
    url, feedId, title, description,
  };
  watched.feeds.unshift(newFeedWithMeta);
  updateFeed(watched, feedData, feedId);
};

export const getContent = (watched, url) => {
  const queryURL = getProxiedURL(url);
  watched.requestRSS = { status: 'requested', error: null };
  axios.get(queryURL)
    .then((response) => {
      if (!response.data) {
        const error = new Error('Parse error: response.data empty');
        error.isParseError = true;
        throw error;
      }
      const { contents } = response.data;
      const feedData = parse(contents);
      addFeed(watched, feedData, url);
      watched.requestRSS = { status: 'finished', error: null };
      watched.form = { status: 'idle', error: null };
      watched.form2 = {};
    })
    .catch((error) => {
      watched.requestRSS = { status: 'failed', error };
    });
};
