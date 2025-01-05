// Cylinder.js
class Cylinder {
    constructor(x,y,z) {
        this.type = 'cylinder';
        this.position = [0.0,0.0,0.0];
        this.color = [1.0,1.0,1.0,1.0];
        this.matrix = new Matrix4();
        this.size = 100.0;
        this.height = 100.0;
        this.segments = 10;
        this.x = x;
        this.y = y;
        this.z = z;

        this.buffer = null;
        this.verts = null;
    }
    genVerts() {
        this.verts = [];
        var xy = this.position;
        var d = this.size/200.0;
        let angleStep = 360/this.segments;
        for (var angle = 0; angle < 360; angle += angleStep) {
            let centerPt = [xy[0], xy[1]];
            let angle1 = angle;
            let angle2 = angle + angleStep;
            let vec1 = [Math.cos(angle1*Math.PI/180)*d, Math.sin(angle1*Math.PI/180)*d];
            let vec2 = [Math.cos(angle2*Math.PI/180)*d, Math.sin(angle2*Math.PI/180)*d];
            let p1 = [centerPt[0]+vec1[0], centerPt[1]+vec1[1]];
            let p2 = [centerPt[0]+vec2[0], centerPt[1]+vec2[1]];
            //top
            this.verts.push.apply(this.verts, [xy[0],xy[1],this.height/200.0,   p1[0],p1[1],this.height/200.0,   p2[0],p2[1],this.height/200.0]);
            //bottom
            this.verts.push.apply(this.verts, [xy[0],xy[1],-this.height/200.0,   p1[0],p1[1],-this.height/200.0,   p2[0],p2[1],-this.height/200.0]);
            //connecting face
            this.verts.push.apply(this.verts, [p1[0],p1[1],this.height/200.0,   p1[0],p1[1],-this.height/200.0,   p2[0],p2[1],-this.height/200.0]);
            this.verts.push.apply(this.verts, [p2[0],p2[1],-this.height/200.0,   p1[0],p1[1],this.height/200.0,   p2[0],p2[1],this.height/200.0]);
        }
    }
    render() {
        var rgba = this.color;

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        // Create a verts object
        if (this.verts == null) {
            this.genVerts();
        }
        
        // Create a buffer object
        if (this.buffer == null) {
            this.buffer = gl.createBuffer();
            if (!this.buffer) {
            console.log('Failed to create the buffer object');
            return -1;
            }
        }

        // Bind the buffer object to target
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        // Write data into the buffer object
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.verts), gl.DYNAMIC_DRAW);
        // Assign the buffer object to a_Position variable
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        // Enable the assignment to a_Position variable
        gl.enableVertexAttribArray(a_Position);

        // Draw
        for (var i = 0; i < this.verts.length/3; i += this.verts.length/3/this.segments) {
            let colorOffset = (Math.abs(i-this.verts.length/6)+this.verts.length/6)/(this.verts.length/3);
            gl.uniform4f(u_FragColor, rgba[0]*colorOffset, rgba[1]*colorOffset, rgba[2]*colorOffset, rgba[3]);
            gl.drawArrays(gl.TRIANGLES, i, this.verts.length/3/this.segments);
        }
    }
}