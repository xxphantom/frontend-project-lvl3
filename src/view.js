import onChange from 'on-change';
import localizeTemplate from './localize/template.js';
import { _truncate } from './utils.js';

const buildFeedbackElement = (textFeedback, feedbackClass) => {
  const divEl = document.createElement('div');
  divEl.classList.add('feedback', feedbackClass);
  divEl.textContent = textFeedback;
  return divEl;
};

const renderFeedback = (elements, i18n, feedbackKey, feedbackClass) => {
  const oldFeedbackEl = document.querySelector('.feedback');
  if (oldFeedbackEl) {
    oldFeedbackEl.remove();
  }
  const textFeedback = i18n(feedbackKey);
  const feedbackEl = buildFeedbackElement(textFeedback, feedbackClass);
  elements.formBox.append(feedbackEl);
};

const renderInputMapping = {
  notValid: (elements, i18n, error) => {
    elements.input.classList.add('is-invalid');
    elements.input.removeAttribute('readonly');
    elements.button.removeAttribute('disabled');
    renderFeedback(elements, i18n, `errors.${error.message}`, 'text-danger');
  },
  blocked: (elements) => {
    elements.input.classList.remove('is-invalid');
    elements.input.setAttribute('readonly', true);
    elements.button.setAttribute('disabled', true);
  },
  empty: (elements) => {
    elements.input.classList.remove('is-invalid');
    elements.input.removeAttribute('readonly');
    elements.button.removeAttribute('disabled');
    elements.form.reset();
  },
  valid: (elements) => {
    elements.input.classList.remove('is-invalid');
    elements.input.removeAttribute('readonly');
    elements.button.removeAttribute('disabled');
  },
  idle: (elements) => {
    elements.input.removeAttribute('readonly');
    elements.button.removeAttribute('disabled');
  },
};

const renderInput = (elements, i18n, state) => {
  const { status, error } = state.form;
  const render = renderInputMapping[status];
  if (!render) {
    throw Error(`Unexpected form status ${status}`);
  }
  render(elements, i18n, error);
};

const renderFeeds = (elements, i18n, feeds) => {
  elements.feedsBox.innerHTML = '';
  const feedsList = feeds
    .map(({ title, description }) => (`<li class='list-group-item'><h3>${title}</h3><p>${description}</p>`))
    .join('');
  elements.feedsBox.innerHTML = `<h2>${i18n('feedsTitle')}</h2>
      <ul class='list-group mb-5'>${feedsList}</ul>`;
};

const renderPostEl = (i18n, post, isRead) => (`<li class="list-group-item d-flex justify-content-between align-items-start">
  <a href="${post.link}" class="font-weight-${isRead ? 'normal' : 'bold'}" data-id="${post.guid}" target="_blank">${post.title}</a>
  <button type="button" data-id="${post.guid}" data-toggle="modal" data-target="#modal" class="btn btn-primary btn-sm">${i18n('preview')}</button></li>`);

const renderPosts = (elements, i18n, state) => {
  const { posts, uiState: { readPosts } } = state;
  elements.postsBox.innerHTML = `<h2>${i18n('postsTitle')}</h2>
<ul class="list-group">${posts.map((post) => {
    const isRead = readPosts.has(post.guid);
    return renderPostEl(i18n, post, isRead);
  })
    .join('')}</ul>`;
};

const renderModal = (elements, state) => {
  const { modal } = elements;
  const { preview, posts } = state;
  const postData = posts.find((post) => post.guid === preview.postId);
  modal.title.textContent = postData.title;
  const tempContainer = document.createElement('div');
  tempContainer.innerHTML = postData.description;
  const descriptionWithoutTags = tempContainer.textContent;
  const smallDescription = _truncate(descriptionWithoutTags, {
    length: 500,
    separator: ' ',
  });
  modal.description.textContent = smallDescription;
  modal.link.setAttribute('href', postData.link);
};

const renderUiState = (state) => {
  state.posts.forEach(({ guid }) => {
    const postEl = document.querySelector(`a[data-id="${guid}"]`);
    const isRead = state.uiState.readPosts.has(guid);
    if (isRead) {
      postEl.classList.remove('font-weight-bold');
      postEl.classList.add('font-weight-normal');
    }
  });
};

const getErrType = (error) => {
  switch (true) {
    case error.isParseError:
      return 'parseError';
    case error.isAxiosError:
      return 'networkError';
    default:
      return 'unknownError';
  }
};

const renderRequestRSS = (elements, i18n, state) => {
  const { status, error } = state.requestRSS;
  const errType = getErrType(error);
  switch (status) {
    case 'success':
      renderFeedback(elements, i18n, 'feedback.success', 'text-success');
      break;
    case 'failed':
      renderFeedback(elements, i18n, `errors.${errType}`, 'text-danger');
      break;
    default:
      throw new Error(`Unknown status: ${errType}`);
  }
};

const initView = (state, elements, i18n) => {
  localizeTemplate(i18n);

  const mapping = {
    form: () => renderInput(elements, i18n, state),
    requestRSS: () => renderRequestRSS(elements, i18n, state),
    feeds: () => renderFeeds(elements, i18n, state.feeds),
    posts: () => renderPosts(elements, i18n, state),
    preview: () => renderModal(elements, state),
    'uiState.readPosts': () => renderUiState(state),
  };

  const watched = onChange(state, (path) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Path: ${path}:`);
      console.dir(state);
    }
    mapping[path]();
  });
  return watched;
};

export default initView;
