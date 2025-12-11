var start, isBlink, isLight, isRun, isShow, isWarned, handler, latency, stopBy, delay, totalDuration, audioRemind, audioEnd;
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
totalDuration = delay;
audioRemind = null;
audioEnd = null;
var BASE_COLOR = '#b25f00';
var ALERT_COLOR = '#ff6b6b';

var newAudio = function(file){
  var node;
  node = new Audio();
  node.src = file;
  node.loop = false;
  node.load();
  document.body.appendChild(node);
  return node;
};

var soundToggle = function(des, state){
  var x$;
  if (state) {
    return des.play();
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

var formatDigits = function(value){
  return value < 10 ? "0" + value : "" + value;
};

var updateDisplay = function(ms){
  var safe, minutes, seconds, hundredths, percent, clamped;
  safe = Math.max(0, ms);
  minutes = Math.floor(safe / 60000);
  seconds = Math.floor((safe % 60000) / 1000);
  hundredths = Math.floor((safe % 1000) / 10);
  $('#time-text').text(formatDigits(minutes) + '.' + formatDigits(seconds) + '.' + formatDigits(hundredths));
  clamped = totalDuration > 0 ? Math.max(0, Math.min(totalDuration, safe)) : 0;
  percent = totalDuration > 0 ? Math.max(0, Math.min(100, (clamped / totalDuration) * 100)) : 0;
  $('#progress-fill').css('width', percent + '%');
  $('#progress-indicator').css('left', percent + '%');
  return $('.progress-track').attr('aria-valuenow', percent.toFixed(0));
};

var updateColors = function(color){
  $('#timer').css('--accent-color', color);
  $('#progress-fill').css('--accent-color', color);
  $('#time-text').css('color', color);
  $('#progress-indicator').css({
    borderColor: color,
    color: color
  });
  return $('#progress-fill').css('background', isBlink ? 'linear-gradient(90deg, rgba(255, 107, 107, 0.2), ' + ALERT_COLOR + ')' : 'linear-gradient(90deg, rgba(255, 235, 59, 0.28), #ffb300)');
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
  totalDuration = Math.max(delay, 1000);
  updateDisplay(delay);
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
  totalDuration = delay;
  isRun = true;
  toggle();
  if (handler) {
    clearInterval(handler);
  }
  handler = null;
  updateColors(BASE_COLOR);
  updateDisplay(delay);
  return resize();
};

var blink = function(){
  isBlink = true;
  isLight = !isLight;
  $('#progress-fill').toggleClass('alert');
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
  return updateDisplay(diff);
};

var run = function(){
  if (start === null) {
    start = new Date();
    latency = 0;
    isBlink = false;
    totalDuration = Math.max(delay, 1000);
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
  var w, h, size;
  w = $(window).width();
  h = $(window).height();
  size = Math.min(w, h) * 0.12;
  $('#time-text').css('font-size', Math.max(48, size) + 'px');
  return $('.progress-track').css('height', Math.max(12, size * 0.25) + 'px');
};

window.onload = function(){
  resize();
  updateDisplay(delay);
  audioRemind = newAudio('audio/smb_warning.mp3');
  return audioEnd = newAudio('audio/smb_mariodie.mp3');
};

window.onresize = function(){
  return resize();
};
