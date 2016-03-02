(function() {

    var World = Matter.World,
        Bodies = Matter.Bodies,
        Body = Matter.Body,
        Composite = Matter.Composite,
        Composites = Matter.Composites,
        Common = Matter.Common,
        Events = Matter.Events,
        Sound = Matter.Sound;

    Example.sound = function(demo) {
        var engine = demo.engine,
            world = engine.world,
            mouseConstraint = demo.mouseConstraint,
            sceneEvents = demo.sceneEvents;
        
        // bind events (sceneEvents is only used for this demo)
        
        sceneEvents.push(Events.on(engine, 'collisionStart', function(event) {
            var pairs = event.pairs;
            pairs.forEach(function(p) {
                Sound.playCollisionSound(p);
            });
        }));

        // scene code

        var stack = Composites.stack(50, 100, 8, 4, 50, 50, function(x, y) {
            return Bodies.circle(x, y, 15, { restitution: 0.8, render: { strokeStyle: '#777' } });
        });
        
        World.add(world, stack);

        var renderOptions = engine.render.options;
        renderOptions.wireframes = false;
    };

})();