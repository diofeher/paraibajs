var contextClass = (window.AudioContext || 
  window.webkitAudioContext || 
  window.mozAudioContext || 
  window.oAudioContext || 
  window.msAudioContext);
if (contextClass) {
  // Web Audio API is available.
  var context = new contextClass();
}

var sounds = {};
sounds_src = {
    'kick': 'sounds/drums/kick.wav',
    'snare': 'sounds/drums/snare.wav',
    'hihat': 'sounds/drums/hihat_open.wav'
};

function loadBuffer(element, url) {
    var request = new XMLHttpRequest();
    var buffer;
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    function onError(err) {
        console.log(err);
    }
    // Decode asynchronously
    request.onload = function() {
      context.decodeAudioData(request.response, function(buffer) {
        sounds[element] = buffer;
      }, onError);
    };
    request.send();
}

function loadSounds() {
    for(var element in sounds_src) {
        loadBuffer(element, sounds_src[element]);
    }
}

function playDrum(buffer, i, bpm) {
    setTimeout(function(){
        var source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(context.destination);
        source.start(0);
    }, bpm * i);
}

loadSounds();