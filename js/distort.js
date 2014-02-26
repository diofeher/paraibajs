var Distort = function(config){
	var self = this;
	var ctx = this.ctx = new (window.webkitAudioContext||window.AudioContext)();
	
	var config = this.config = {
		fftSize:2048,
		noise:0,
		clip:1,
		removeLowFreq:true,
		freqThreshold:350,
		Qrange:5
	};
	this.playing = false;
	
	this.src = ctx.createBufferSource();
	this.processor = ctx.createScriptProcessor(config.fftSize);
	
	this.filter = ctx.createBiquadFilter();
	this.filter.type = this.filter.HIGHPASS;
	
	this.load = function(file,progress,loaded){
		var xhr = new XMLHttpRequest();
		xhr.responseType = 'arraybuffer';
		xhr.onload = function(){
			ctx.decodeAudioData(xhr.response,function(b){
				self.src.buffer = b;
				loaded();
			},function(e){
				console.log('Audio decode failed!',e);
			});
		};
		xhr.onprogress = function(e){
			if(e.lengthComputable){
				progress(e.position||e.loaded,e.totalSize||e.total);
			}
		};
		xhr.open('GET',file,true);
		xhr.send(null);
	};
	
	this.play = function(){
		this.src.noteOn(0);
		this.playing = true;
	};
	
	this.stop = function(){
		this.src.noteOff(0);
		this.playing = false;
	};
	
	this.process = function(v){
		var n = this.clip(v);
		n = this.noise(n);
		n = this.removeLowFreq(n);
		return n;
	};
	
	this.clip = function(v){
		return Math.abs(v) > config.clip ? (v < 0 ? -1 : 1) : v;
	};
	
	this.noise = function(v){
		return (v * (1 - config.noise)) + (Math.random() * config.noise);
	};
	
	this.removeLowFreq = function(v){
		if(config.removeLowFreq){
			this.filter.frequency.value = config.freqThreshold;
			this.filter.Q.value = Math.abs(v) * config.Qrange;
		}
		else {
			this.filter.frequency.value = 0;
			this.filter.Q.value = 0;
		}
		return v;
	};
	
	this.processor.onaudioprocess = function(e){
		var inp0 = e.inputBuffer.getChannelData(0);
		var inp1 = e.inputBuffer.getChannelData(1);
		var out0 = e.outputBuffer.getChannelData(0);
		var out1 = e.outputBuffer.getChannelData(1);
		
		for(var i = 0; i < inp0.length; i++){
			out0[i] = self.process(inp0[i]);
			out1[i] = self.process(inp1[i]);
		}
	};
	
	this.src.connect(this.filter);
	this.filter.connect(this.processor);
	this.processor.connect(ctx.destination);
};

window.Distort = Distort;