const translateHomePage = (i18n) => {
  const elements = {
    title: [document.querySelector('title'), 'textContent'],
    headline: [document.querySelector('h1'), 'textContent'],
    tagline: [document.querySelector('p#tagline'), 'textContent'],
    sample: [document.querySelector('p#sample'), 'textContent'],
    placeholder: [document.querySelector('label[for="url"]'), 'textContent'],
    add: [document.querySelector('button#add'), 'textContent'],
    read: [document.querySelector('a#full-article'), 'textContent'],
    close: [document.querySelector('button#close-modal'), 'textContent'],
  };
  Object.entries(elements).forEach((element) => {
    const [key, [domEl, attribute]] = element;
    domEl[attribute] = i18n(key);
  });
};

export default translateHomePage;
