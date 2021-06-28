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

const mapping = {
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

export { render, renderFeedback };
