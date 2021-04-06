import onChange from 'on-change';

const buildFeedbackElement = (textFeedback, feedbackClass) => {
  const divEl = document.createElement('div');
  divEl.classList.add('feedback', feedbackClass);
  divEl.textContent = textFeedback;
  return divEl;
};
const initView = (state, elements) => {
  const {
    input,
    button,
    form,
    formBox,
    feedsBox,
    postsBox,
    modalEls,
  } = elements;

  const renderFeedback = (textFeedback, feedbackClass) => {
    const oldFeedbackEl = document.querySelector('.feedback');
    if (oldFeedbackEl) {
      oldFeedbackEl.remove();
    }
    if (!textFeedback) {
      return;
    }
    const errorEl = buildFeedbackElement(textFeedback, feedbackClass);
    formBox.append(errorEl);
  };

  const renderInput = (status) => {
    switch (status) {
      case 'filling':
        input.classList.remove('is-invalid');
        break;
      case 'invalid':
        input.classList.add('is-invalid');
        input.removeAttribute('disabled');
        button.removeAttribute('disabled');
        break;
      case 'downloading':
        input.setAttribute('disabled', true);
        button.setAttribute('disabled', true);
        break;
      case 'success':
        input.removeAttribute('disabled');
        button.removeAttribute('disabled');
        form.reset();
        break;
      case 'failed':
      case 'parseFailed':
        input.removeAttribute('disabled');
        button.removeAttribute('disabled');
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
    feedsBox.innerHTML = '';
    const caption = document.createElement('h2');
    caption.textContent = 'Фиды';
    feedsBox.prepend(caption);
    const feedsList = document.createElement('ul');
    feedsList.classList.add('list-group', 'mb-5');
    feedsBox.append(feedsList);
    feeds.forEach((feed) => {
      const feedEl = renderFeedEl(feed.title, feed.description);
      feedsList.prepend(feedEl);
    });
  };

  const renderPostEl = (post) => {
    const {
      title,
      link,
      guid,
    } = post;
    const postEl = document.createElement('li');
    postEl.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
    const linkEl = document.createElement('a');
    linkEl.setAttribute('href', link);
    linkEl.classList.add('font-weight-bold');
    linkEl.textContent = title;
    const postButton = document.createElement('button');
    postButton.setAttribute('type', 'button');
    postButton.setAttribute('data-id', guid);
    postButton.setAttribute('data-toggle', 'modal');
    postButton.setAttribute('data-target', '#modal');
    postButton.classList.add('btn', 'btn-primary', 'btn-sm');
    postButton.textContent = 'Просмотр';
    postEl.append(linkEl);
    postEl.append(postButton);
    return postEl;
  };

  const renderPosts = (posts) => {
    postsBox.innerHTML = '';
    const caption = document.createElement('h2');
    caption.textContent = 'Посты';
    postsBox.prepend(caption);
    const postsList = document.createElement('ul');
    postsList.classList.add('list-group');
    postsBox.append(postsList);
    posts.forEach((post) => {
      const postEl = renderPostEl(post);
      postsList.append(postEl);
    });
  };

  const renderModal = () => {
    const { preview, posts } = state;
    const { title, description, link } = modalEls;
    const postData = posts.find((post) => post.guid === preview.postId);
    title.textContent = postData.title;
    description.textContent = postData.description;
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
