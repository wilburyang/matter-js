/**
* The `Matter.Sound` module contains methods for creating and manipulating sounds.
* An engine is a controller that manages updating the simulation of the world.
* See `Matter.Runner` for an optional game loop utility.
*
* See the included usage [examples](https://github.com/liabru/matter-js/tree/master/examples).
*
* @class Sound
*/

var Sound = {};

module.exports = Sound;

/*var World = require('../body/World');
var Sleeping = require('./Sleeping');
var Resolver = require('../collision/Resolver');
var Render = require('../render/Render');
var Pairs = require('../collision/Pairs');
var Metrics = require('./Metrics');
var Grid = require('../collision/Grid');
var Events = require('./Events');
var Composite = require('../body/Composite');
var Constraint = require('../constraint/Constraint');
var Common = require('./Common');
var Body = require('../body/Body');*/

(function() {

    Sound.player = {};
    Sound.player.ctx = new (window.AudioContext || window.webkitAudioContext)();
    Sound.player.channels = 1;
    Sound.player.frames = Sound.player.ctx.sampleRate / 50; // a tenth of a second

    /**
     * Creates a new engine. The options parameter is an object that specifies any properties you wish to override the defaults.
     * All properties have default values, and many are pre-calculated automatically based on other properties.
     * See the properties section below for detailed information on what you can pass via the `options` object.
     * @method create
     * @param {HTMLElement} element
     * @param {object} [options]
     * @return {engine} engine
     */
    /*Sound.create = function() {
    
        var sound,
            frames;
            
        sound = {};
    
        sound.ctx = new (window.AudioContext || window.webkitAudioContext)();
        sound.channels = 1;
        sound.frames = sound.ctx.sampleRate / 100; // every tenth of a second
        sound.buffer = sound.ctx.createBuffer(sound.channels, sound.frames, sound.ctx.sampleRate);
    
        // http://stackoverflow.com/questions/5408406/web-workers-without-a-separate-javascript-file
        var blob = new Blob([workerText], {type: "text/javascript"});
        sound.worker = new Worker(window.URL.createObjectURL(blob));
        
        console.log(sound.worker);
        sound.worker.onmessage = function(e) {
            var source;
        
            sound.buffer.copyToChannel(e.data, 0);
            source = sound.ctx.createBufferSource();
            source.buffer = sound.buffer;
            source.connect(sound.ctx.destination);
            source.start();
        };
        
        return sound;
    };*/
    
    var workerText = 'function accelerationNoise(a){for(var e=a.collision,o=480,t=new Float32Array(o),n=0;o>n;n++)t[n]=-Math.cos(n/o*Math.PI)*e.depth/5;return t}onmessage=function(a){var e=a.data,o=accelerationNoise(e);postMessage(o)};';
    
    // http://stackoverflow.com/questions/5408406/web-workers-without-a-separate-javascript-file
    var blob = new Blob([workerText], {type: "text/javascript"});
    var workers = [];
    //http://stackoverflow.com/questions/13574158/number-of-web-workers-limit
    var maxWorkers = 16;
    for (var i = 0; i < maxWorkers; i++) {
        workers[i] = new Worker(window.URL.createObjectURL(blob));
        workers[i].onmessage = function(e) {
            var bufferData = e.data;
            var buffer = Sound.player.ctx.createBuffer(Sound.player.channels, bufferData.length, Sound.player.ctx.sampleRate);
            buffer.copyToChannel(bufferData, 0);
            var source = Sound.player.ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(Sound.player.ctx.destination);
            //console.log('Playing sound at ' + (new Date().getTime()));
            source.start();
        };
    }
    
    Sound.playCollisionSound = function(pair) {
        var randomWorker = Math.floor(Math.random() * maxWorkers);
        workers[randomWorker].postMessage(pair);
    };
    
    Sound.close = function(sound) {
    };
    
})();