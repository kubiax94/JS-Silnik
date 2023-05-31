import { Transform, Rigidbody, Renderer, Physics, BoxCollider, Sprite } from './Components.js';
import { Time } from '../modules/Time.js';
import { Vector2D } from './Vector2D.js';
import { QuadTree, AABB, Point } from './QuadTree.js';

// TODO: W GameObjectsManager zmienic find index. Na poprostu wskazniki do obiektów.
//  szybsze, lepsze. Lepiej zabespieczyć funkcje aby nie przyjmowały byle czego.
// Podzielic tablice dla poszczegolnych elementow np podczas tworzenia quad tree,
// mozna spokjnie dodawc do tablic elementy rigidbody colliderow jak i rendera.
// Przyda sie pozniej przy przy componecie kamery.



class GameObjectsManager {

    static _boundry = AABB.create(Vector2D.create(400, 300), 800, 600);
    static _allObjects = QuadTree.createQuadTree(this._boundry);

    static endAt;
    static startAt;

    constructor() {

        this.Type = "GameObjectsManager";
    }

    static objIndex = -1;
    static numberOffObjects = -1;

    static get type() {
        return this.Type;
    }

    static get objIndex() {
        return this.objIndex;
    }

    static set allObjects(newQuadTree) {
        this._allObjects = newQuadTree;
    }

    static get allObjects() {
        return this._allObjects;
    }

    static initialize() {

        this._allObjects = QuadTree.createQuadTree(this._boundry);
        
        for (var i = 0; i < GameObject.ActiveObj.length; i++) {
            GameObject.ActiveObj[i].boundBox.point = GameObject.ActiveObj[i].Transform.position;
            this.allObjects.insert(Point.create(GameObject.ActiveObj[i]._boundBox._point, 
                                                GameObject.ActiveObj[i]));
        }
    }

    attachComponent(comp = 0) {
        
        if(typeof comp.type !== "string") {
            console.log("Cannot attach component to object! Check object type.");
            return 0;
        }

        comp.gameObjectId = this.ID;

        switch(comp.type) {
            case "Transform":
                this.Transform = comp;
                this.Transform.gameObjectId = this.ID;
                this.Transform.gameObject = this;
                return 1;
            case "Renderer":
                this.Renderer = comp;
                this.Renderer.gameObjectId = this.ID;
                this.Renderer.gameObject = this;
                return 1;
            case "Rigidbody": 
                this.Rigidbody = comp;
                this.Rigidbody.gameObjectId = this.ID;
                this.Rigidbody.gameObject = this;
                return 1;
            case "Physics":
                this.Physics = comp;
                this.Physics.gameObjectId = this.ID;
                this.Physics.gameObject = this;
                return 1;
            case "BoxCollider":
                this.Collider = comp;
                this.Collider.gameObjectId = this.ID;
                this.Collider.gameObject = this;
                return 1;
            case "Sprite":
                this.Renderer.Sprite = comp;
                this.Renderer.Sprite.gameObjectId = this.ID;
                this.Renderer.gameObject = this;
                return 1;
            default:
                return 0;
        }

    }

    get type() {
        return this.Type;
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
                case "Physics":
                    return this.Physics;
                default: 
                    return 0;
            }

        }
        return 0;
    }

    destroy() {

        var index = this.findGameObject();

        GameObject.ActiveObj.splice(index, 1);
        GameObject.ActiveObj.sort(
            function(a,b) { return a.id - b.id }
        );
        GameObject.objIndex = index;

        delete this;
    }

}
// TODO: Inaczej zaplanować.
class GameObject extends GameObjectsManager {
    constructor(id) {
        super();

        this.Type = "GameObject"
        this.id = id;
        this.indexID;

        this.id;
        
    }

    static ActiveObj = [];

    _Transform = null;
    _Renderer = null;
    _Rigidbody = null;
    _Physics = null;
    _Collider = null;
    _Sprite = null;
    _boundBox = null;

    static Update(t, dt) {
        for (var i = this.ActiveObj.length - 1; i >= 0; i--) {
            this.ActiveObj[i].Update(t, dt);
        }
    }

    static Draw() {
        for (var i = this.ActiveObj.length - 1; i >= 0; i--) {
            this.ActiveObj[i].Renderer.Update();
            this.ActiveObj[i].Renderer.render();
        }
    }

    static createGameObject() {

        GameObjectsManager.objIndex++;
        let a = new GameObject(GameObjectsManager.objIndex);
        this.ActiveObj.push(a);
        a.setId = GameObjectsManager.objIndex;
        a.init();

        a._boundBox = AABB.create(a.Transform.position, 
                                    a.Renderer.polyShape._width*2,
                                    a.Renderer.polyShape._height*2);
        GameObjectsManager.allObjects.insert(Point.create(a.Transform.position, a));

        console.log(GameObjectsManager.allObjects);

    }

    init() {
        this.attachComponent(Transform.create());
        this.attachComponent(Renderer.create());
        this.attachComponent(Physics.create());
        this.attachComponent(Rigidbody.create());
        this.attachComponent(BoxCollider.create());
        this.attachComponent(Sprite.create());
    }

    Update() {
        
       if (this.Transform.position.y >= 590)
           this.Rigidbody.addForce(Vector2D.create(0, -1000));

        if (this.Transform.position.y <= 10)
           this.Rigidbody.addForce(Vector2D.create(0, 1000));

       if (this.Transform.position.x <= 10)
            this.Rigidbody.addForce(Vector2D.create(1000, 0));

       if (this.Transform.position.x >= 790) 
            this.Rigidbody.addForce(Vector2D.create(-1000, 0));

           //this.transform.pos.x = this.transform.pos.x + 20 * Time.frameTime;
    }

    onCollisionEnter(other) {
        other.Renderer.color = "red";
    }

    onCollisionEnd(other) {
        other.Renderer.color = "green";
    }

    get boundBox() {
        return this._boundBox;
    }

    get ID() {
        return this.id;
    }

    /**
     * @param {number} id
     */
    set setId(id) {
        this.id = id;
    }

    set Transform(newTransform) {
        this._Transform = newTransform
    }

    get Transform() {
        return this._Transform;
    }

    set Renderer(newRenderer) {
        this._Renderer = newRenderer;
    }

    get Renderer() {
        return this._Renderer;
    }

    set Rigidbody(newRigidbody) {
        this._Rigidbody = newRigidbody;
    }

    get Rigidbody() {
        return this._Rigidbody;
    }

    set Physics(newPhysics) {
        this._Physics = newPhysics;
    }

    get Physics() {
        return this._Physics;
    }

    set Collider(newCollider) {
        this._Collider = newCollider;
    } 

    get Collider() {
        return this._Collider;
    }

    set Sprite(newSprite) {
        this._Sprite = newSprite;
    }

    get Sprite() {
        return this._Sprite;
    }
}


export { GameObjectsManager, GameObject };