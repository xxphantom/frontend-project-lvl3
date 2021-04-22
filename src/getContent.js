import axios from 'axios';
import _differenceBy from 'lodash/differenceBy';
import _uniqueId from 'lodash/uniqueId';
import { parse } from './utils.js';

const updateInterval = 5000;
const serverOrigins = 'https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=';

export const periodicUpdateContent = (watched) => {
  const promises = watched.feeds.map(({ sourceLink }) => (
    axios.get(`${serverOrigins}${encodeURIComponent(sourceLink)}`)));
  Promise.allSettled(promises)
    .then((results) => {
      const resultsWithMetadata = results.map((result, i) => ({
        result,
        feedId: watched.feeds[i].feedId,
        sourceLink: watched.feeds[i].sourceLink,
      }));

      resultsWithMetadata.forEach(({ result: { status, value }, feedId }) => {
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
      setTimeout(() => periodicUpdateContent(watched, serverOrigins), updateInterval);
    });
};

export const getContent = (watched, sourceLink) => {
  const queryURL = `${serverOrigins}${encodeURIComponent(sourceLink)}`;
  axios.get(queryURL)
    .then((response) => {
      const xmlString = response.data.contents;
      const feedId = _uniqueId();
      const feedData = parse(xmlString);
      watched.feeds = [...watched.feeds, {
        sourceLink,
        feedId,
        title: feedData.title,
        description: feedData.description,
      }];
      watched.posts = [
        ...feedData.posts.map((post) => ({ ...post, feedId })),
        ...watched.posts];
      watched.uiState.posts = feedData.posts
        .map(({ guid }) => ({ id: guid, status: 'unread' }));
      watched.form.status = 'success';
      watched.form.feedback = 'feedback.success';
    })
    .catch((e) => {
      if (e.isAxiosError) {
        watched.form.status = 'failed';
        watched.form.error = 'errors.networkError';
      }
      if (e.message === 'parseError') {
        watched.form.status = 'parseFailed';
        watched.form.error = 'errors.parseError';
      }
      throw e;
    });
};
