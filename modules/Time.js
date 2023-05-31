class Time {

    static lastFrame;
    static nowFrame = this.getTimeinSec;
    static elapsed = 0;
    static deltaTime = 0.01;
    static dt = 0;

    static accumulator = 0;
    static t = 0;
    
    static startTime = this.getTimeinSec;
    static frame = -1;

    static fps = 144;
    static fpsInterval = 1/this.fps;

    static fpscounter = document.getElementById("fps");
    static _fpsCount = 0;

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

    static Init() {

        this.nowFrame = this.getTimeinSec;
        this.lastFrame = this.nowFrame;

        this.fpscounter.innerText = Time.fpsCount();
    }

    static calcFrame() {
        
        this.frame++;

        this.nowFrame = this.getTimeinSec;

        this.frameTime = this.nowFrame - this.lastFrame;

        if ( this.frameTime > 0.016 ) 
            this.frameTime = 0.016;
            
        this.lastFrame = this.nowFrame;
        
        this.accumulator += this.frameTime;
        
    }

    static setDeltaTime() {

        this.deltaTime += Math.min(1, this.frameTime/1000);
        Time.deltaTime = this.deltaTime;
        
    }

    static Alpha() {
        this.alpha = this.accumulator / this.deltaTime;
    }

    static get countFps() {
        return (this.frame/this.time);
    }

    static fpsCount() {
        return this.frame/this.time;
    }

    static get getTimeinSec() {
        return performance.now()/1000;
    }

    static get time() {
        return this.lastFrame - this.startTime;
    }
}

export { Time as Time };
