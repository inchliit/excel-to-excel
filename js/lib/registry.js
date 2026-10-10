/* registry.js — trick files call registerTrick({...}); build.js reads window.TRICKS. */
window.TRICKS = window.TRICKS || [];
function registerTrick(t) { window.TRICKS.push(t); }
