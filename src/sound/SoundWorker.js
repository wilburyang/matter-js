

/*function magnitude(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y);
}*/

function accelerationNoise(pair) {

    //console.log(pair);

    var collision = pair.collision;
    //var impulse = magnitude(collision.bodyA.positionImpulse) + magnitude(collision.bodyB.positionImpulse);
    
    var frames = 48000 / 1000; // placeholder
    var bufferData = new Float32Array(frames);
    for (var i = 0; i < frames; i++) {
        bufferData[i] = -Math.cos(i / frames * Math.PI) * collision.depth / 5;
    }

    /*var start = new Date().getTime();
    for (i = 0; i < 100000; ++i) { // simulate some computation
        Math.sin(new Date().getTime());
    }
    var end = new Date().getTime();
    var time = end - start;*/
    //console.log('Simulating ' + time + 'ms of computation');
    
    return bufferData;
}

function modalSound(pair) {
    // for now, assume all shapes are circles
    
    
}

onmessage = function(e) {
    var pair = e.data;
    var accNoise = accelerationNoise(pair);
    postMessage(accNoise);
}