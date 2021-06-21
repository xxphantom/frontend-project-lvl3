import _truncate from 'lodash/truncate';

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

const renderFormMapping = {
  invalid: (elements, i18n, error) => {
    elements.input.classList.add('is-invalid');
    elements.input.removeAttribute('readonly');
    elements.button.removeAttribute('disabled');
    renderFeedback(elements, i18n, `errors.${error.message}`, 'text-danger');
  },
  valid: (elements) => {
    elements.input.classList.remove('is-invalid');
    elements.input.removeAttribute('readonly');
    elements.button.removeAttribute('disabled');
  },
  idle: (elements) => {
    elements.form.reset();
    elements.input.classList.remove('is-invalid');
    elements.input.removeAttribute('readonly');
    elements.button.removeAttribute('disabled');
  },
};

const renderForm = (elements, i18n, state) => {
  const { status, error } = state.form;
  const render = renderFormMapping[status];
  if (!render) {
    throw Error(`Unexpected form status ${status}`);
  }
  render(elements, i18n, error);
};

const renderFeeds = (elements, i18n, state) => {
  const { feeds } = state;
  elements.feedsBox.innerHTML = '';
  const feedsList = feeds
    .map(({ title, description }) => (`
      <li class='list-group-item'>
        <h3>${title}</h3>
        <p>${description}</p>
      </li>`))
    .join('');
  elements.feedsBox.innerHTML = (`
    <h2>
      ${i18n('feedsTitle')}
    </h2>
    <ul class='list-group mb-5'>
      ${feedsList}
    </ul>`);
};

const renderPostEl = (i18n, post, isRead) => (`
  <li class="list-group-item d-flex justify-content-between align-items-center">
    <a
      href="${post.link}"
      class="fw-${isRead ? 'normal' : 'bold'}
      text-decoration-none"
      data-id="${post.guid}"
      target="_blank"
    >
      ${post.title}
    </a>
    <button
      type="button"
      data-id="${post.guid}"
      data-bs-toggle="modal"
      data-bs-target="#modal"
      class="btn btn-outline-primary btn-sm"
    >
      ${i18n('preview')}
    </button>
  </li>
  `);

const renderPosts = (elements, i18n, state) => {
  const { posts, uiState: { readPosts } } = state;
  const isRead = (guid) => readPosts.has(guid);
  elements.postsBox.innerHTML = (`
    <h2>
      ${i18n('postsTitle')}
    </h2>
    <ul class="list-group">
      ${posts.map((post) => renderPostEl(i18n, post, isRead(post.guid))).join('')}
    </ul>
    `);
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
      postEl.classList.remove('fw-bold');
      postEl.classList.add('fw-normal');
    }
  });
};

const getErrType = (error) => {
  if (!error) {
    return null;
  }
  switch (true) {
    case error.isParseError:
      return 'parseError';
    case error.isAxiosError:
      return 'networkError';
    default:
      return 'unknownError';
  }
};

const renderRequestStages = (elements, i18n, state) => {
  const { status, error } = state.requestRSS;
  const errType = getErrType(error);
  switch (status) {
    case 'finished':
      renderFeedback(elements, i18n, 'feedback.success', 'text-success');
      break;
    case 'requested':
      elements.input.classList.remove('is-invalid');
      elements.input.setAttribute('readonly', true);
      elements.button.setAttribute('disabled', true);
      break;
    case 'failed':
      elements.input.classList.remove('is-invalid');
      elements.input.removeAttribute('readonly');
      elements.button.removeAttribute('disabled');
      renderFeedback(elements, i18n, `errors.${errType}`, 'text-danger');
      break;
    default:
      throw new Error(`Unknown status: ${errType}`);
  }
};

const mapping = {
  form: (state, elements, i18n) => renderForm(elements, i18n, state),
  requestRSS: (state, elements, i18n) => renderRequestStages(elements, i18n, state),
  feeds: (state, elements, i18n) => renderFeeds(elements, i18n, state),
  posts: (state, elements, i18n) => renderPosts(elements, i18n, state),
  preview: (state, elements) => renderModal(elements, state),
  'uiState.readPosts': (state) => renderUiState(state),
};

const render = (state, path, elements, i18n) => {
  if (!mapping[path]) {
    console.error(`Unknown state path: ${path}`);
    return;
  }
  mapping[path](state, elements, i18n);
};

export default render;
