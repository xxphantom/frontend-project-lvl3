import onChange from 'on-change';
import _truncate from 'lodash/truncate';
import * as render from './renderings.js';

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

const requestStagesMapping = {
  finished: (elements, i18n) => (
    render.buildFeedback(elements, i18n, 'feedback.success', 'text-success')
  ),
  requested: (elements) => render.disableForm(elements),
  failed: (elements, i18n, error) => {
    render.enableForm(elements);
    render.buildFeedback(elements, i18n, `errors.${getErrType(error)}`, 'text-danger');
  },
};

const requestHandler = (elements, i18n, { status, error }) => {
  const currentRequestStage = requestStagesMapping[status];
  if (!currentRequestStage) {
    throw new Error(`Unknown status: ${status}`);
  }
  currentRequestStage(elements, i18n, error);
};

const inputMapping = {
  invalid: (elements, i18n, error) => {
    render.enableForm(elements);
    render.buildFeedback(elements, i18n, `errors.${error.message}`, 'text-danger');
  },
  valid: (elements) => {
    render.enableForm(elements);
  },
  idle: (elements) => {
    render.resetForm(elements);
    render.enableForm(elements);
  },
};

const inputHandler = (elements, i18n, form) => {
  const { status, error } = form;
  const currentInput = inputMapping[status];
  if (!currentInput) {
    throw Error(`Unexpected form status ${status}`);
  }
  currentInput(elements, i18n, error);
};

const previewHandler = (elements, i18n, posts, preview) => {
  const { postId } = preview;
  const previewData = posts.find((post) => post.guid === postId);
  const tempContainer = document.createElement('div');
  tempContainer.innerHTML = previewData.description;
  const descriptionWithoutTags = tempContainer.textContent;
  const smallDescription = _truncate(descriptionWithoutTags, {
    length: 500,
    separator: ' ',
  });
  render.buildModalWindow(elements, { ...previewData, description: smallDescription });
};

const handlersMap = {
  requestRSS: (elements, i18n, { requestRSS }) => requestHandler(elements, i18n, requestRSS),
  form: (elements, i18n, { form }) => inputHandler(elements, i18n, form),
  feeds: (elements, i18n, { feeds }) => render.buildFeedList(elements, i18n, feeds),
  posts: (elements, i18n, { posts, uiState: { readPosts } }) => (
    render.buildPosts(elements, i18n, posts, readPosts)),
  preview: (elements, i18n, { posts, preview }) => previewHandler(elements, i18n, posts, preview),
  'uiState.readPosts': (elements, i18n, { posts, uiState: { readPosts } }) => render.buildReadPosts(posts, readPosts),
};

const initView = (state, elements, i18n) => {
  const watched = onChange(state, (path) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Path: ${path}:`);
      console.dir(state);
    }
    const currentHandler = handlersMap[path];
    if (!currentHandler) {
      console.error(`Unknown path: ${path}`);
      return;
    }
    currentHandler(elements, i18n, state);
  });
  return watched;
};

export default initView;
