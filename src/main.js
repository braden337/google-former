import 'regenerator-runtime/runtime';
import './style.scss';
import Swal from 'sweetalert2';

form.onsubmit = getForm;

async function getForm(event) {
  event.preventDefault();
  let data = new FormData(form);

  let url = data.get('url');

  if (url !== undefined && url !== '') {
    let response = await fetch('/form', {
      method: 'POST',
      mode: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({url}),
    });

    let body = await response.text();
    let googleFormsDocument = new DOMParser().parseFromString(
      body,
      'text/html'
    );

    let action = googleFormsDocument.querySelector('form').action;

    let fields = [...googleFormsDocument.querySelectorAll('[data-params]')]
      .map(x => x.dataset.params.match(/"([\w\s]+)".+\[(\d+)/).slice(1))
      .map(([title, id]) => ({title, name: `entry.${id}`}));

    if (fields.length > 0) {
      let your_new_form = `<form action="${action}">\n`;

      for (let field of fields) {
        your_new_form += `  <label>${field.title}</label>\n`;
        your_new_form += `  <input type="text" name="${field.name}" required />\n\n`;
      }

      your_new_form += '  <input type="submit" value="Send" />\n';
      your_new_form += '</form>';

      let pre = document.createElement('pre');
      pre.innerText = your_new_form;
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
