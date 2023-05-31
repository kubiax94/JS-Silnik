import { GameObject, GameObjectsManager } from './GameObjectsManager.js';
import { Vector2D } from './Vector2D.js';
import { Collision } from './Collision.js';
import { Graphics, Polygon } from './Graphics.js';
import { Time } from './Time.js';


export default class Component {

    gameObjectId;
    _gameObject;

    static Type = "Component";

    get type() {
        return this.objectType;
    }

    static get type() {
        return this.Type;
    }

    get renderer() {
        return this.gameObject.Renderer;
    }

    get rigidbody() {
        return this.gameObject.Rigidbody;
    }

    get transform() {
        return this.gameObject.Transform;
    }

    get boundBox() {
        return this.gameObject._boundBox;
    }

    set boundBox(newBoundBox) {
        this._boundBox = newBoundBox;
    }

    set gameObject(gameObject) {
        this._gameObject = gameObject;
    }

    get gameObject () {
        return this._gameObject;
    }
}

export class Physics extends Component {

    static objectType = "Physics";
    static PhysicsObjects = [];

    static gravityVector = Vector2D.Down;
    static gravityForce = 9.81;
    static gravity = Vector2D.Down.multiplay(this.gravityForce);

    static create() {

        var a = new Physics();
        this.PhysicsObjects.push(a);
        
        return a;
    }

    static Update(t, dt) {
    
        if (this.PhysicsObjects.length == 0) return;
        Physics.IntergrateAccel();
        Physics.IntergateVelocity();
    
        for (var i = this.PhysicsObjects.length - 1; i >= 0; i--) {
            this.PhysicsObjects[i].Update(t, dt);
        }
    
    }

    static ImpulseResolveCollision(info) {

        let A = info.GameObjectA.Rigidbody;
        let B = info.GameObjectB.Rigidbody;

        let transformA = info.GameObjectA.Transform;
        let transformB = info.GameObjectB.Transform;

        let mass_sum = A.inv_mass + B.inv_mass;
        let p = info.p;

        transformA.position.x -= (p.normal.x * info.separation.x * (A.inv_mass / mass_sum));
        transformA.position.y -= (p.normal.y * info.separation.y * (A.inv_mass / mass_sum));

        transformB.position.x += (p.normal.x * info.separation.x * (A.inv_mass / mass_sum));
        transformB.position.y += (p.normal.y * info.separation.y * (A.inv_mass / mass_sum));

        let rv = B.linearVelocity.sub(A.linearVelocity);
        

        let velAlongNormal = rv.dot(p.normal);

        if(velAlongNormal > 0)
            return;
        
        let e = A.elasticity * B.elasticity;

        let j = -(1 + e) * velAlongNormal;
        j /= A.inv_mass + B.inv_mass;

        let impulse = info.p.normal;
        impulse = impulse.multiplay(j);

        A.apllyLinearVelocity(Vector2D.create(-impulse.x, -impulse.y)); 
        B.apllyLinearVelocity(impulse);
        
    }

    static IntergrateAccel() {
        for (var i = GameObject.ActiveObj.length - 1; i >= 0; i--) {
            let rigidbody = GameObject.ActiveObj[i].Rigidbody;

            let inv_mass = rigidbody.getInverseMass;

            let linearVel = rigidbody.getLinearVelocity;
            let force = rigidbody.getForce;
            let accel = force.multiplay(inv_mass);

            if (rigidbody.applyGravity && inv_mass > 0) {
                accel.x += this.gravity.x;
                accel.y += this.gravity.y;
            }
            
            accel = accel.multiplay(Time.deltaTime);

            linearVel.x += accel.x;
            linearVel.y += accel.y;

            rigidbody.SetLinearVelocity = linearVel;
        }
    }

    static IntergateVelocity(rigidbody) {

        let dampingFactor = 1.0 - 0.95;
        let frameDamping = Math.pow(dampingFactor,Time.deltaTime);

        for (var i = GameObject.ActiveObj.length - 1; i >= 0; i--) {
            let rigidbody = GameObject.ActiveObj[i].Rigidbody;

            let position = rigidbody.transform.position;
            rigidbody.transform.origin = position;

            let linearVel = rigidbody.getLinearVelocity;
            //linearVel = linearVel.multiplay(Time.deltaTime);

            position.x += linearVel.x// * Time.deltaTime;
            position.y += linearVel.y// * Time.deltaTime;

            rigidbody.transform.position = position;
            

            linearVel = linearVel.multiplay(frameDamping);

            rigidbody.SetLinearVelocity = linearVel;
        }
    }

    static ApllyImpulse(rigidbody, impulsForce, mass_sum) {

        let ratio = rigidbody.inv_mass / mass_sum;
        let postion = rigidbody.transform.getPosition;

        let linearVel = rigidbody.getLinearVelocity;


        postion.x += ratio * impulsForce.x;
        postion.y += ratio * impulsForce.y;

        rigidbody.SetLinearVelocity = linearVel;

    }

    constructor() {
        super();
        this.objectType = "Physics";
        this.isKinematick = true;
    }

    get type() {
        return this.objectType;
    }

    Update(t, dt) {
        //if (this.gameObject.Rigidbody.isKinematick)
            //Physics.gravity(t, dt, this.gameObject.Rigidbody);
       //Physics.calculateStep(t, dt, this.gameObject.Rigidbody);

        this.rigidbody.clearForce();
    }

