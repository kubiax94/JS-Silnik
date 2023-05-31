import { Physics } from "./Components.js";
import { GameObjectsManager } from "./GameObjectsManager.js";
import { Vector2D } from "./Vector2D.js";
import { QuadTree } from "./QuadTree.js";

class Collision {
    static colliders = [];
    

    static Update() {

        this.barrowPhase();
        this.narrowPhase();
        this.ResolveCollsion();

    }

    static narrowPhase() {
        for (var i = 0; i < CollisionInfo.CollisionData.length; i++) {

                let info = this.castProjection(CollisionInfo.CollisionData[i].GameObjectA, 
                                               CollisionInfo.CollisionData[i].GameObjectB);

                if(info != null) {
                     Physics.ImpulseResolveCollision(info);
                     CollisionInfo.addCollision(info);
                }
        }
    }

    static barrowPhase() {

        CollisionInfo.CollisionData = [];

        for (var i = 0; i < this.colliders.length; i++) {
            let others = GameObjectsManager.allObjects.query(this.colliders[i].boundBox);
            
            for (var j = 0; j < others.length; j++) {

                if(this.colliders[i].gameObject.id === others[j]._Data.id)
                    continue;

                CollisionInfo.createData(this.colliders[i].gameObject, others[j]._Data);
                
                }
            }
    }

    static ResolveCollsion() {

        for (var i = CollisionInfo.length - 1; i >= 0; i--) {
            let info = CollisionInfo.CollisionInfo[i];
            
            if(info.frameLeft == 1) {
                info.GameObjectA.onCollisionEnter(info.GameObjectB);
                info.GameObjectB.onCollisionEnter(info.GameObjectA);
            }

            info.frameLeft = info.frameLeft - 1;
            if(info.frameLeft < 0) {
                info.GameObjectA.onCollisionEnd(info.GameObjectB);
                info.GameObjectB.onCollisionEnd(info.GameObjectA);
                i = CollisionInfo.erase(i);
            } else {
                i++;
            }
        }

    }

    static castProjection(gameObjectA, gameObjectB) {

        let shortesDist = Number.MAX_VALUE;

        let result = CollisionInfo.createInfo(gameObjectA, gameObjectB);

        let transformA = gameObjectA.Transform;
        let transformB = gameObjectB.Transform;

        gameObjectA.Renderer.polyShape.position = transformA.position.clone(); 
        gameObjectB.Renderer.polyShape.position = transformB.position.clone(); 

        let vertexA = gameObjectA.Renderer.polyShape.getTransformedVerts;
        let vertexB = gameObjectB.Renderer.polyShape.getTransformedVerts;  


        this._patchLineVerts(vertexA);
        this._patchLineVerts(vertexB);

        let vOffset = Vector2D.create(transformA.position.x - transformB.position.x,
                                      transformA.position.y - transformB.position.y);
    

        for (var i = 0; i < vertexA.length; i++) {
            
            let axis = Collision.getAxis(vertexA, i);
            
            let objectARange = Collision.projectOnAxis(axis, vertexA);
            let objectBRange = Collision.projectOnAxis(axis, vertexB);

            var sOffset = Vector2D.dot(axis, vOffset);
            objectARange.min += sOffset;
            objectARange.max += sOffset;

            if ((objectARange.min - objectBRange.max > 0) || (objectBRange.min - objectARange.max > 0)) {

                return null;
            }
            
            let distMin = (objectBRange.max - objectARange.min) * -1;

            let distMinAbs = Math.abs(distMin);

            if(distMinAbs < shortesDist) {
                shortesDist = distMinAbs;
                result.distance = distMin;
                result.p = axis;
            }

        }
        
        result.separation = Vector2D.create(result.p.x * result.distance,
                                               result.p.y * result.distance);
        
        return result;
    }


    static _patchLineVerts(verts)
    {
        if (verts.length == 2)
        {
            let p1 = verts;
            let p2 = verts;
            var pt = new Vector2D(-(p2.y - p1.y), p2.x - p1.x);
            pt.magnitude = 0.000001;
            verts.push(pt);
        }
    }

    static projectOnAxis(axis, vertex) {

        let min = Vector2D.dot(axis, vertex[0]);
        let max = min;

        for(let i = 1; i < vertex.length; i++) {

            let temp = Vector2D.dot(axis, vertex[i]);
            if (temp < min) min = temp;
            if (temp > max) max = temp;

        }

        return {min: min, max: max};
    }

    static getAxis(vertex, index) {

        let pt1 = vertex[index];
        let pt2 = index >= vertex.length-1 ? vertex[0] : vertex[index+1];
        
        let axis = new Vector2D(-(pt2.y - pt1.y), pt2.x - pt1.x);
        axis.normalize();

        return axis;
    }
}

class CollisionInfo extends Collision {

    GameObjectA = null;
    GameObjectB = null;
    distance = 0;
    separation = 0;
    pen;
    frameLeft = 1;
    p = 0;

    _begin = -1;

    static CollisionInfo = [];
    static CollisionData = [];

    static addCollision(info) {
        this.CollisionInfo.push(info);
    }

    static createData(gameObjectA, gameObjectB) {
        let newData = {
            GameObjectA: gameObjectA,
            GameObjectB: gameObjectB
        };

        this.CollisionData.push(newData);
    } 

    static createInfo(gameObjectA, gameObjectB) {

        let info = new CollisionInfo();

        info.GameObjectA = gameObjectA;
        info.GameObjectB = gameObjectB;
        info.distance = 0;
        info.p = 0;
        info.separation = 0;
        info.frameLeft = 1;

        return info;
    }
    
    clone() {
        let clone = new CollisionInfo();

        clone.GameObjectA = this.GameObjectA;
        clone.GameObjectB = this.GameObjectB;
        clone.distance = this.distance;
        clone.p = this.p;
        clone.separation = this.separation;
        clone.frameLeft = this.frameLeft;

        return clone;
    }

    static begin() {
        return ;
    }

    static erase(index) {
        let a = this.CollisionInfo.splice(index, 1);
        return index - 1;
    } 

    static get length() {
        return this.CollisionInfo.length;
    }

}

export { Collision, CollisionInfo };