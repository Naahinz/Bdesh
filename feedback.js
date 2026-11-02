(() => {
  'use strict';

  const form = document.getElementById('feedback-form');
  const status = document.getElementById('feedback-status');
  const button = document.getElementById('feedback-submit');
  if (!form || !status || !button) return;

  const endpoint = 'https://formsubmit.co/ajax/eftekhernahin@gmail.com';

  const announce = (message, state) => {
    status.textContent = message;
    status.dataset.state = state;
  };

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (button.disabled || !form.reportValidity()) return;

    const data = new FormData(form);
    const message = String(data.get('message') || '').trim();
    const email = String(data.get('email') || '').trim();
    const category = String(data.get('category') || 'Other feedback');
    const trap = String(data.get('_honey') || '').trim();

    if (message.length < 12) {
      announce('Please add a little more detail before submitting.', 'error');
      document.getElementById('feedback-message').focus();
      return;
    }
    // Ignore automated submissions filling the hidden honeypot field.
    if (trap) {
      announce('Your feedback has been received.', 'success');
      form.reset();
      return;
    }

    button.disabled = true;
    button.textContent = 'Sending…';
    announce('Sending your feedback securely through the email service…', 'pending');

    const payload = {
      _subject: 'Bdesh website feedback — ' + category,
      _url: window.location.href,
      _honey: '',
      category,
      message
    };
    if (email) payload.email = email;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      let result;
      try { result = await response.json(); }
      catch { throw new Error('The email service returned an unexpected response.'); }

      const description = String(result?.message || '');
      if (/activat|confirm.*email/i.test(description)) {
        announce('The feedback form needs one-time approval. An activation email should arrive at eftekhernahin@gmail.com. The recipient must click Activate Form before delivery can begin.', 'activation');
      } else if (response.ok && (result?.success === true || result?.success === 'true')) {
        form.reset();
        announce('Thank you — your feedback was successfully submitted to the Bdesh email service.', 'success');
      } else {
        announce('The email service could not deliver your feedback. ' + (description || 'Please try again or use the direct email link below.'), 'error');
      }
    } catch (error) {
      announce('Automatic delivery was unavailable. Please try again or use the direct email link below.', 'error');
    } finally {
      button.disabled = false;
      button.textContent = 'Send feedback';
    }
  });
})();