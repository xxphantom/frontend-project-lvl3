const translateHomePage = (i18next) => {
  const elements = {
    title: [document.querySelector('title'), 'textContent'],
    headline: [document.querySelector('h1.display-4'), 'textContent'],
    tagline: [document.querySelector('p.lead'), 'textContent'],
    sample: [document.querySelector('p.text-muted'), 'textContent'],
    placeholder: [document.querySelector('input.form-control-lg'), 'placeholder'],
    add: [document.querySelector('button.btn.btn-lg.btn-primary.px-5'), 'textContent'],
    read: [document.querySelector('a.full-article'), 'textContent'],
    close: [document.querySelector('button.btn.btn-secondary'), 'textContent'],
  };
  Object.entries(elements).forEach((element) => {
    const [key, [domEl, attribute]] = element;
    domEl[attribute] = i18next.t(key);
  });
};

export default translateHomePage;
