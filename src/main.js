import 'regenerator-runtime/runtime';
import './style.scss';
import Swal from 'sweetalert2';
import {escape} from 'lodash';
import ClipboardJS from 'clipboard';

const javascriptSnippet = `# Your Javascript Snippet

document.querySelector('form').onsubmit = function(event) {
  event.preventDefault();
  let form = event.target;

  fetch(form.action, {
    method: 'POST',
    mode: 'no-cors',
    body: new FormData(form),
  });

  form.reset();
  alert('Your message was sent');
};`;

let domain = process.env.SERVER_DOMAIN;
domain = domain ? `https://${domain}` : '';

form.onsubmit = getForm;

async function getForm(event) {
  event.preventDefault();
  let data = new FormData(form);

  let url = data.get('url');
  const isFormsURL =
    url.includes('docs.google.com/forms') || url.includes('forms.gle');

  if (isFormsURL) {
    form.insertAdjacentHTML(
      'afterend',
      '<div class="loading-circle"><div></div></div>'
    );

    const loading = form.nextElementSibling;
    form.remove();

    let response = await fetch(`${domain}/forms`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({url}),
    });

    let body = await response.text();
    let document = new DOMParser().parseFromString(body, 'text/html');

    let action = document.querySelector('form').action;

    let fields = [...document.querySelectorAll('[data-params]')]
      .map(x => x.dataset.params.match(/"([\w\s]+)".+\[(\d+)/).slice(1))
      .map(([title, id]) => ({title, name: `entry.${id}`}));

    if (fields.length > 0) {
      let htmlSnippet = `# Your HTML Snippet\n\n<form method="POST" action="${action}">\n`;

      for (let field of fields) {
        htmlSnippet += `  <label>${field.title}</label>\n`;
        htmlSnippet += `  <input type="text" name="${field.name}" required />\n\n`;
      }

      htmlSnippet += '  <input type="submit" value="Send" />\n';
      htmlSnippet += '</form>\n\n';

      loading.insertAdjacentHTML(
        'afterend',
        `<pre>${escape(htmlSnippet + javascriptSnippet)}</pre>`
      );

      loading.remove();

      const clipboard = new ClipboardJS('pre', {
        target: function (trigger) {
          return trigger;
        },
      });

      clipboard.on('success', function (event) {
        event.clearSelection();
        Swal.fire({
          text: 'Copied to clipboard',
          toast: true,
          position: 'top',
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      });
    } else {
      err('Unable to parse your form');
    }
  } else {
    err("That doesn't seem to be a Google Forms URL");
  }
}

async function err(message) {
  await Swal.fire('Try again', message, 'error');
  form.reset();
  form.focus();
}
