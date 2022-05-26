thickness = 5;

// screen outer
so = 95;
// body outer
bo = so + thickness;
// body inner
bi = so - thickness

function base() {
    return cylinder({h: 5, r1: bo, r2: bo});
}

function wall() {
    return difference(
        cylinder({h: 20, r1: bo, r2: bo}),
        cylinder({h: 20, r1: bi, r2: bi})
    )
}

function bezel() {
    return difference(
        cylinder({h: 5, r1: bo, r2: bo}),
        cylinder({h: 5, r1: so, r2: so})
    );
}

function body() {
    return union(
        base(),
        translate([0, 0, 5], wall()),
        translate([0, 0, 25], bezel())
    );
}

function screen(p) {
    lift = parseInt(p.lift);
    return translate([0, 0, 25+lift], cylinder({h: 5, r1: so-1, r2: so-1}));
}

function glue() {
    return translate([0, 0, 25],
        difference(
            cylinder({h: 1, r1: so, r2: so}),
            cylinder({h: 1, r1: bi, r2: bi})
        )
    )
}

function main(p) {
    return union(
        body().setColor(0.0, 1.0, 0.0),
        screen(p).setColor(0.4, 0.4, 0.4),
        glue().setColor(1.0, 0.0, 0.0)
    );
}

function getParameterDefinitions() { 
  return [ 
    { name: 'lift', type: 'slider', initial: 45, min: 0, max: 50, step: 1, caption: 'Screen lift:' },
    ]; 
} 
