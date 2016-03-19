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
    
    var workerCode = '/*BEGINSOUNDWORKER*/function runSetup(e){console.log("Setting up..."),importScripts(e+"/demo/js/lib/numeric-1.2.6.min.js"),getModes(e,function(e,r,t,o){e||(evals=r,evecs=numeric.div(t,Math.sqrt(rho)),trevecs=numeric.transpose(evecs),verts=o,n=o.length,l=t.length,w=numeric.mul(Math.sqrt(E/defaultE),numeric.sqrt(numeric.div(evals,rho))),xi=numeric.mul(.5,numeric.add(numeric.div(alpha,w),numeric.mul(beta,w))),wd=numeric.mul(w,numeric.sqrt(numeric.sub(1,xi))),eps=numeric.exp(numeric.mul(-1,numeric.mul(h,numeric.mul(xi,numeric.mul(w))))),theta=numeric.mul(h,wd),gamma=numeric.asin(xi),firstTerm=numeric.mul(2,numeric.mul(eps,numeric.cos(theta))),secondTerm=numeric.mul(eps,eps),thirdTerm=numeric.div(numeric.mul(2,numeric.sub(numeric.mul(eps,numeric.cos(numeric.add(theta,gamma)))),numeric.mul(eps,numeric.mul(eps,numeric.mul(numeric.cos(numeric.mul(2,numeric.add(theta,gamma))))))),numeric.add(numeric.mul(3,w),wd)))})}function accelerationNoise(e){for(var n=e.collision,r=48,t=new Float32Array(r),o=0;r>o;o++)t[o]=-Math.cos(o/r*Math.PI)*n.depth/15;return t}function parseContact(e){var n=e.indexOf("_");return{body:+e.substr(0,n),vertex:+e.substr(n+1)}}function pairToBody(e,n,r){return r^e.bodyA.id===n?e.bodyA:e.bodyB}function bodyToVertexPosition(e,n){return e.vertices[n]}function add(e,n){return{x:e.x+n.x,y:e.y+n.y}}function mult(e,n){return{x:e.x*n,y:e.y*n}}function getLocalImpulse(e,n,r){var t=add(e.position,mult(n,-1)),o=numeric.inv(getRotationMatrix(e.angle)),i=m2P(numeric.dot(o,p2M(t)));return{pos:i,normal:m2P(numeric.dot(o,r))}}function dist(e,n){var r=e.x-n.x,t=e.y-n.y;return r*r+t*t}function findNearestVertex(e){var n=e.pos,r=0,t=1/0;return verts.forEach(function(e,o){e=mult(m2P(numeric.transpose([e])),15);var i=dist(e,n);t>i&&(t=i,r=o)}),r}function m2P(e){return{x:e[0][0],y:e[1][0]}}function p2M(e){return[[e.x],[e.y]]}function getRotationMatrix(e){return[[Math.cos(e),-Math.sin(e)],[Math.sin(e),Math.cos(e)]]}function generateModalSound(e){var r=4800,t=new Float32Array(r),o=p2M(e.collision.normal),i=Object.keys(e.contacts).length,u=e.collision.depth/i,s=numeric.rep([l,1],0);for(var c in e.contacts){var a=parseContact(e.contacts[c].id),m=pairToBody(e,a.body),d=bodyToVertexPosition(m,a.vertex),v=getLocalImpulse(m,d,o),p=findNearestVertex(v),f=modalForceMatrix(p,v.normal,u);s=numeric.add(s,f);var g=pairToBody(e,a.body,!0);if(0!==g.angle){var h=bodyToVertexPosition(g,a.vertex),x=getLocalImpulse(g,h,numeric.mul(-1,o)),M=findNearestVertex(x),y=modalForceMatrix(M,x.normal,u);s=numeric.add(s,y)}}for(var T=numeric.rep([2*n,1],0),b=numeric.clone(T),w=numeric.clone(T),E=0;r>E;E++)t[E]=100*numeric.sum(T),w=numeric.clone(b),b=numeric.clone(T),T=numeric.sub(numeric.mul(firstTerm,b),numeric.mul(secondTerm,w)),T=numeric.add(T,numeric.mul(thirdTerm,s));return t}function modalForceMatrix(e,n,r){var t=numeric.transpose([trevecs[2*e],trevecs[2*e+1]]),o=p2M(mult(n,r));return numeric.dot(t,o)}function postProcess(e){for(var n=Math.floor(3*e.length/4),r=n;r<e.length;r++)e[r]*=Math.exp(-(r-n)/100);return e}function modalSound(e){if(evals&&evecs){var n=(new Date).getTime(),r=generateModalSound(e);return console.log((new Date).getTime()-n),postProcess(r)}}function getModes(e,n){var r=0,t=null,o=null,i=null;getEigenvalues(e,function(e,u){o=u,e&&0===r?n(e):3===++r&&n(null,o,t,i)}),getEigenvectors(e,function(e,u){t=u,e&&0===r?n(e):3===++r&&n(null,o,t,i)}),getVertices(e,function(e,u){i=u,e&&0===r?n(e):3===++r&&n(null,o,t,i)})}function getEigenvalues(e,n){var r=new XMLHttpRequest;r.addEventListener("load",function(){200===r.status?n(null,JSON.parse(r.responseText)):n("Error: cannot load eigenvalues")}),r.open("GET",e+"/demo/js/lib/modes/eigenvalues_small.json"),r.send()}function getEigenvectors(e,n){var r=new XMLHttpRequest;r.addEventListener("load",function(){200===r.status?n(null,JSON.parse(r.responseText)):n("Error: cannot load eigenvectors")}),r.open("GET",e+"/demo/js/lib/modes/eigenvectors_small.json"),r.send()}function getVertices(e,n){var r=new XMLHttpRequest;r.addEventListener("load",function(){200===r.status?n(null,JSON.parse(r.responseText)):n("Error: cannot load vertices")}),r.open("GET",e+"/demo/js/lib/modes/vertices.json"),r.send()}var evals,evecs,trevecs,verts,n,l,rho=8943,E=1234e8,defaultE=7e10,h=1/48e3,alpha=10,beta=1e-5,w,xi,wd,eps,theta,gamma,firstTerm,secondTerm,thirdTerm;this.onmessage=function(e){var n=e.data;if("setup"===n.task)runSetup(n.url);else{var r=modalSound(n);postMessage(r)}};/*ENDSOUNDWORKER*/';
    
    // http://stackoverflow.com/questions/5408406/web-workers-without-a-separate-javascript-file
    var blob = new Blob([workerCode], {type: "text/javascript"});
    var workers = [];
    //http://stackoverflow.com/questions/13574158/number-of-web-workers-limit
    var maxWorkers = 4;
    for (var i = 0; i < maxWorkers; i++) {
        workers[i] = new Worker(window.URL.createObjectURL(blob));
        workers[i].onmessage = function(e) {
            var bufferData = e.data;
            var buffer = Sound.player.ctx.createBuffer(Sound.player.channels, bufferData.length, Sound.player.ctx.sampleRate);
            buffer.copyToChannel(bufferData, 0);
            var source = Sound.player.ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(Sound.player.ctx.destination);
            source.start();
        };
        //http://stackoverflow.com/questions/22172426/using-importsscripts-within-blob-in-a-karma-environment
        workers[i].postMessage({
            task: 'setup',
            url: document.location.protocol + '//' + document.location.host
        });
    }
    
    Sound.playCollisionSound = function(pair) {
        var randomWorker = Math.floor(Math.random() * maxWorkers);
        workers[randomWorker].postMessage(pair);
    };
    
    Sound.close = function(sound) {
    };
    
})();