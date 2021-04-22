import onChange from 'on-change';
import _truncate from 'lodash/truncate';
import localizeTemplate from './localize/template.js';

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
  if (!feedbackKey) {
    return;
  }
  i18n((t) => {
    const textFeedback = t(feedbackKey);
    const errorEl = buildFeedbackElement(textFeedback, feedbackClass);
    elements.formBox.append(errorEl);
  });
};
const renderInputMapping = {
  filling: (elements) => elements.input.classList.remove('is-invalid'),
  invalid: (elements) => {
    elements.input.classList.add('is-invalid');
    elements.input.removeAttribute('readonly');
    elements.button.removeAttribute('disabled');
  },
  downloading: (elements) => {
    elements.input.classList.remove('is-invalid');
    elements.input.setAttribute('readonly', true);
    elements.button.setAttribute('disabled', true);
  },
  success: (elements) => {
    elements.input.removeAttribute('readonly');
    elements.button.removeAttribute('disabled');
    elements.form.reset();
  },
  failed: (elements) => {
    elements.input.removeAttribute('readonly');
    elements.button.removeAttribute('disabled');
  },
  parseFailed: (elements) => {
    elements.input.removeAttribute('readonly');
    elements.button.removeAttribute('disabled');
  },
};

const renderInput = (elements, status) => {
  const render = renderInputMapping[status];
  if (!render) {
    throw Error(`Unknown form status ${status}`);
  }
  render(elements);
};

const renderFeeds = (elements, i18n, feeds) => {
  elements.feedsBox.innerHTML = '';
  const feedsList = feeds
    .map(({ title, description }) => (`<li class='list-group-item'><h3>${title}</h3><p>${description}</p>`))
    .join('');
  i18n((t) => {
    elements.feedsBox.innerHTML = `<h2>${t('feedsTitle')}</h2>
    <ul class='list-group mb-5'>${feedsList}</ul>`;
  });
};

const renderPostEl = (t, post, status) => (`<li class="list-group-item d-flex justify-content-between align-items-start">
  <a href="${post.link}" class="font-weight-${status === 'read' ? 'normal' : 'bold'}" data-id="${post.guid}" target="_blank">${post.title}</a>
  <button type="button" data-id="${post.guid}" data-toggle="modal" data-target="#modal" class="btn btn-primary btn-sm">${t('preview')}</button></li>`);

const renderPosts = (elements, i18n, posts, uiState) => {
  i18n((t) => {
    elements.postsBox.innerHTML = `<h2>${t('postsTitle')}</h2>
  <ul class="list-group">${posts.map((post) => {
    const { status } = uiState.posts.find((s) => s.id === post.guid);
    return renderPostEl(t, post, status);
  })
    .join('')}</ul>`;
  });
};

const renderModal = (elements, state) => {
  const { preview, posts } = state;
  const postData = posts.find((post) => post.guid === preview.postId);
  elements.modalEls.title.textContent = postData.title;
  const tempContainer = document.createElement('div');
  tempContainer.innerHTML = postData.description;
  const descriptionWithoutTags = tempContainer.textContent;
  const smallDescription = _truncate(descriptionWithoutTags, {
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

const initView = (state, elements, i18n) => {
  localizeTemplate(i18n);

  const mapping = {
    'form.status': () => renderInput(elements, state.form.status),
    'form.error': () => renderFeedback(elements, i18n, state.form.error, 'text-danger'),
    'form.feedback': () => renderFeedback(elements, i18n, state.form.feedback, 'text-success'),
    feeds: () => renderFeeds(elements, i18n, state.feeds),
    posts: () => renderPosts(elements, i18n, state.posts, state.uiState),
    'preview.postId': () => renderModal(elements, state),
    'uiState.posts': () => renderUiState(state),
  };

  const watched = onChange(state, (path) => {
    mapping[path](elements);
  });
  return watched;
};

export default initView;
