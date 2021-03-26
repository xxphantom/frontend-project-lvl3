import onChange from 'on-change';

const buildFeedbackElement = (textFeedback, feedbackClass) => {
  const divEl = document.createElement('div');
  divEl.classList.add('feedback', feedbackClass);
  divEl.textContent = textFeedback;
  return divEl;
};
const initView = (state, elements) => {
  const renderFeedback = (textFeedback, feedbackClass) => {
    const oldFeedbackEl = document.querySelector(`.${feedbackClass}`);
    if (oldFeedbackEl) {
      oldFeedbackEl.remove();
    }
    if (!textFeedback) {
      return;
    }
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
        renderFeedback('RSS успешно загружен!', 'text-success');
        elements.input.removeAttribute('disabled');
        elements.button.removeAttribute('disabled');
        elements.form.reset();
        break;
      default:
        throw Error(`Unknown form status ${status}`);
    }
  };

  const mapping = {
    'form.status': () => renderInput(state.form.status),
    'form.error': () => renderFeedback(state.form.error, 'text-danger'),
  };

  const watched = onChange(state, (path) => {
    mapping[path]();
  });
  return watched;
};

export default initView;
