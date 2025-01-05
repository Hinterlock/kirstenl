// CSE 160 Assignment 2 - Blocky Animal
// Kirsten Lindblad
// Makes a funny inflatable tube man

// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE =`
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

var g_shapesList = [];
let g_globalAngleX = 0;
let g_globalAngleY = 0;
let g_joint = 0;
let g_joint1 = 0;
let g_anim = true;

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

var poked = 0;

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHTMLUI()

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = function(ev){ click(ev) };
  canvas.onmousemove = function(ev) {if(ev.buttons == 1) {click(ev)}};

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  genShapes();
  // Render
  requestAnimationFrame(tick);
}

function tick() {
    g_seconds = performance.now()/1000.0 - g_startTime;
    //console.log(g_seconds);
    // increment angles
    updateAnimationAngles();
    renderAllShapes();
    requestAnimationFrame(tick);
}

function setupWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');
  
    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    // enable depth
    gl.enable(gl.DEPTH_TEST);
}
function connectVariablesToGLSL() {
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }
  
    // // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }
  
    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    // Get the storage location of u_ModelMatrix
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }

    // Get the storage location of u_GlobalRotateMatrix
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
        return;
    }
}
// Set up actions for the HTML UI elements
function addActionsForHTMLUI() {
    // Button events
    document.getElementById('offButton').onclick = function() {g_anim = false;};
    document.getElementById('onButton').onclick = function() {g_anim = true;};
    // Slider events
    document.getElementById('angleXSlide').addEventListener('mousemove', function() {g_globalAngleY = this.value;});
    document.getElementById('angleYSlide').addEventListener('mousemove', function() {g_globalAngleX = this.value;});
    document.getElementById('jointSlide').addEventListener('mousemove', function() {g_joint = this.value/10;});
    document.getElementById('joint2Slide').addEventListener('mousemove', function() {g_joint1 = this.value;});
}
function click(ev) {
    if (ev.shiftKey) {
        //console.log("poke!");
        poked = g_seconds;
    }
    let [x,y] = convertCoordinatesEventToGL(ev);
    g_globalAngleX = -y*180;
    g_globalAngleY = -x*180;
}
function convertCoordinatesEventToGL(ev) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();
  
    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
    return [x,y];
}
function genShapes() {
    // Base
    let base = new Cube(bx,by,bz);
    base.color = [0.3,0.2,0.2,1.0];
    base.matrix.translate(xoffset,yoffset,zoffset);
    base.matrix.scale(bx,by,bz);
    g_shapesList.push(base);
    
    let color = [0.5,0.0,0.0,1.0];
    // Segments
    for (let i = 0; i < 14; i++) {
        let seg = new Cylinder(0.2,0.1,0.2);
        seg.color = color;
        g_shapesList.push(seg);
        color[0] += 0.05;
    }
    color[0] -= 0.1;

    // Arms
    for (let i = 0; i < 14; i++) {
        let seg = new Cylinder(0.1,0.05,0.1);
        seg.color = color;
        g_shapesList.push(seg);
        color[0] -= 0.025;
    }
    for (let i = 0; i < 14; i++) { color[0] += 0.025; }


    for (let i = 0; i < 14; i++) {
        let seg = new Cylinder(0.1,0.05,0.1);
        seg.color = color;
        g_shapesList.push(seg);
        color[0] -= 0.025;
    }

    
    // Face

    let blink = new Cube(0.05,0.02,0.04);
    blink.color = [0,0,0,1];
    g_shapesList.push(blink);
    let blink1 = new Cube(0.05,0.02,0.04);
    blink1.color = [0,0,0,1];
    g_shapesList.push(blink1);


    let eye = new Cube(0.04,0.1,0.04);
    g_shapesList.push(eye);
    let pupil = new Cube(0.03,0.04,0.04);
    pupil.color = [0,0,0,1];
    g_shapesList.push(pupil);

    let eye1 = new Cube(0.04,0.1,0.04);
    g_shapesList.push(eye1);
    let pupil1 = new Cube(0.03,0.04,0.04);
    pupil1.color = [0,0,0,1];
    g_shapesList.push(pupil1);
    
}

// dimensions/translation of base
let bx = 0.4;
let xoffset = -bx/2;
let by = 0.2;
let yoffset = -by/2-.8;
let bz = .4;
let zoffset = -.3;