    static calculateStep(t, dt, other) {
        var a = other.transform;

        other.velocity.x = other.velocity.x + (other.force.x / other.mass) * dt;
        other.velocity.y = other.velocity.y + (other.force.y / other.mass) * dt;
        
        a.pos.x = a.pos.x + other.velocity.x * dt;
        a.pos.y = a.pos.y + other.velocity.y * dt;

        this.Midpoint(other);

    }

    static Midpoint(other) {
        var a = other.transform;

        a.pos.x = (a.pos.x + a.origin.x)/2;
        a.pos.y = (a.pos.y + a.origin.y)/2;

        a.origin = a.position;
        other.velocityOrigin = other.velocity;
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
    
}

export class Transform extends Component {

    _position;

    constructor(position = Vector2D.Random(800, 600)) {
        super();

        this.objectType = "Transform";
        this._position = position;
        this.rotation = 0;
        this.origin = position;

    }

    set position(vector2D) {
        this._position = vector2D;
    }

    get position() {
        return this._position;
    }

    static create() {
        return new Transform();
    }

    /**
     * @param {Vector2D} vector2D
     */
    set setOrigin(vector2D) {
        this.origin = vector2D;
    }

}

export class Rigidbody extends Component {
    
    static create() {
        return new Rigidbody();
    }

    constructor() {
        super();

        this.objectType = "Rigidbody";
        this.gameObjectId;
        this.isKinematick = true;
        this.applyGravity = true;
        this.setMass = 1;
        this.elasticity = Math.random();
        this.force = Vector2D.Zero;
        
        this.linearVelocity = Vector2D.Zero;

        this.velocityOrigin = this.velocity;

    }

    apllyLinearVelocity(force = Vector2D.Zero) {

        this.linearVelocity.x += force.x * this.inv_mass;
        this.linearVelocity.y += force.y * this.inv_mass;

    }
    
    /**
     * @param {number} mass
     */
    set setMass(mass) {
        this.inv_mass = 1/mass;
        this.mass = mass;
    }

    set setOrigin(vector2D) {
        let a = Vector2D.create(vector2D);
        return a;
    }

    /**
     * @param {Vector2D} vector2d
     */
    set SetLinearVelocity(vector2d) {
        this.linearVelocity = vector2d;
    }

    get getInverseMass() {
        return this.inv_mass;
    }

    get getForce() {
        return this.force;
    }

    get getLinearVelocity() {
        return this.linearVelocity;
    }

    addForce(addForce) {
        this.force.x += addForce.x;
        this.force.y += addForce.y;
    }

    clearForce() {
        this.force = Vector2D.Zero;
    }
}

export class Renderer extends Component {
    constructor() {
        super();
        this.objectType = "Renderer";

        this.polyShape = Polygon.createPolygon(4);
        this.polyShape.scale = 10;
        this.polyShape.calculateDaimension();
        this._color = "green";


        this._renderer = Graphics.createNewRender(this.polyShape._width*2, this.polyShape._height*2);
        
        this._rendererCtx = this._renderer.getContext('2d');
        this._rendererCtx.translate(this.polyShape._width, this.polyShape._height);

        this._invalid = true;

    }

    render() {

        if(this._invalid) {
            Graphics.updateRenderfromPolygon(this.polyShape, this._rendererCtx, this._color);
            Graphics.updateRender(this.polyShape, this._rendererCtx);
            this._invalid = false;
        }
        
        Graphics.ctx.drawImage(this._renderer, 
                               this.transform.position.x - this.polyShape._width , 
                               this.transform.position.y - this.polyShape._height);

        Graphics.gizmo(this.transform.position);

    }

    Update() {

        let a = this.transform.position;
        let b = this.transform.origin;

        a.x = a.x * Time.alpha 
                                + b.x * (1.0 - Time.alpha); 
        a.y = a.y * Time.alpha 
                                + b.y * (1.0 - Time.alpha); 
    }

    //SetRendererSize
    set size(newSize) {

        this.polyShape.scale = newSize;
        this._renderer.width = this.polyShape._width*2;
        this._renderer.height = this.polyShape._height*2;
        this._invalid = true;
    }

    set color(newColor) {
        this._color = newColor;
        this._invalid = true;
    }

    static get type() {
        return this.objectType;
    }

    static create() {
        return new Renderer();
    }

}

export class Sprite extends Component {

    gameObjectId;
    indexID;

    static create() {
        return new Sprite();
    }

    constructor() {
        super();
        this.objectType = "Sprite";
             
    }

    get getTextureCtx() {
        return this.Texture.getContext('2d');
    }

}

export class BoxCollider extends Component {
    static objectType = "BoxColider";

    static get type() {
        return this.objectType;
    }

    static create() {
        return new BoxCollider();
    }

    constructor() {
        super();
        this.objectType = "BoxCollider";

        this.vertex = [Vector2D.create(1, 1), Vector2D.create(1,-1),
                         Vector2D.create(-1, -1), Vector2D.create(-1, 1)];
                    
        this.width = 20;
        this.height = 20;
        this.half_width = this.width * 0.5;
        this.half_height = this.height * 0.5;

        Collision.colliders.push(this);
    }

}


//export { Component, Transform, Rigidbody, Renderer, Sprite, Physics, BoxCollider };