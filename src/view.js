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

const renderFeedback = (elements, i18next, feedbackKey, feedbackClass) => {
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
const renderInputMapping = {
  filling: (elements) => elements.input.classList.remove('is-invalid'),
  invalid: (elements) => {
    elements.input.classList.add('is-invalid');
    elements.input.readonly = false;
    elements.button.disabled = false;
  },
  downloading: (elements) => {
    elements.input.classList.remove('is-invalid');
    elements.input.readonly = true;
    elements.button.disabled = true;
  },
  success: (elements) => {
    elements.input.readonly = false;
    elements.button.disabled = false;
    elements.form.reset();
  },
  failed: (elements) => {
    elements.input.readonly = false;
    elements.button.disabled = false;
  },
  parseFailed: (elements) => {
    elements.input.readonly = false;
    elements.button.disabled = false;
  },
};

const renderInput = (elements, status) => {
  const render = renderInputMapping[status];
  if (!render) {
    throw Error(`Unknown form status ${status}`);
  }
  render(elements);
};

const renderFeeds = (elements, i18next, feeds) => {
  elements.feedsBox.innerHTML = '';
  const feedsList = feeds
    .map(({ title, description }) => (`<li class='list-group-item'><h3>${title}</h3><p>${description}</p>`))
    .join('');
  elements.feedsBox.innerHTML = `<h2>${i18next.t('feedsTitle')}</h2>
  <ul class='list-group mb-5'>${feedsList}</ul>`;
};

const renderPostEl = (i18next, post) => (`<li class="list-group-item d-flex justify-content-between align-items-start">
  <a href="${post.link}" class="font-weight-bold" data-id="${post.guid}" target="_blank">${post.title}</a>
  <button type="button" data-id="${post.guid}" data-toggle="modal" data-target="#modal" class="btn btn-primary btn-sm">${i18next.t('preview')}</button></li>`);

const renderPosts = (elements, i18next, posts) => {
  elements.postsBox.innerHTML = `
  <h2>${i18next.t('postsTitle')}</h2>
  <ul class="list-group">${posts.map((post) => renderPostEl(i18next, post)).join('')}</ul>`;
};

const renderModal = (elements, state) => {
  const { preview, posts } = state;
  const postData = posts.find((post) => post.guid === preview.postId);
  elements.modalEls.title.textContent = postData.title;
  const tempContainer = document.createElement('div');
  tempContainer.innerHTML = postData.description;
  const descriptionWithoutTags = tempContainer.textContent;
  const smallDescription = _.truncate(descriptionWithoutTags, {
    length: 500,
    separator: ' ',
  });
  elements.modalEls.description.textContent = smallDescription;
  elements.modalEls.link.setAttribute('href', postData.link);
};

const renderUiState = (state) => {
  state.uiState.posts.forEach((post) => {
    const postEl = document.querySelector(`a[data-id="${post.id}"]`);
    if (post.status === 'read') {
      postEl.classList.remove('font-weight-bold');
      postEl.classList.add('font-weight-normal');
    }
  });
};

const initView = (state, elements) => {
  const i18next = localize();
  localizeTemplate(i18next);

  const mapping = {
    'form.status': () => renderInput(elements, state.form.status),
    'form.error': () => renderFeedback(elements, i18next, state.form.error, 'text-danger'),
    'form.feedback': () => renderFeedback(elements, i18next, state.form.feedback, 'text-success'),
    feeds: () => renderFeeds(elements, i18next, state.feeds),
    posts: () => renderPosts(elements, i18next, state.posts),
    'preview.postId': () => renderModal(elements, state),
    'uiState.posts': () => renderUiState(state),
  };

  const watched = onChange(state, (path) => {
    mapping[path](elements);
  });
  return watched;
};

export default initView;
