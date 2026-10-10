/* registry.js — trick files call registerTrick({...}); animation files call extendTrick(id, {stage, steps, tryit}).
   build.js merges extensions into tricks before rendering. */
window.TRICKS = window.TRICKS || [];
window.TRICK_EXT = window.TRICK_EXT || {};
function registerTrick(t) { window.TRICKS.push(t); }
function extendTrick(id, ext) { window.TRICK_EXT[id] = ext; }
