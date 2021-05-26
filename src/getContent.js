import axios from 'axios';
import {
  parse, _differenceBy, _uniqueId,
} from './utils.js';

const updateInterval = 5000;
const serverOrigins = 'https://hexlet-allorigins.herokuapp.com/get?disableCache=true';

const addFeedDataToState = (watched, parsedData, currentFeedId, url = null) => {
  const { title, description, items } = parsedData;
  const newPosts = [];
  if (!url) {
    const oldPosts = watched.posts.filter((post) => post.feedId === currentFeedId);
    newPosts.push(..._differenceBy(items, oldPosts, ({ guid }) => guid));
  } else {
    newPosts.push(...items);
    const newFeedWithMeta = {
      url, currentFeedId, title, description,
    };
    watched.feeds.unshift(newFeedWithMeta);
  }
  const newPostsWithFeedId = newPosts.map((post) => ({ ...post, currentFeedId }));
  watched.posts.unshift(...newPostsWithFeedId);
};

export const periodicUpdateContent = (watched) => {
  const promises = watched.feeds.map(({ url }) => {
    const queryURL = new URL(serverOrigins);
    queryURL.searchParams.set('url', url);
    return axios.get(queryURL.href);
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
          const data = parse(contents);
          addFeedDataToState(watched, data, feedId);
        }
      });
    })
    .finally(setTimeout(() => periodicUpdateContent(watched), updateInterval));
};

export const getContent = (watched, url) => {
  const queryURL = new URL(serverOrigins);
  queryURL.searchParams.set('url', url);
  axios.get(queryURL.href)
    .then((response) => {
      const feedId = _uniqueId();
      if (!response.data) {
        const error = new Error('Parse error: response.data empty');
        error.isParseError = true;
        throw error;
      }
      const data = parse(response.data.contents);
      addFeedDataToState(watched, data, feedId, url);
      watched.requestRSS = { status: 'success', error: null };
      watched.form = { status: 'empty', error: null };
    })
    .catch((error) => {
      watched.requestRSS = { status: 'failed', error };
      watched.form = { status: 'idle', error: null };
    });
};
