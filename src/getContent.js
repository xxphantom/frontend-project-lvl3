import axios from 'axios';
import _differenceBy from 'lodash/differenceBy';
import _uniqueId from 'lodash/uniqueId';
import { parse } from './utils.js';

const updateInterval = 5000;
const serverOrigins = 'https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=';

export const periodicUpdateContent = (watched) => {
  const promises = watched.feeds.map(({ url }) => (
    axios.get(`${serverOrigins}${encodeURIComponent(url)}`)));
  Promise.allSettled(promises)
    .then((results) => {
      const resultsWithMetadata = results.map((result, i) => ({
        result,
        feedId: watched.feeds[i].feedId,
        url: watched.feeds[i].url,
      }));

      resultsWithMetadata.forEach(({ result: { status, value, reason }, feedId }) => {
        if (reason) {
          throw new Error(reason);
        }
        if (status === 'fulfilled') {
          const updatedFeed = parse(value.data.contents);
          const oldPosts = watched.posts.filter((post) => post.feedId === feedId);
          const newPosts = _differenceBy(updatedFeed.posts, oldPosts, ({ guid }) => guid);
          const newPostsWithfeedId = newPosts.map((post) => ({ ...post, feedId }));
          watched.posts.unshift(...newPostsWithfeedId);
          watched.uiState.posts.push(...newPostsWithfeedId
            .map(({ guid }) => ({ id: guid, status: 'unread' })));
        }
      });
    })
    .finally(setTimeout(() => periodicUpdateContent(watched), updateInterval));
};

export const getContent = (watched, url) => {
  const queryURL = `${serverOrigins}${encodeURIComponent(url)}`;
  axios.get(queryURL)
    .then((response) => {
      const feedId = _uniqueId();
      const parsedData = parse(response.data.contents);
      const { feed, posts } = parsedData;
      const feedWithMeta = { url, feedId, ...feed };
      const postsWithFeedId = posts
        .map((post) => ({ ...post, feedId }));
      const uiStatePosts = posts
        .map(({ guid }) => ({ id: guid, status: 'unread' }));
      watched.feeds.unshift(feedWithMeta);
      watched.posts.unshift(...postsWithFeedId);
      watched.uiState.posts.push(...uiStatePosts);
      watched.requestRSS = { status: 'success' };
      watched.form = { status: 'empty' };
    })
    .catch((e) => {
      if (e.isAxiosError) {
        watched.requestRSS = { status: 'failed' };
        watched.form = { status: 'valid' };
      }
      if (e.message === 'parseError') {
        watched.requestRSS = { status: 'parseFailed' };
        watched.form = { status: 'valid' };
      }
      throw e;
    });
};
