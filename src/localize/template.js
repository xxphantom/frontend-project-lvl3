const translateHomePage = (i18n) => {
  const elements = {
    title: [document.querySelector('title'), 'textContent'],
    headline: [document.querySelector('h1.display-4'), 'textContent'],
    tagline: [document.querySelector('p.lead'), 'textContent'],
    sample: [document.querySelector('p.text-muted'), 'textContent'],
    placeholder: [document.querySelector('input.form-control-lg'), 'placeholder'],
    add: [document.querySelector('button.btn.btn-lg.btn-primary'), 'textContent'],
    read: [document.querySelector('a.full-article'), 'textContent'],
    close: [document.querySelector('button.btn.btn-secondary'), 'textContent'],
  };
  Object.entries(elements).forEach((element) => {
    const [key, [domEl, attribute]] = element;
    domEl[attribute] = i18n(key);
  });
};

export default translateHomePage;
