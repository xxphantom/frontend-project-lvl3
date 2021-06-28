import onChange from 'on-change';
import { render, renderFeedback } from './renderings.js';

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

const requestRSS = (elements, i18n, state) => {
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

const inputMapping = {
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

const currentInputStage = (elements, i18n, state) => {
  const { status, error } = state.form;
  const currentInput = inputMapping[status];
  if (!render) {
    throw Error(`Unexpected form status ${status}`);
  }
  currentInput(elements, i18n, error);
};

const initView = (state, elements, i18n) => {
  const watched = onChange(state, (path) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Path: ${path}:`);
      console.dir(state);
    }
    switch (path) {
      case 'requestRSS':
        requestRSS(elements, i18n, state);
        break;
      case 'form':
        currentInputStage(elements, i18n, state);
        break;
      default:
        render(state, path, elements, i18n);
    }
  });
  return watched;
};

export default initView;
