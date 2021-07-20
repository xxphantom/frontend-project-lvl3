const buildFeedbackElement = (textFeedback, feedbackClass) => {
  const divEl = document.createElement('div');
  divEl.classList.add('feedback', feedbackClass);
  divEl.textContent = textFeedback;
  return divEl;
};

export const buildFeedback = (elements, i18n, feedbackKey, feedbackClass) => {
  const oldFeedbackEl = document.querySelector('.feedback');
  if (oldFeedbackEl) {
    oldFeedbackEl.remove();
  }
  const textFeedback = i18n(feedbackKey);
  const feedbackEl = buildFeedbackElement(textFeedback, feedbackClass);
  elements.formBox.append(feedbackEl);
};

export const disableForm = (elements) => {
  elements.input.classList.remove('is-invalid');
  elements.input.setAttribute('readonly', true);
  elements.button.setAttribute('disabled', true);
};

export const enableForm = (elements) => {
  elements.input.classList.remove('is-invalid');
  elements.input.removeAttribute('readonly');
  elements.button.removeAttribute('disabled');
};

export const resetForm = (elements) => {
  elements.form.reset();
};

export const buildFeedList = (elements, i18n, feeds) => {
  elements.feedsBox.innerHTML = '';
  const feedsEls = feeds
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
      ${feedsEls}
    </ul>`);
};

const buildPostEl = (i18n, post, isRead) => (`
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

export const buildPosts = (elements, i18n, posts, readPosts) => {
  const isRead = (guid) => readPosts.has(guid);
  elements.postsBox.innerHTML = (`
    <h2>
      ${i18n('postsTitle')}
    </h2>
    <ul class="list-group">
      ${posts.map((post) => buildPostEl(i18n, post, isRead(post.guid))).join('')}
    </ul>
    `);
};

export const buildModalWindow = (elements, postData) => {
  const { modal } = elements;
  const { title, description, link } = postData;
  modal.title.textContent = title;
  modal.description.textContent = description;
  modal.link.setAttribute('href', link);
};
