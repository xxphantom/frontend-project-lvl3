import axios from 'axios';
import {
  parse, _differenceBy, _uniqueId,
} from './utils.js';

const updateInterval = 5000;
const serverOrigins = 'https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=';

const addFeedDataToState = (watched, parsedData, currentFeedId, url) => {
  const newPosts = [];
  if (!url) {
    const oldPosts = watched.posts.filter((post) => post.feedId === currentFeedId);
    newPosts.push(..._differenceBy(parsedData.posts, oldPosts, ({ guid }) => guid));
  } else {
    newPosts.push(...parsedData.posts);
    const newFeedWithMeta = { url, currentFeedId, ...parsedData.feed };
    watched.feeds.unshift(newFeedWithMeta);
  }
  const newPostsWithFeedId = newPosts.map((post) => ({ ...post, currentFeedId }));
  watched.posts.unshift(...newPostsWithFeedId);
};

export const periodicUpdateContent = (watched) => {
  const promises = watched.feeds.map(({ url }) => (
    axios.get(`${serverOrigins}${encodeURIComponent(url)}`)));
  Promise.allSettled(promises)
    .then((results) => {
      results.forEach((result, i) => {
        const { feedId } = watched.feeds[i];
        if (result.status === 'rejected') {
          watched.error = result.reason;
        }
        if (result.status === 'fulfilled') {
          const { contents } = result.value.data;
          const data = parse(contents);
          addFeedDataToState(watched, data, feedId);
        }
      });
    })
    .catch((e) => {
      watched.error = e;
    })
    .finally(setTimeout(() => periodicUpdateContent(watched), updateInterval));
};

export const getContent = (watched, url) => {
  const queryURL = `${serverOrigins}${encodeURIComponent(url)}`;
  axios.get(queryURL)
    .then((response) => {
      const feedId = _uniqueId();
      if (!response.data) {
        throw new Error('parseError');
      }
      const data = parse(response.data.contents);
      addFeedDataToState(watched, data, feedId, url);
      watched.requestRSS = { status: 'success' };
      watched.form = { status: 'empty' };
    })
    .catch((e) => {
      watched.error = e;
      if (e.isAxiosError) {
        watched.requestRSS = { status: 'failed' };
        watched.form = { status: 'valid' };
      }
      if (e.message === 'parseError') {
        watched.requestRSS = { status: 'parseFailed' };
        watched.form = { status: 'valid' };
      }
    });
};
