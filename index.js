var start, isBlink, isLight, isRun, isShow, isWarned, handler, latency, stopBy, delay, audioRemind, audioEnd, digitMap;
start = null;
isBlink = false;
isLight = true;
isRun = false;
isShow = true;
isWarned = false;
handler = null;
latency = 0;
stopBy = null;
delay = 60000;
audioRemind = null;
audioEnd = null;
digitMap = {};
var BASE_COLOR = '#dff8ff';
var ALERT_COLOR = '#ff6b6b';

var newAudio = function(file){
  var node;
  node = new Audio();
  node.src = file;
  node.loop = false;
  node.preload = 'auto';
  node.load();
  node.style.display = 'none';
  document.body.appendChild(node);
  return node;
};

var safePlay = function(des){
  var promise;
  if (!des) {
    return;
  }
  promise = des.play();
  if (promise && typeof promise.catch === 'function') {
    promise.catch(function(){});
  }
  return des;
};

var soundToggle = function(des, state){
  var x$;
  if (!des) {
    return;
  }
  if (state) {
    return safePlay(des);
  } else {
    x$ = des;
    x$.currentTime = 0;
    x$.pause();
    return x$;
  }
};

var show = function(){
  isShow = !isShow;
  return $('.fbtn').css('opacity', isShow ? '1.0' : '0.1');
};

var setDigitInstant = function(digit, value, animate){
  if (animate == null) {
    animate = true;
  }
  if (!digit) {
    return;
  }
  digit.dataset.value = value;
  digit.querySelectorAll('.value').forEach(function(node){
    return node.textContent = value;
  });
  if (animate) {
    digit.classList.remove('pulse');
    void digit.offsetWidth;
    return digit.classList.add('pulse');
  } else {
    return digit.classList.remove('pulse');
  }
};

var setDigits = function(ms, animate){
  var safe, minutes, seconds, values, idx;
  if (animate == null) {
    animate = true;
  }
  safe = Math.max(0, Math.ceil(ms / 1000));
  minutes = Math.floor(safe / 60);
  seconds = safe % 60;
  if (minutes > 99) {
    minutes = 99;
  }
  values = [Math.floor(minutes / 10), minutes % 10, Math.floor(seconds / 10), seconds % 10];
  idx = ['minutesTens', 'minutesOnes', 'secondsTens', 'secondsOnes'];
  return idx.forEach(function(key, i){
    var digit, nextValue;
    digit = digitMap[key];
    nextValue = values[i];
    if (!digit) {
      return;
    }
    if (animate && parseInt(digit.dataset.value || '0', 10) === nextValue) {
      return;
    }
    return setDigitInstant(digit, nextValue, animate);
  });
};

var updateColors = function(color){
  return $('#timer').css('--clock-color', color);
};

var adjust = function(it, v){
  if (isBlink) {
    return;
  }
  delay = delay + it * 1000;
  if (it === 0) {
    delay = v * 1000;
  }
  if (delay <= 0) {
    delay = 0;
  }
  setDigits(delay, false);
  return resize();
};

var toggle = function(){
  isRun = !isRun;
  $('#toggle').text(isRun ? "STOP" : "RUN");
  if (!isRun && handler) {
    stopBy = new Date();
    clearInterval(handler);
    handler = null;
    soundToggle(audioEnd, false);
    soundToggle(audioRemind, false);
  }
  if (stopBy) {
    latency = latency + new Date().getTime() - stopBy.getTime();
  }
  if (isRun) {
    return run();
  }
};

var reset = function(){
  if (delay === 0) {
    delay = 1000;
  }
  soundToggle(audioRemind, false);
  soundToggle(audioEnd, false);
  stopBy = 0;
  isWarned = false;
  isBlink = false;
  latency = 0;
  start = null;
  isRun = true;
  toggle();
  if (handler) {
    clearInterval(handler);
  }
  handler = null;
  updateColors(BASE_COLOR);
  setDigits(delay, false);
  return resize();
};

var blink = function(){
  isBlink = true;
  isLight = !isLight;
  return updateColors(isLight ? BASE_COLOR : ALERT_COLOR);
};

var count = function(){
  var diff;
  diff = start.getTime() - new Date().getTime() + delay + latency;
  if (diff > 60000) {
    isWarned = false;
  }
  if (diff < 60000 && !isWarned) {
    isWarned = true;
    soundToggle(audioRemind, true);
  }
  if (diff < 55000) {
    soundToggle(audioRemind, false);
  }
  if (diff < 0 && !isBlink) {
    soundToggle(audioEnd, true);
    isBlink = true;
    diff = 0;
    clearInterval(handler);
    handler = setInterval(function(){
      return blink();
    }, 500);
  }
  setDigits(diff);
  return resize();
};

var run = function(){
  if (start === null) {
    start = new Date();
    latency = 0;
    isBlink = false;
  }
  if (handler) {
    clearInterval(handler);
  }
  if (isBlink) {
    return handler = setInterval(function(){
      return blink();
    }, 500);
  } else {
    return handler = setInterval(function(){
      return count();
    }, 100);
  }
};

var resize = function(){
  var w, h, size, gap;
  w = $(window).width();
  h = $(window).height();
  size = Math.min(w / 6, h * 0.55);
  gap = size * 0.08;
  $('#timer').css('--digit-size', size + "px");
  return $('#timer').css('--gap-size', gap + "px");
};

var prepareDigits = function(){
  digitMap.minutesTens = document.querySelector('[data-digit="minutes-tens"]');
  digitMap.minutesOnes = document.querySelector('[data-digit="minutes-ones"]');
  digitMap.secondsTens = document.querySelector('[data-digit="seconds-tens"]');
  digitMap.secondsOnes = document.querySelector('[data-digit="seconds-ones"]');
  return setDigits(delay, false);
};

window.onload = function(){
  prepareDigits();
  resize();
  audioRemind = newAudio('audio/smb_warning.mp3');
  return audioEnd = newAudio('audio/smb_mariodie.mp3');
};

window.onresize = function(){
  return resize();
};
