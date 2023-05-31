import { Vector2D } from "./Vector2D.js";

class Matrix2 {
    constructor(m00,m01, m10, m11) {
        this.m00 = m00;
        this.m01 = m01;
        this.m10 = m10;
        this.m11 = m11;
    }

    set(radians) {
        var c = Math.cos(radians);
        var s = Math.sin(radians);

        this.m00 = c;
        this.m01 = -s;
        this.m10 = s;
        this.m11 = c;
    }

    transpose() {
        return new Matrix2(this.m00, this.m10, this.m01, this.m11);
    }

    multiplay(mat) {
        return new Matrix2(this.m00 * mat.m00 + this.m01 * mat.m10,
                            this.m00 * mat.m01 + this.m01 * mat.m11,
                            this.m10 * mat.m00 + this.m11 * mat.m10,
                            this.m10 * mat.m01 + this.m11 * mat.m11);
    }

}

class State {

    constructor(pos, vel) {
        this.x = pos;
        this.v = vel;
    }
}


class Derivative {

    constructor(vel, a) {
        this.dx = vel || Vector2D.Zero;
        this.dv = a || Vector2D.Zero;
    }

    evaluate(initial, t, dt, deri) {

        var state = new State();
        

        state.x = initial.x.add(deri.dx.multiplay(dt));
        state.v = initial.v.add(deri.dv.multiplay(dt));

        

        var output = new Derivative();
        output.dx = state.v;
        output.dv = this.acceleration(state, t+dt);

        return output;
    }

    acceleration(state, t) {

        var k = 15;
        var b = 0.1;
        var c = state;
        c.x = c.x.multiplay(-k);
        c.v = c.v.multiplay(b);

        return c.x.sub(c.v);
    }
}

class Grid {

    _grid = [];
    _gridCellSize = 10;
    _width;
    _height;


}