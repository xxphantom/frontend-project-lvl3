import axios from 'axios';
import _differenceBy from 'lodash/differenceBy';
import _uniqueId from 'lodash/uniqueId';
import parse from './parser.js';

const getProxiedURL = (url) => {
  const requestURL = new URL('/get', 'https://hexlet-allorigins.herokuapp.com');
  requestURL.searchParams.set('disableCache', true);
  requestURL.searchParams.set('url', url);
  return requestURL.href;
};

const updateFeedState = (watched, feedData, feedId) => {
  const { items } = feedData;
  const oldPosts = watched.posts.filter((post) => post.feedId === feedId);
  const newPosts = _differenceBy(items, oldPosts, ({ guid }) => guid);
  const newPostsWithFeedId = newPosts.map((post) => ({ ...post, feedId }));
  watched.posts.unshift(...newPostsWithFeedId);
};

const updateFeed = (watched, url, feedId) => {
  const requestURL = getProxiedURL(url);
  const result = axios.get(requestURL);
  return result.then((response) => {
    if (!response.data) {
      console.error('Parse error: response.data empty');
    } else {
      const { contents } = response.data;
      const feedData = parse(contents);
      updateFeedState(watched, feedData, feedId);
    }
  })
    .catch((e) => {
      console.error(e.message);
    });
};

export const periodicUpdateContent = (watched, interval) => {
  const promises = watched.feeds.map(({ url, feedId }) => updateFeed(watched, url, feedId));
  Promise.all(promises)
    .finally(setTimeout(() => (
      periodicUpdateContent(watched, interval)
    ), interval));
};

const addFeed = (watched, url) => {
  const requestURL = getProxiedURL(url);
  const feedId = _uniqueId();
  axios.get(requestURL)
    .then((response) => {
      if (!response.data) {
        const error = new Error('Parse error: response.data empty');
        error.isParseError = true;
        throw error;
      }
      const { contents } = response.data;
      const feedData = parse(contents);
      const { title, description } = feedData;
      const newFeedWithMeta = {
        url, feedId, title, description,
      };
      watched.feeds.unshift(newFeedWithMeta);
      updateFeedState(watched, feedData, feedId);
      watched.requestRSS = { status: 'finished', error: null };
      watched.form = { status: 'idle', error: null };
    })
    .catch((error) => {
      watched.requestRSS = { status: 'failed', error };
    });
};

export const getContent = (watched, url) => {
  watched.requestRSS = { status: 'requested', error: null };
  addFeed(watched, url);
};
