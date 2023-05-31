import { Vector2D } from "./Vector2D.js";

class Graphics {

    static objectType = "Graphics";

    static Renderer = document.getElementById("GameWindow");
    static ctx = this.Renderer.getContext('2d');
    
    static init() {
        this.ctx.translate(this.Renderer.width/2, this.Renderer.height/2);
    }

    static get type() {
        return this.objectType;
    }

    get type() {
        return this.objectType;
    }

    static Draw(cache, invalid) {
        if(invalid) {
            this.updateRender(cache);

        }
    }

    static createNewRender(w, h) {
        let newRenderer = document.createElement('canvas');
        newRenderer.width = w;
        newRenderer.height = h;
        return newRenderer;
    }

    static background() {

        this.ctx.beginPath();
        this.ctx.fillStyle = 'black';
        this.ctx.rect(0, 0, this.Renderer.width, this.Renderer.height);
        this.ctx.fill();

    }

    static gizmo(pos) {
        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, 2, 0, 2*Math.PI);
        this.ctx.fillStyle = 'red';
        this.ctx.fill();

    }
// TODO: Ulepszyc aby rysował na offscrenie wiecej elementów;
    static updateRender(shape, RenderCtx) {      

        RenderCtx.beginPath();

        if (shape instanceof Polygon)
            RenderCtx.arc(shape._center.x, shape._center.y, 2, 0, 2*Math.PI);
        
        if (shape instanceof Vector2D) 
            RenderCtx.arc(shape.x, shape.y, 2, 0, 2*Math.PI);
        
        RenderCtx.fillStyle = 'red';
        RenderCtx.fill();
    }


    static updateRenderfromPolygon(polygon, RenderCtx, color) {
       
        RenderCtx.strokeStyle = "blue";
        RenderCtx.fillStyle = color;

        let vert = polygon._scaledVertex;

        RenderCtx.beginPath();
        
        RenderCtx.moveTo(vert[vert.length-1].x, 
                         vert[vert.length-1].y);

        for (var i = 0; i < vert.length; i++) {
            let ver = vert[i];
            RenderCtx.lineTo(ver.x, ver.y);
        }
       
        RenderCtx.closePath();
        RenderCtx.stroke();
        RenderCtx.fill();

    }
}

class Polygon {

    position = Vector2D.Zero;
    vertex = [];
    _scaledVertex = [];
    _transformedVertex = [];
    _scale = 1;
    rotation = 0;
    _center;
    _width;
    _half_width;
    _height;
    _half_height;

    static createPolygon(numOfSides = 3, radius = 1) {
        var poly = new Polygon();

        var rotangle = (Math.PI * 2) / numOfSides;
        var angle = 0;

        for (var i = 0; i < numOfSides; i++) {
            angle = (i*rotangle) + ((Math.PI - rotangle)-0.5);
            let vector = Vector2D.create(Math.cos(angle) * radius,
                                         Math.sin(angle) * radius);
            poly.vertex.push(vector);
        }

        return poly;
    }
    size(newWidth, newHeight) {
        this._width = newWidth;
        this._half_width = newWidth/2;
        this._height = newHeight;
        this._half_height = newHeight/2;
    }

    calculateDaimension() {

        let x1 = 0, 
            y1 = 0,
            x2 = 0, 
            y2 = 0, 
            newCenter = Vector2D.Zero;

        for (var i = 0; i < this._scaledVertex.length; i++) {
            if (this._scaledVertex[i].x < x1)
                x1 = this._scaledVertex[i].x;

            if (this._scaledVertex[i].y < y1)
                y1 = this._scaledVertex[i].y;
            
            if (this._scaledVertex[i].x > x2)
                x2 = this._scaledVertex[i].x;

            if (this._scaledVertex[i].y > y2)
                y2 = this._scaledVertex[i].y;
        }

        newCenter.x = x1 + ((x2 - x1) / 2);
        newCenter.y = y1 + ((y2 - y1) / 2);

        let width = Math.abs(x1) + Math.abs(x2);
        let height = Math.abs(y1) + Math.abs(y2);
        this.size(width, height);

        this._center = newCenter;

        return Vector2D.create(width, height);
    }

    clone() {

        let clone = new Polygon();
        clone.position = this.position;
        clone.vertex = this.vertex;
        clone.scale = this.scale;
        clone.rotation = this.rotation;

        return clone;
    }

    get getTransformedVerts() {
        let trans = this.vertex.map(vert => {
            var newVert = vert.clone(); 
            if (this.rotation != 0) {

                let hyp = vert.length;
                let angle = Math.atan(vert.y, vert.x);
                angle += this.rotation * (Math.PI / 180);

                newVert.x = Math.cos(angle) * hyp;
                newVert.y = Math.sin(angle) * hyp;
            }
            if (this._scale != 0) {
                newVert.x *= this._scale;
                newVert.y *= this._scale;
            } 
            return newVert;
        });
        this._transformedVertex = trans;
        
        return this._transformedVertex;
    }

    rotate(rad) {
        let hyp = this.vertex.length;

        let angle = Math.atan(vert)
    }

    scalePolygon() {
        let scaledVertex = [];
        for (var i = 0; i < this.vertex.length; i++) {
            let clone = this.vertex[i].clone();
            clone.x *= this._scale;
            clone.y *= this._scale;

            scaledVertex.push(clone);
        }
        this._scaledVertex = scaledVertex;
    }

    set scale(newScale) {
        this._scale = newScale;
        this.scalePolygon();
        this.calculateDaimension();
    }

    get scale() {
        return this._scale;
    }
}

export { Graphics, Polygon };