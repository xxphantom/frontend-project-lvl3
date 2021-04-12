import axios from 'axios';
import _ from 'lodash';
import parser from './rssParser';

const updateInterval = 5000;
const serverOrigins = 'https://hexlet-allorigins.herokuapp.com/get?url=';

const updater = (watched) => {
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
          const feed = parser(value.data.contents);
          const oldPosts = watched.posts.filter((post) => post.feedId === feedId);
          const newPosts = feed.posts.filter((post) => !oldPosts
            .find(({ guid }) => guid === post.guid));
          const newPostsWithfeedId = newPosts.map((post) => ({ ...post, feedId }));
          watched.posts.unshift(...newPostsWithfeedId);
        }
      });
      setTimeout(() => updater(watched, serverOrigins), updateInterval);
    });
};

const contentUpdate = (watched, sourceLink) => {
  const queryURL = `${serverOrigins}${encodeURIComponent(sourceLink)}`;
  axios.get(queryURL)
    .then((response) => {
      const xmlString = response.data.contents;
      try {
        const feedId = _.uniqueId();
        const feedData = parser(xmlString);
        watched.feeds = [...watched.feeds, {
          sourceLink,
          feedId,
          title: feedData.title,
          description: feedData.description,
        }];
        watched.posts = [
          ...feedData.posts.map((post) => ({ ...post, feedId })),
          ...watched.posts];
        watched.form.status = 'success';
        watched.form.feedback = 'feedback.success';
        updater(watched, serverOrigins);
      } catch (err) {
        watched.form.status = 'parseFailed';
        watched.form.error = 'errors.parseError';
      }
    })
    .catch(() => {
      watched.form.status = 'failed';
      watched.form.error = 'errors.networkError';
    });
};
export default contentUpdate;
