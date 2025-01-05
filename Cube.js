// Cube.js
var verts = [
    0,0,0,  1,1,0,  1,0,0,      0,0,0,  0,1,0,  1,1,0, //Front
    0,0,1,  1,1,1,  1,0,1,      0,0,1,  0,1,1,  1,1,1, //Back
    0,1,0,  0,1,1,  1,1,1,      0,1,0,  1,1,1,  1,1,0, //Top
    0,0,0,  1,0,0,  1,0,1,      0,0,0,  0,0,1,  1,0,1, //Bottom
    0,1,0,  0,0,1,  0,0,0,      0,1,0,  0,1,1,  0,0,1, //Left
    1,1,0,  1,0,1,  1,0,0,      1,1,0,  1,1,1,  1,0,1  //Right
];
class Cube {
    constructor(x, y, z) {
        this.type = 'cube';
        this.color = [1.0,1.0,1.0,1.0];
        this.matrix = new Matrix4();
        this.x = x;
        this.y = y;
        this.z = z;

        this.buffer = null;
        this.vertices = [[0,0,0,  1,1,0,  1,0,0],[0,0,0,  0,1,0,  1,1,0]];
    }
    render() {
        var rgba = this.color;

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        
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
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.DYNAMIC_DRAW);
        // Assign the buffer object to a_Position variable
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        // Enable the assignment to a_Position variable
        gl.enableVertexAttribArray(a_Position);

        // Draw
        // Front/Back
        gl.drawArrays(gl.TRIANGLES, 0, verts.length/3/3);
        // Top/Bottom
        gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
        gl.drawArrays(gl.TRIANGLES, verts.length/3/3, verts.length/3/3);
        // Left/Right
        gl.uniform4f(u_FragColor, rgba[0]*.7, rgba[1]*.7, rgba[2]*.7, rgba[3]);
        gl.drawArrays(gl.TRIANGLES, verts.length/3/3*2, verts.length/3/3);
    }
}