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

    multiplay(n) {
        return new Vector2D(this.x * n, this.y * n);
    }

    distance(other) {
        
        return Math.sqrt(Math.pow((this.x - other.x), 2) + 
               Math.pow((this.y - other.y),2));
    }

    get length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    get sqrlenght() {
        
        return this.x * this.x + this.y * this.y;
    }

    get normal() {

        let normalized = new Vector2D();

        normalized.x = -this.y;
        normalized.y = this.x;

        let normalized_len = normalized.length;

        if( normalized_len === 0) {
            return normalized;
        }

        normalized.x /= normalized_len;
        normalized.y /= normalized_len;

        return normalized;
    }

    normalize() {
        let len = this.length;
        if (len == 0)
            return;
        
        let ratio = 1/len;
        this.x *= ratio;
        this.y *= ratio;
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

    set magnitude(value) {
        let len = Math.sqrt(Math.pow(this.x,2) + Math.pow(this.y,2));
        if (len == 0)
            return;
        let ratio = value / len;
        this.x *= ratio;
        this.y *= ratio;
    }

    clone() {
        let clone = new Vector2D();
        clone.x = this.x;
        clone.y = this.y;

        return clone;
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

    static dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y; 
    } 
}

export { Vector2D as Vector2D };