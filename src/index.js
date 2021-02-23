import _ from 'lodash';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function component() {
  const element = document.createElement('h1');

  element.innerHTML = _.join(['Hello,', 'world!'], ' ');

  return element;
}

document.body.appendChild(component());