function renderAllShapes() {
    //timing:
    var st = performance.now();
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    //console.log(g_globalAngle);
  
    // Pass the matrix
    var globalRotMat = new Matrix4().rotate(-g_globalAngleX, 1, 0, 0).rotate(g_globalAngleY, 0, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    let color = [0.5,0.0,0.0,1.0];
    g_shapesList[0].render();

    // Segments
    let joints = [];
    let offsets = [];
    for (let i = 1; i < 15; i++) {
        //reset matrix
        g_shapesList[i].matrix.setIdentity();
        joints.push([5*Math.sin(g_joint+i/2),1,0,0]);
        offsets.push([0,g_shapesList[i].y,0]);
        joints.push([g_joint1/2,0,0,1]);
        offsets.push([0,0,0]);
        renderSeg(g_shapesList[i], joints, offsets);
        color[0] += 0.05;
    }
    color[0] -= 0.1;

    // Face
    joints.pop();offsets.pop();joints.pop();offsets.pop();
    if (poked) {
        //reset matrix
        g_shapesList[43].matrix.setIdentity();
        g_shapesList[44].matrix.setIdentity();
        joints.push([0,0,1,0]); offsets.push([0.06,0,-0.1]);
        renderSeg(g_shapesList[43], joints, offsets);
        joints.pop();offsets.pop();
        joints.push([0,0,1,0]); offsets.push([-0.06,0,-0.1]);
        renderSeg(g_shapesList[44], joints, offsets);
        joints.pop();offsets.pop();
    } else {
        //reset matrix
        g_shapesList[45].matrix.setIdentity();
        g_shapesList[46].matrix.setIdentity();
        g_shapesList[47].matrix.setIdentity();
        g_shapesList[48].matrix.setIdentity();
        joints.push([0,0,1,0]); offsets.push([0.06,0,-0.1]);
        renderSeg(g_shapesList[45], joints, offsets);
        joints.push([0,0,1,0]); offsets.push([0,0,-0.01]);
        renderSeg(g_shapesList[46], joints, offsets);
        joints.pop();offsets.pop();joints.pop();offsets.pop();

        joints.push([0,0,1,0]); offsets.push([-0.06,0,-0.1]);
        renderSeg(g_shapesList[47], joints, offsets);
        joints.push([0,0,1,0]); offsets.push([0,0,-0.01]);
        renderSeg(g_shapesList[48], joints, offsets);
        joints.pop();offsets.pop();joints.pop();offsets.pop();
    }

    // Arms
    joints.pop();offsets.pop();joints.pop();offsets.pop();
    joints.pop();offsets.pop();joints.pop();offsets.pop();
    for (let i = 15; i < 29; i++) {
        //reset matrix
        g_shapesList[i].matrix.setIdentity();
        //movement
        joints.push([5*Math.sin(g_joint+.2),0,0,1]);
        offsets.push([g_shapesList[i].y,0,0]);
        //reorient
        joints.push([90,0,0,1]);
        offsets.push([0,0,0]);
        renderSeg(g_shapesList[i], joints, offsets);
        //have to pop off the reorientation
        joints.pop();offsets.pop();
    }
    for (let i = 0; i < 14; i++) { joints.pop();offsets.pop(); }


    for (let i = 29; i < 43; i++) {
        //reset matrix
        g_shapesList[i].matrix.setIdentity();
        //movement
        joints.push([5*Math.sin(g_joint+.2),0,0,1]);
        offsets.push([-g_shapesList[i].y,0,0]);
        //reorient
        joints.push([90,0,0,1]);
        offsets.push([0,0,0]);
        renderSeg(g_shapesList[i], joints, offsets);
        //have to pop off the reorientation
        joints.pop();offsets.pop();
    }
    let dur = performance.now() - st;
    sendTextToHTML("ms: " + Math.floor(dur) + " fps: " + Math.floor(10000/dur), "perf");
}

function sendTextToHTML(txt, id) {
    var htmlElm = document.getElementById(id);
    if (!htmlElm) {
        console.log("Failed to get " + id);
        return;
    }
    htmlElm.innerHTML = txt;
}

function updateAnimationAngles() {
    if (g_anim) {
        g_joint = g_seconds;
        g_joint1 = 10*Math.cos(g_seconds);
    }
    if (poked > 0 && poked + 0.6  < g_seconds) {
        //console.log("poked no more");
        poked = 0;
    }
}

function renderSeg(seg, joints, offsets) {
    if (seg.type == "cylinder") {
        seg.matrix.translate(xoffset+bx/2,yoffset+by/2,zoffset+bz/2);
        
        //joints
        seg.matrix.translate(0,0,seg.z/2);
        for (let i = 0; i < joints.length; i++) {
            let j = joints[i];
            seg.matrix.rotate(j[0],j[1],j[2],j[3]);
            let o = offsets[i];
            seg.matrix.translate(o[0],o[1],o[2]);//dist from joint
        }
        seg.matrix.translate(0,0,-seg.z/2);

        seg.matrix.scale(seg.x,seg.y,seg.z);
        seg.matrix.rotate(90,1,0,0);
        seg.render();
    } else if (seg.type == "cube") {
        seg.matrix.translate(xoffset+(bx-seg.x)/2,yoffset+(by-seg.y)/2,zoffset+(bz-seg.z)/2);
        
        //joints
        seg.matrix.translate(seg.x/2,seg.y/2,seg.z/2);
        for (let i = 0; i < joints.length; i++) {
            let j = joints[i];
            seg.matrix.rotate(j[0],j[1],j[2],j[3]);
            let o = offsets[i];
            seg.matrix.translate(o[0],o[1],o[2]);//dist from joint
        }
        seg.matrix.translate(-seg.x/2,-seg.y/2,-seg.z/2);
    
        seg.matrix.scale(seg.x,seg.y,seg.z);
        seg.render();
    }
}