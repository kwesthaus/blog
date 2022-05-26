thickness = 5;

// bezel ring outer
bro = 95;
// bezel ring inner
bri = bro - thickness;
// body outer
bo = bro + thickness;
// body inner
bi = bri - thickness


function base() {
    return cylinder({h: 5, r1: bo, r2: bo});
}

function wall() {
    return difference(
        cylinder({h: 20, r1: bo, r2: bo}),
        cylinder({h: 20, r1: bi, r2: bi})
    )
}

function channel() {
    return difference(
        difference(
            cylinder({h: 5, r1: bo, r2: bo}),
            cylinder({h: 5, r1: bi, r2: bi})
        ),
        difference(
            cylinder({h: 5, r1: bro, r2: bro}),
            cylinder({h: 5, r1: bri, r2: bri})
        )
    );
}

function body() {
    return union(
        base(),
        translate([0, 0, 5], wall()),
        translate([0, 0, 25], channel())
    );
}


function bezel_ring() {
    return difference(
        cylinder({h: 5, r1: bro, r2: bro}),
        cylinder({h: 5, r1: bri, r2: bri})
    );
}

function bezel_brim() {
    return difference(
        cylinder({h: 5, r1: bo, r2: bro}),
        translate([0, 0, 2], cylinder({h: 3, r1: bri, r2: bri}))
    );
}

function bezel(p) {
    lift = parseInt(p.lift);
    return union(
        translate([0, 0, 25+lift], bezel_ring()),
        translate([0, 0, 30+lift], bezel_brim())
    );
}


function screen(p) {
    lift = parseInt(p.lift);
    return translate([0, 0, 32+lift], cylinder({h: 2, r1: bri, r2: bri}));
}


function glue() {
    return translate([0, 0, 25],
        difference(
            cylinder({h: 1, r1: bro, r2: bro}),
            cylinder({h: 1, r1: bri, r2: bri})
        )
    )
}



function main(p) {
    return union(
        body().setColor(0.0, 1.0, 0.0),
        bezel(p).setColor(0.0, 1.0, 1.0),
        screen(p).setColor(0.4, 0.4, 0.4),
        glue().setColor(1.0, 0.0, 0.0)
    );
}

function getParameterDefinitions() { 
  return [ 
    { name: 'lift', type: 'slider', initial: 45, min: 1, max: 50, step: 1, caption: 'Screen lift:' },
    ]; 
} 
