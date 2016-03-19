

/*function magnitude(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y);
}*/

var evals, evecs, trevecs, verts, n, l;

// constants

var rho = 8943,
    E = 123.4e9;

var defaultE = 7e10;

var h = 1 / 48000;

var alpha = 10,
    beta = 0.00001;

var w, xi, wd, eps, theta, gamma;

var firstTerm, secondTerm, thirdTerm;


function runSetup(url) {
    console.log('Setting up...');
    importScripts(url + '/demo/js/lib/numeric-1.2.6.min.js');
    getModes(url, function(error, evalues, evectors, vertices) {
        if (!error) {
            evals = evalues;
            evecs = numeric.div(evectors, Math.sqrt(rho));
            trevecs = numeric.transpose(evecs);
            verts = vertices;
            n = vertices.length;
            l = evectors.length;
            
            w = numeric.mul(Math.sqrt(E / defaultE), numeric.sqrt(numeric.div(evals, rho)));
            xi = numeric.mul(0.5, numeric.add(numeric.div(alpha, w), numeric.mul(beta, w)));
            wd = numeric.mul(w, numeric.sqrt(numeric.sub(1, xi)));
            eps = numeric.exp(numeric.mul(-1, numeric.mul(h, numeric.mul(xi, numeric.mul(w)))));
            theta = numeric.mul(h, wd);
            gamma = numeric.asin(xi);
            
            firstTerm = numeric.mul(2, numeric.mul(eps, numeric.cos(theta)));
            secondTerm = numeric.mul(eps, eps);
            thirdTerm = numeric.div(numeric.mul(2, numeric.sub(numeric.mul(eps, numeric.cos(numeric.add(theta, gamma)))), numeric.mul(eps, numeric.mul(eps, numeric.mul(numeric.cos(numeric.mul(2, numeric.add(theta, gamma))))))), numeric.add(numeric.mul(3, w), wd));
        }
    });
}

