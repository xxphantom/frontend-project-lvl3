import onChange from 'on-change';

const buildDangerElement = () => {
  const divEl = document.createElement('div');
  divEl.classList.add('feedback', 'text-danger');
  divEl.textContent = 'Проверьте корректность ввода URL';
  return divEl;
};
const initView = (state, elements) => {
  const renderInput = (status) => {
    if (status === 'invalid') {
      elements.input.classList.add('is-invalid');
      const dangerEl = buildDangerElement();
      elements.formBox.append(dangerEl);
    } else {
      elements.input.classList.remove('is-invalid');
      elements.formBox.lastChild.remove();
    }
  };

  const mapping = {
    'form.status': renderInput,
  };

  const watched = onChange(state, (path, value) => {
    mapping[path](value);
  });
  return watched;
};

export default initView;
