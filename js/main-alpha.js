import { Vector2D } from 'modules/Vector2D.js';

class Furgo {
    constructor() {

        this.Graphics = new Graphics();
        this.Time = new Time();

        this.mainLoop;
    }

    update() {

        this.mainLoop = requestAnimationFrame(()=>this.update());

        this.Time.calcFrame();
        
        while(this.Time.accumulator >= this.Time.deltaTime) {
            
            GameObjectsManager.Update(this.Time.t, this.Time.deltaTime);

            this.Time.t += this.Time.deltaTime;
            this.Time.accumulator -= this.Time.deltaTime;

        }
    
        this.draw();
        
    }

    draw() {

        this.Graphics.background();
        GameObjectsManager.Draw(this.Time.alpha);
        fpscounter.innerText = this.Time.countFps;

    }
}



class Graphics {
    constructor() {

        this.windows = document.getElementById("GameWindow");
        this.ctx = this.windows.getContext("2d");

        this.objectType = "Graphics";
    }

    static get type() {
        return this.objectType;
    }

    get type() {
        return this.objectType;
    }

    fillRect(pos, w, h, color) {
        
        this.ctx.beginPath();
        this.ctx.fillStyle = color;
        this.ctx.rect(pos.x, pos.y, w, h);
        this.ctx.fill();
        
    
    }

    Draw() {

    }

    background() {

        this.ctx.beginPath();
        this.ctx.fillStyle = 'black';
        this.ctx.rect(0, 0, 800, 600);
        this.ctx.fill();

    }

    fromShape(pos, s) {
        this.fillRect(pos, s.w, s.h, s.color);
    }

}

class Renderer extends Graphics {
    constructor() {
        super();
        
        this.objectType = "Renderer";

        this.Shape = {
            w: 20,
            h: 20,
            color: "blue"
        };
    }

    Shape() {
        return this.Shape;
    }

    Update() {

    }

    Draw(alpha) {
        
        this.transform.pos.x = this.transform.pos.x * alpha 
                                + this.transform.origin.x * (1.0 - alpha); 
        this.transform.pos.y = this.transform.pos.y * alpha 
                                + this.transform.origin.y * (1.0 - alpha); 

        this.fromShape(this.transform.pos, this.Shape);
        this.transform.origin = this.transform.pos;
    }

    get gameObject() {
        return GameObjectsManager.findById(this.gameObjectId);
    }

    get transform() {
        return this.gameObject.transform;
    }

    static get type() {
        return this.objectType;
    }

    static create() {
        return new Renderer();
    }

}

class Vector2D {
    constructor(x, y) {
        
        this.x = x;
        this.y = y;
        this.objectType = "Vector2D";
    }

    static get type() {
        return this.objectType;
    }

    get type() {
        return this.objectType;
    } 

    add(other) {
        return new Vector2D(this.x + other.x, this.y + other.y);
    }

    sub(other) {
        return new Vector2D(this.x - other.x, this.y - other.y);
    }

    multiplay(mul) {
        return new Vector2D(this.x * mul, this.y * mul);
    }

    distance(other) {
        
        return Math.sqrt(Math.pow((this.x - other.x), 2) + 
               Math.pow((this.y - other.y),2));
    }

    get length() {
        return Math.sqrt(x * x + y * y);
    }

    get sqrlenght() {
        return x * x + y * y;
    }

    normalize() {
        var inv_len = 1 / this.length();
        this.x *= inv_len;
        this.y *= inv_len;
    }

    dot(other) {
        return this.x * other.x + this.y * other.y;
    }

    cross(other) {
        return this.x * other.y - this.y * other.x
    }

    angle(mat) {
        return new Vector2D(mat.m00 * this.x + mat.m01 * this.y,
                            mat.m10 * this.x + mat.m11 * this.y);
    }

    static get Up() {
        return new Vector2D(0, -1);
    }

    static get Down() {
        return new Vector2D(0, 1);
    }

    static get Left() {
        return new Vector2D(-1, 0);
    }

    static get Right() {
        return new Vector2D(1, 0);
    }

    static get Zero() {
        return new Vector2D(0, 0);
    }

    static Random(x, y) {
        return new Vector2D(Math.random()*x, Math.random()*y);
    }

