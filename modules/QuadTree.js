import { Vector2D } from "./Vector2D.js";
import { GameObject } from "./GameObjectsManager.js";

// Implementcja z https://en.wikipedia.org/wiki/Quadtree;

//TODO: Popraw Vector
// Clasa point będzie przechowyać miejsce obiektu w QuadTree jak i dane;
// Tylko da struktury QuadTree nie urzywać gdzie indziej.

export class Point {

    _point;
    _Data;

    constructor(_vector2D, _Data) {

        //if (arguments[0] === )
        this._point = _vector2D;
        this._Data = _Data;
    }

    get x() {
        return this._point.x;
    }

    get y() {
        return this._point.y;
    }

    findInData(id) {
        return this._Data.id == id;
    }

    static create(_vector2D, _Data) {
        return new Point(_vector2D, _Data)
    }
}


export class AABB {

    _point;

    constructor(point, w, h){
        this._point = point;
        this.w = w;
        this.h = h;
        this.left = point.x - w/2;
        this.right = point.x + w/2;
        this.top = point.y - h/2;
        this.bottom = point.y + h/2;
    }

    containsPoint(point) {
        return (this.left <= point.x && point.x <= this.right &&
                this.top <= point.y && point.y <= this.bottom);
    }

    intersect(other_AABB) {
        return !(this.right < other_AABB.left || other_AABB.right < this.left ||
                 this.bottom < other_AABB.top || other_AABB.bottom < this.top);

    }

    get point() {
        return this._point;
    }

    set point(newpoint) {

        this.left = newpoint.x - this.w/2;
        this.right = newpoint.x + this.w/2;
        this.top = newpoint.y - this.h/2;
        this.bottom = newpoint.y + this.h/2;

        this._point = newpoint;
    }

    static create(point, w, h) {
        return new AABB(point, w, h);
    }

}

export class QuadTree {
    
    static _potentialColision = [];
    static _node_capacity = 4;

    _cointainedPoints = [];
    _divided = false;
    _boundry;

    _children = {
        nw: null,
        ne: null,
        sw: null,
        se: null
    };

    constructor(_AABB) {
        this._boundry = _AABB;
    }

    static createQuadTree(_AABB) {
        let newQuad = new QuadTree(_AABB);
        return newQuad;

    }
    
    // Głowny kod rekurencji.
    // Przyjmuje obiekt typu Point i "wkłada" go do QuadTree
    // Point object posiada zmienną typu dane. Dlatego nie mozna używać vektora.

    insert(point) {

        if(!this._boundry.containsPoint(point)) {
            return false;
        }

        if(this._cointainedPoints.length < QuadTree._node_capacity && this._children.nw == null) {
            this._cointainedPoints.push(point);
            return true;
        }

        if (this._children.nw == null)
            this.subdivide();
        
        if(this._children.nw.insert(point)) return true;
        if(this._children.ne.insert(point)) return true;
        if(this._children.sw.insert(point)) return true;
        if(this._children.se.insert(point)) return true;

        return false;
    }

    // Query przyjmuje AABB object i sprawdza czy posiada jakies punkty.
    query(range, points) {
        if (points == undefined) {
            points = [];
        }

        if(!this._boundry.intersect(range))
            return points;

        for (let i = 0; i < this._cointainedPoints.length; i++) {
            if(range.containsPoint(this._cointainedPoints[i]))
                points.push(this._cointainedPoints[i]);
        }

        if(this._children.nw == null)
            return points;

        this._children.nw.query(range, points);
        this._children.ne.query(range, points);
        this._children.sw.query(range, points);
        this._children.se.query(range, points);

        return points;

    }

    findId(id) {
        let found;

        for (let i = 0; i < this._cointainedPoints.length; i++) {
            if(this._cointainedPoints[i].findInData(id))
                return this._cointainedPoints[i]._Data;
        }

        if(this._children.nw == null) 
                return false;


        if (found = this._children.nw.findId(id))  return found;

        if (found = this._children.ne.findId(id))  return found;

        if (found = this._children.sw.findId(id))  return found;

        if (found = this._children.se.findId(id))  return found;

        if(found)
        return found;
    }

    subdivide() {

        let height = this._boundry.h / 2;
        let width = this._boundry.w / 2;

        let nwpos = this._boundry._point.clone();
        nwpos.x = nwpos.x - width/2;
        nwpos.y = nwpos.y - height/2;

        let nw = AABB.create(nwpos, width, height);
        this._children.nw = QuadTree.createQuadTree(nw);

        let nepos = this._boundry._point.clone();
        nepos.x = nepos.x + width/2;
        nepos.y = nepos.y - height/2;

        let ne = AABB.create(nepos, width, height);
        this._children.ne = QuadTree.createQuadTree(ne);

        let swpos = this._boundry._point.clone();
        swpos.x = swpos.x - width/2;
        swpos.y = swpos.y + height/2;

        let sw = AABB.create(swpos, width, height);
        this._children.sw = QuadTree.createQuadTree(sw);

        let sepos = this._boundry._point.clone();
        sepos.x = sepos.x + width/2;
        sepos.y = sepos.y + height/2;
        let se = AABB.create(sepos, width, height);
        this._children.se = QuadTree.createQuadTree(se);

        this._divided = true;
    }   
}
