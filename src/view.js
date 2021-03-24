import onChange from 'on-change';

const initView = (state, elements) => {
  const renderInput = (status) => {
    if (status === 'invalid') {
      elements.input.classList.add('is-invalid');
    } else {
      elements.input.classList.remove('is-invalid');
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