    static create(x = Vector2D.Zero, y) {
        
        if(x.type == undefined)
            return new Vector2D(x, y);
        
        return new Vector2D(x.x, x.y);
    }

}

class GameObjectsManager {

    constructor() {

        this.Type = "GameObjectsManager"

    }

    static ActiveObj = [];
    static objIndex = -1;

    static get type() {
        return this.Type;
    }


    static Update(t, dt) {
        for (var i = this.ActiveObj.length - 1; i >= 0; i--) {
            this.ActiveObj[i].Update(t, dt);
        }
    }

    static Draw(step) {
        for (var i = this.ActiveObj.length - 1; i >= 0; i--) {
            this.ActiveObj[i].Renderer.Draw(step);
        }
    }

    static createGameObject() {
        this.objIndex++;
        this.ActiveObj.push(new GameObject(this.objIndex));

    }

    attachComponent(comp = 0) {
        
        if(typeof comp.type !== "string") {
            console.log("Cannot attach component to object! Check object type.");
            return 0;
        }

        comp.gameObjectId = this.id;

        switch(comp.type) {
            case "Transform":
                this.Transform = comp;
                this.Transform.gameObjectId = this.id;
                return 1;
            case "Renderer":
                this.Renderer = comp;
                this.Renderer.gameObjectId = this.id;
                return 1;
            case "Rigidbody": 
                this.Rigidbody = comp;
                this.Rigidbody.gameObjectId = this.id;
                return 1;
            default:
                return 0;
        }

    }

    get type() {
        return this.Type;
    }

    get gameObject() {
        return this;
    }

    getComponent(ObjType) {

        if (typeof ObjType === "string") {

            switch(ObjType) {
                case "Transform":
                    return this.Transform;
                case "Renderer":
                    return this.Renderer;
                case "Rigidbody":
                    return this.Rigidbody;
            }

        }
        return 0;
    }

    static findById(id) {

        for (var i = this.ActiveObj.length - 1; i >= 0; i--) {
            if (this.ActiveObj[i].id == id)
                return this.ActiveObj[i];
        }

    }

    //#Finds an object in main list of all objects and return it's index;
    findGameObject() {
        for (var i = GameObjectsManager.ActiveObj.length - 1; i >= 0; i--) {
            if(GameObjectsManager.ActiveObj[i].id == this.id)
            return i;
        }
    }

    BinarySearch() {
        
    }

    destroy() {

        var index = this.findGameObject();
        GameObjectsManager.ActiveObj.splice(index, 1);
        delete this;
    }
}

class Component {
    static Type = "Component";
    static get type() {
        return this.Type;
    }

    get transform() {
        return this.gameObject.transform;
    }

    get gameObject() {

    }
}

class GameObject extends GameObjectsManager{
    constructor(id) {
        super();

        this.Type = "GameObject"
        this.id = id;

        this.Transform = null;
        this.Renderer = null;
        this.Rigidbody = null;

        this.attachComponent(Transform.create());
        this.attachComponent(Renderer.create());
        this.attachComponent(Rigidbody.create());

        GameObjectsManager.ActiveObj.push(this);
    }
    static init() {

    }

    Update(t, dt) {
        
       if (this.transform.pos.y >= 600)
           this.transform.pos.y = 1;

       if (this.transform.pos.x <= 0 || this.transform.pos.x >= 800)
           this.transform.pos.x = 0;

        this.Rigidbody.Update(t, dt);

    }

    get transform() {
        return this.Transform;
    }

}

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

class Time {

    constructor() {

        this.lastFrame;
        this.nowFrame = this.getTimeinSec;
        this.elapsed = 0;
        this.deltaTime = 0.01;

        this.accumulator = 0;
        this.t = 0;

        this.startTime = this.getTimeinSec;
        this.frame = -1;

        this.fps = 144;
        this.fpsInterval = 1/this.fps;

        this.Init();
        
    }

    static get testino() {
        return this.lastFrame;
    }

    Init() {

        this.nowFrame = this.getTimeinSec;
        this.lastFrame = this.nowFrame;
        
    }

