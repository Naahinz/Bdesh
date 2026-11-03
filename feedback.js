(() => {
  'use strict';

  const form = document.getElementById('feedback-form');
  const status = document.getElementById('feedback-status');
  const button = document.getElementById('feedback-submit');
  if (!form || !status || !button) return;

  const endpoint = 'https://formsubmit.co/ajax/eftekhernahin@gmail.com';
  const recipient = 'eftekhernahin@gmail.com';
  const fallback = document.createElement('div');
  fallback.className = 'feedback-fallback';
  fallback.hidden = true;
  fallback.style.cssText='display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-top:14px';
  const direct = document.createElement('a');
  direct.textContent = 'Open email app with this feedback';
  direct.className = 'action';
  direct.style.cssText='display:inline-flex;align-items:center;min-height:42px;padding:9px 14px;border-radius:10px;text-decoration:none';
  const copy = document.createElement('button');
  copy.type = 'button';
  copy.textContent = 'Copy feedback';
  copy.className = 'action';
  copy.style.cssText='min-height:42px;padding:9px 14px;border-radius:10px';
  fallback.append(direct,copy);
  status.insertAdjacentElement('afterend',fallback);

  const feedbackText=()=>{
    const values = new FormData(form);
    return 'Bdesh feedback — '+String(values.get('category')||'Other')+'\\n\\n'
      +String(values.get('message')||'')+'\\n\\n'
      +'Page: '+location.origin+location.pathname+'\\n'
      +'Reply email (optional): '+String(values.get('email')||'Not provided');
  };
  const revealFallback=()=>{
    const text=feedbackText();
    direct.href='mailto:'+recipient+'?subject='+encodeURIComponent('Bdesh website feedback')
      +'&body='+encodeURIComponent(text);
    fallback.hidden=false;
    fallback.style.display='flex';
  };
  copy.addEventListener('click',async()=>{
    try { await navigator.clipboard.writeText(feedbackText()); copy.textContent='Copied ✓'; }
    catch { const box=document.getElementById('feedback-message');box.focus();box.select();copy.textContent='Select your message to copy'; }
  });

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
      announce('Your message was not sent because the spam check was triggered. Please contact the Bdesh team if you are a real visitor.', 'error');
      revealFallback();
      return;
    }

    fallback.hidden=true;
    fallback.style.display='none';
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
        announce('The email service reports that recipient activation is required. Bdesh cannot confirm delivery until that is completed. You can copy or email your feedback directly below.', 'activation');
        revealFallback();
      } else if (response.ok && (result?.success === true || result?.success === 'true')) {
        form.reset();
        announce('The email service accepted your message. Email delivery is not independently confirmed.', 'success');
      } else {
        announce('The email service could not confirm your submission. ' + (description || 'Please try direct email.'), 'error');
        revealFallback();
      }
    } catch (error) {
      announce('Automatic feedback submission failed. Your message is still here; use the direct email or copy option below.', 'error');
      revealFallback();
    } finally {
      button.disabled = false;
      button.textContent = 'Send feedback';
    }
  });
})();