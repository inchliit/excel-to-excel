// Paste into the deck page (index.html?dev) console, or run via the browser pane's javascript tool.
// Review Focus 2: keys typed in the try-it input must not move the deck. Also checks a correct answer end-to-end.
(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const errs = [];
  Reveal.slide(0, 1);
  await wait(400);
  const sec = Reveal.getCurrentSlide();
  const input = sec.querySelector('.ti-input');
  if (!input) return 'FAIL: no try-it input on ' + sec.id;
  input.focus();
  const before = JSON.stringify(Reveal.getIndices());
  for (const key of [' ', 'ArrowRight', 'ArrowLeft', 'ArrowDown', 'f', 's', 'n', 'Escape']) {
    input.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
  }
  await wait(300);
  if (JSON.stringify(Reveal.getIndices()) !== before) errs.push('typing moved the deck: ' + before + ' → ' + JSON.stringify(Reveal.getIndices()));
  input.value = '=sumifs(D2:D7, B2:B7, "L2")';
  input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  for (let i = 0; i < 40 && !/Correct|Right answer|couldn/.test(sec.querySelector('.ti-msg').textContent); i++) await wait(250);
  const msg = sec.querySelector('.ti-msg').textContent;
  if (!/Correct/.test(msg)) errs.push('correct answer not accepted: ' + msg);
  if (sec.querySelector('.ti-target').textContent !== '20') errs.push('target cell shows ' + sec.querySelector('.ti-target').textContent);
  input.value = '=SUMIFS(D2:D7,B2:B7,"L1")';
  sec.querySelector('.ti-go').click();
  await wait(300);
  if (!/Not quite/.test(sec.querySelector('.ti-msg').textContent)) errs.push('wrong answer not flagged: ' + sec.querySelector('.ti-msg').textContent);
  return errs.length ? 'FAIL\n' + errs.join('\n') : 'PASS';
})();
