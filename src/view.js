import onChange from 'on-change';
import _ from 'lodash';
import localize from './localize';
import localizeTemplate from './localize/template.js';

const buildFeedbackElement = (textFeedback, feedbackClass) => {
  const divEl = document.createElement('div');
  divEl.classList.add('feedback', feedbackClass);
  divEl.textContent = textFeedback;
  return divEl;
};
const initView = (state, elements) => {
  const i18next = localize();
  localizeTemplate(i18next);

  const renderFeedback = (feedbackKey, feedbackClass) => {
    const oldFeedbackEl = document.querySelector('.feedback');
    if (oldFeedbackEl) {
      oldFeedbackEl.remove();
    }
    if (!feedbackKey) {
      return;
    }
    const textFeedback = i18next.t(feedbackKey);
    const errorEl = buildFeedbackElement(textFeedback, feedbackClass);
    elements.formBox.append(errorEl);
  };

  const renderInput = (status) => {
    switch (status) {
      case 'filling':
        elements.input.classList.remove('is-invalid');
        break;
      case 'invalid':
        elements.input.classList.add('is-invalid');
        elements.input.removeAttribute('disabled');
        elements.button.removeAttribute('disabled');
        break;
      case 'downloading':
        elements.input.setAttribute('disabled', true);
        elements.button.setAttribute('disabled', true);
        break;
      case 'success':
        elements.input.removeAttribute('disabled');
        elements.button.removeAttribute('disabled');
        elements.form.reset();
        break;
      case 'failed':
      case 'parseFailed':
        elements.input.removeAttribute('disabled');
        elements.button.removeAttribute('disabled');
        break;
      default:
        throw Error(`Unknown form status ${status}`);
    }
  };

  const renderFeedEl = (title, description) => {
    const feedEl = document.createElement('li');
    feedEl.classList.add('list-group-item');
    const titleEl = document.createElement('h3');
    titleEl.textContent = title;
    const descriptionEl = document.createElement('p');
    descriptionEl.textContent = description;
    feedEl.append(titleEl);
    feedEl.append(descriptionEl);
    return feedEl;
  };

  const renderFeeds = (feeds) => {
    elements.feedsBox.innerHTML = '';
    const caption = document.createElement('h2');
    caption.textContent = i18next.t('feedsTitle');
    elements.feedsBox.prepend(caption);
    const feedsList = document.createElement('ul');
    feedsList.classList.add('list-group', 'mb-5');
    elements.feedsBox.append(feedsList);
    feeds.forEach((feed) => {
      const feedEl = renderFeedEl(feed.title, feed.description);
      feedsList.prepend(feedEl);
    });
  };

  const renderPostEl = (post) => {
    const html = `<li class="list-group-item d-flex justify-content-between align-items-start">
    <a href="${post.link}" class="font-weight-bold" target="_blank">${post.title}</a>
    <button type="button" data-id="${post.guid}" data-toggle="modal" data-target="#modal" class="btn btn-primary btn-sm">${i18next.t('preview')}</button></li>`;
    return html;
  };

  const renderPosts = (posts) => {
    elements.postsBox.innerHTML = '';
    elements.postsBox.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        e.target.classList.remove('font-weight-bold');
        e.target.classList.add('font-weight-normal');
      }
    });
    const caption = document.createElement('h2');
    caption.textContent = i18next.t('postsTitle');
    elements.postsBox.prepend(caption);
    const postsList = document.createElement('ul');
    postsList.classList.add('list-group');
    elements.postsBox.append(postsList);
    elements.postsBox.innerHTML = posts.map((post) => renderPostEl(post)).join('');
  };

  const renderModal = () => {
    const { preview, posts } = state;
    const { title, description, link } = elements.modalEls;
    const postData = posts.find((post) => post.guid === preview.postId);
    title.textContent = postData.title;
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = postData.description;
    const descriptionWithouTags = tempContainer.textContent;
    const smallDescription = _.truncate(descriptionWithouTags, {
      length: 500,
      separator: ' ',
    });
    description.textContent = smallDescription;
    link.setAttribute('href', postData.link);
  };

  const mapping = {
    'form.status': () => renderInput(state.form.status),
    'form.error': () => renderFeedback(state.form.error, 'text-danger'),
    'form.feedback': () => renderFeedback(state.form.feedback, 'text-success'),
    feeds: () => renderFeeds(state.feeds),
    posts: () => renderPosts(state.posts),
    'preview.postId': () => renderModal(state),
  };

  const watched = onChange(state, (path) => {
    mapping[path]();
  });
  return watched;
};

export default initView;
