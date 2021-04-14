import axios from 'axios';
import _ from 'lodash';
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
          const newPosts = _.differenceBy(updatedFeed.posts, watched.posts, ({ guid }) => guid);
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
      try {
        const feedId = _.uniqueId();
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
      } catch (err) {
        console.dir(err);
        watched.form.status = 'parseFailed';
        watched.form.error = 'errors.parseError';
      }
    })
    .catch(() => {
      watched.form.status = 'failed';
      watched.form.error = 'errors.networkError';
    });
};
