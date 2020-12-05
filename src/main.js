import 'regenerator-runtime/runtime';
import './style.scss';
import Swal from 'sweetalert2';

form.onsubmit = getForm;

async function getForm(event) {
  event.preventDefault();
  let data = new FormData(form);

  let url = data.get('url');

  if (url !== undefined && url !== '') {
    let response = await fetch('https://google-former.glitch.me/', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({url}),
    });

    let body = await response.text();
    let document = new DOMParser().parseFromString(
      body,
      'text/html'
    );

    let action = document.querySelector('form').action;

    let fields = [...document.querySelectorAll('[data-params]')]
      .map(x => x.dataset.params.match(/"([\w\s]+)".+\[(\d+)/).slice(1))
      .map(([title, id]) => ({title, name: `entry.${id}`}));

    if (fields.length > 0) {
      let yourForm = `<form action="${action}">\n`;

      for (let field of fields) {
        yourForm += `  <label>${field.title}</label>\n`;
        yourForm += `  <input type="text" name="${field.name}" required />\n\n`;
      }

      yourForm += '  <input type="submit" value="Send" />\n';
      yourForm += '</form>';

      let pre = document.createElement('pre');
      pre.innerText = yourForm;
      form.replaceWith(pre);
    } else {
      err();
    }
  } else {
    err();
  }
}

async function err() {
  await Swal.fire(
    'Try again',
    "That doesn't seem to be a Google Forms URL",
    'error'
  );

  form.reset();
  form.focus();
}