    calcFrame() {
        
        this.frame++;

        this.nowFrame = this.getTimeinSec;

        this.frameTime = this.nowFrame - this.lastFrame;

        if ( this.frameTime > 0.25 ) 
            this.frameTime = 0.25;
            
        this.lastFrame = this.nowFrame;
        
        this.accumulator += this.frameTime;
        
    }

    setDeltaTime() {

        this.deltaTime += Math.min(1, this.frameTime/1000);
        Time.deltaTime = this.deltaTime;
        
    }

    get alpha() {
        return this.accumulator / this.deltaTime;
    }

    get countFps() {
        return (this.frame/this.time);
    }

    get getTimeinSec() {
        return performance.now()/1000;
    }

    get time() {
        return this.lastFrame - this.startTime;
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

class Physics {
    constructor() {

        this.objectType = "Physics";
        this.Rigidbodys = [];

    }

    get type() {
        return this.objectType;
    }

    Update(t, dt) {
        
    }

    calculateStep(t, dt) {

        this.velocity.x = this.velocity.x + (this.force.x / this.mass) * dt;
        this.velocity.y = this.velocity.y + (this.force.y / this.mass) * dt;
        
        this.transform.pos.x = this.transform.pos.x + this.velocity.x * dt;
        this.transform.pos.y = this.transform.pos.y + this.velocity.y * dt;

        this.Midpoint();

    }

    Midpoint() {

        this.transform.pos.x = (this.transform.pos.x + this.transform.origin.x)/2;
        this.transform.pos.y = (this.transform.pos.y + this.transform.origin.y)/2;

        this.transform.origin = this.transform.position;
        this.velocityOrigin = this.velocity;
    }

    Intergate(t, dt) {
        
        var a = this.Derivative,
            b = this.Derivative,
            c = this.Derivative,
            d = this.Derivative;

        a.evaluate(this.State, t, 0.0, this.Derivative);
        b.evaluate(this.State, t, dt*0.5, a);
        c.evaluate(this.State, t, dt*0.5, b);
        d.evaluate(this.State, t, dt, c);
        
        

        var dxdt = b.dx.add(c.dx);
        dxdt = dxdt.multiplay(2);
        dxdt = dxdt.add(a.dx);
        dxdt = dxdt.add(d.dx);
        dxdt = dxdt.multiplay(1/6);

        

        var dvdt = b.dv.add(c.dv);
        dvdt = dvdt.multiplay(2);
        dvdt = dvdt.add(a.dv);
        dvdt = dvdt.add(d.dv);
        dvdt = dvdt.multiplay(1/6);

        

        this.State.x = this.State.x.add(dxdt.multiplay(dt));
        this.State.v = this.State.v.add(dvdt.multiplay(dt));

        this.transform.pos = this.State.x;
    }

    get gameObject() {
        return GameObjectsManager.findById(this.gameObjectId);
    }
}

class Transform extends Component {

    constructor(pos = Vector2D.Random(800, 600)) {
        super();

        this.objectType = "Transform";
        this.pos = pos;
        this.rotation = Vector2D.Zero;
        this.origin = pos;
        this.center;

        

        delete this.x;
        delete this.y;
    }

    get position() {
        return this.pos;
    }

    get gameObject() {
        return GameObjectsManager.findById(this.gameObjectId);
    }

    static create() {
        return new Transform();
    }

    static transform() {
        return this.gameObjectId;
    }
}

class Rigidbody extends Component {
    constructor() {
        super();

        this.objectType = "Rigidbody";
        this.gameObjectId;
        this.mass = 1;

        //this.State = new State(this.transform.pos, Vector2D.Right);
        //this.Derivative = new Derivative(Vector2D.create(10, 10), Vector2D.create(10, 10));
        
        this.force = Vector2D.create(Math.random()*10, Math.random()*5);
        this.velocity = Vector2D.Zero;
        this.velocityOrigin = this.velocity;

    }

    Update(t, dt) {
        Physics.calculateStep(t, dt);
    }


    static create() {
        return new Rigidbody();
    }
}

var main = new Furgo();
for (var i = 0; i <= 0; i++) {
    GameObjectsManager.createGameObject();
}
var fpscounter = document.getElementById("fps");

main.mainLoop = requestAnimationFrame(()=>main.update());