function accelerationNoise(pair) {
    //console.log(pair);
    //console.log(numeric);

    var collision = pair.collision;
    //console.log(collision);
    
    var frames = 48000 / 1000; // placeholder
    var bufferData = new Float32Array(frames);
    for (var i = 0; i < frames; i++) {
        bufferData[i] = -Math.cos(i / frames * Math.PI) * collision.depth / 15;
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

function parseContact(id) {
    var i = id.indexOf('_');
    return {
        body: +(id.substr(0, i)),
        vertex: +(id.substr(i + 1))
    };
}

function pairToBody(pair, id, other) {
    if (other ^ (pair.bodyA.id === id)) {
        return pair.bodyA;
    } else {
        return pair.bodyB;
    }
}

function bodyToVertexPosition(body, id) {
    return body.vertices[id];
}

function add(a, b) {
    return {
        x: a.x + b.x,
        y: a.y + b.y
    };
}

function mult(a, b) {
    return {
        x: a.x * b,
        y: a.y * b
    };
}

function getLocalImpulse(body, pos, normal) {
    var x = add(body.position, mult(pos, -1));
    var invRot = numeric.inv(getRotationMatrix(body.angle));
    var localPos = m2P(numeric.dot(invRot, p2M(x)));
    //console.log(body.id, localPos);
    return {
        pos: localPos,
        normal: m2P(numeric.dot(invRot, normal))
    };
}

function dist(a, b) {
    var x = a.x - b.x;
    var y = a.y - b.y;
    return x * x + y * y;
}

function findNearestVertex(impulse) {
    var pos = impulse.pos;
    var ind = 0;
    var nv = Infinity;
    verts.forEach(function(v, i) {
        v = mult(m2P(numeric.transpose([v])), 15);
        var d = dist(v, pos);
        if (d < nv) {
            nv = d;
            ind = i;
        }
    });
    return ind;
}

function m2P(m) {
    return {
        x: m[0][0],
        y: m[1][0]
    };
}

function p2M(p) {
    return [[p.x], [p.y]];
}

function getRotationMatrix(theta) {
    return [[ Math.cos(theta), -Math.sin(theta) ],
            [ Math.sin(theta), Math.cos(theta) ]];
}

function generateModalSound(pair) {
    var frames = 48000 / 10; // placeholder
    var bufferData = new Float32Array(frames);

    // for now, approximate force with depth
    var normal = p2M(pair.collision.normal);
    var numContacts = Object.keys(pair.contacts).length;
    var depthPerContact = pair.collision.depth / numContacts;
    var Q = numeric.rep([l, 1], 0);
    for (var contactKey in pair.contacts) {
        var contact = parseContact(pair.contacts[contactKey].id);
        var body = pairToBody(pair, contact.body);
        var vertexPos = bodyToVertexPosition(body, contact.vertex);
        var impulse = getLocalImpulse(body, vertexPos, normal);
        var nearestVertex = findNearestVertex(impulse);
        //console.log('nearest vertex is:', nearestVertex);
        var QComponent = modalForceMatrix(nearestVertex, impulse.normal, depthPerContact);
        Q = numeric.add(Q, QComponent);
        var body2 = pairToBody(pair, contact.body, true);
        if (body2.angle === 0) continue; // don't play sound of bounding boxes
        var vertexPos2 = bodyToVertexPosition(body2, contact.vertex);
        var impulse2 = getLocalImpulse(body2, vertexPos2, numeric.mul(-1, normal));
        var nearestVertex2 = findNearestVertex(impulse2);
        var QComponent2 = modalForceMatrix(nearestVertex2, impulse2.normal, depthPerContact);
        Q = numeric.add(Q, QComponent2);
    }
    //console.log(Q);
    var q = numeric.rep([2 * n, 1], 0);
    var qp = numeric.clone(q);
    var qpp = numeric.clone(q);
    var alpha = 0, beta = 0;
    for (var i = 0; i < frames; i++) {
        bufferData[i] = numeric.sum(q) * 100;
        qpp = numeric.clone(qp);
        qp = numeric.clone(q);
        

        q = numeric.sub(numeric.mul(firstTerm, qp), numeric.mul(secondTerm, qpp));
        //q = numeric.add(q, numeric.mul(thirdTerm, numeric.mul(Q, Math.sin(i / frames * Math.PI))));
        q = numeric.add(q, numeric.mul(thirdTerm, Q));
    }
    return bufferData;
}

function modalForceMatrix(vertexInd, normal, depth) {
    //console.log(vertexInd, normal, depth);
    var uColumns = numeric.transpose([trevecs[2 * vertexInd], trevecs[2 * vertexInd + 1]]);
    var f = p2M(mult(normal, depth));
    return numeric.dot(uColumns, f);
}

function postProcess(buffer) {
    //var k = buffer.length - 1;
    /*for (var i = 0; i < buffer.length; i++) {
        var same = true;
        for (var j = i; j < i + 5 && j < buffer.length; j++) {
            if (Math.abs(buffer[i] - buffer[j]) > 1e-9) {
                same = false;
            }
        }
        if (same) {
            k = i;
            break;
        }
    }*/
    //console.log(k);
    //buffer.length = k + 1;
    /*for (var i = k; i < buffer.length; i++) {
        buffer[i] *= 1 - (i - k) / (buffer.length - k + 1);
    }
    buffer[buffer.length - 1] = 0;*/
    var start = Math.floor(buffer.length * 3 / 4);
    for (var i = start; i < buffer.length; i++) {
        buffer[i] *= Math.exp(-(i - start) / 100);
    }
    return buffer;
}

function modalSound(pair) {
    // for now, assume all shapes are squares
    
    if (!evals || !evecs) return;
      
    var time = new Date().getTime();
    var buffer = generateModalSound(pair);
    //console.log(buffer);
    console.log(new Date().getTime() - time);
    return postProcess(buffer);
}

this.onmessage = function(e) {
    var obj = e.data;
    if (obj.task === 'setup') {
        runSetup(obj.url);
    } else {
        //var accNoise = accelerationNoise(obj);
        var modalNoise = modalSound(obj);
        /*for (var i = 0; i < modalNoise.length; i++) {
            modalNoise[i] += accNoise[i];
        }*/
        postMessage(modalNoise);
    }
};

function getModes(url, callback) {
    var count = 0,
        evecs = null,
        evals = null,
        verts = null;
        
    getEigenvalues(url, function(err, values) {
        evals = values;
        if (err && count === 0) {
            callback(err);
        } else if (++count === 3) {
            callback(null, evals, evecs, verts);
        }
    });
    getEigenvectors(url, function(err, vectors) {
        evecs = vectors;
        if (err && count === 0) {
            callback(err);
        } else if (++count === 3) {
            callback(null, evals, evecs, verts);
        }
    });
    getVertices(url, function(err, vertices) {
        verts = vertices;
        if (err && count === 0) {
            callback(err);
        } else if (++count === 3) {
            callback(null, evals, evecs, verts);
        }
    });
}

function getEigenvalues(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', function() {
        if (xhr.status === 200) {
            callback(null, JSON.parse(xhr.responseText));
        } else {
            callback('Error: cannot load eigenvalues');
        }
    });
    xhr.open('GET', url + '/demo/js/lib/modes/eigenvalues_small.json');
    xhr.send();
}

function getEigenvectors(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', function() {
        if (xhr.status === 200) {
            callback(null, JSON.parse(xhr.responseText));
        } else {
            callback('Error: cannot load eigenvectors');
        }
    });
    xhr.open('GET', url + '/demo/js/lib/modes/eigenvectors_small.json');
    xhr.send();
}

function getVertices(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', function() {
        if (xhr.status === 200) {
            callback(null, JSON.parse(xhr.responseText));
        } else {
            callback('Error: cannot load vertices');
        }
    });
    xhr.open('GET', url + '/demo/js/lib/modes/vertices.json');
    xhr.send();
}