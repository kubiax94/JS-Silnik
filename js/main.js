import { Graphics, Polygon } from '../modules/Graphics.js';
import { GameObjectsManager, GameObject } from '../modules/GameObjectsManager.js';
import { Time } from '../modules/Time.js';
import { Physics } from '../modules/Components.js';
import { Collision, CollisionInfo } from '../modules/Collision.js';
import { Vector2D } from '../modules/Vector2D.js';
import { QuadTree, AABB, Point } from '../modules/QuadTree.js';


//TODO: Napisać stany dla silnika.
class Frugo {
    constructor() {
        Time.Init();
        //Graphics.init();
        this.loop;
    }

    mainLoop() {
        
        this.loop = requestAnimationFrame(()=>this.mainLoop());
        
        Time.calcFrame();

        GameObjectsManager.initialize();
        Collision.Update();
        GameObject.Update(Time.t, Time.deltaTime);

        while(Time.accumulator >= Time.deltaTime) {
            
            Physics.Update(Time.t, Time.deltaTime);

            Time.t += Time.deltaTime;
            Time.accumulator -= Time.deltaTime;
        }

        Time.Alpha();

        Graphics.background();
        GameObject.Draw();
        Time.fpsCount();
    }

}

var clamp = function(n ,min, max) {
    return Math.min(Math.max(n, min), max);
  };

var main = new Frugo();


for (var i = 0; i <= 7; i++) {
    GameObject.createGameObject();
}

GameObject.ActiveObj[0].Transform.position = Vector2D.create(410, 100);
GameObject.ActiveObj[1].Transform.position = Vector2D.create(420, 100);
GameObject.ActiveObj[2].Transform.position = Vector2D.create(430, 100);

var fpscounter = document.getElementById("fps");


window.GameObject = GameObject;
window.Collision = Collision;
window.CollisionInfo = CollisionInfo;
window.Time = Time;
window.Frugo = main;
window.Vector2d = Vector2D;
window.Physics = Physics;
window.Graphics = Graphics;
window.Polygon = Polygon;
window.QuadTree = GameObjectsManager;

main.loop = requestAnimationFrame(()=>main.mainLoop());
