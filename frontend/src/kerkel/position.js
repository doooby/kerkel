import * as THREE from 'three';
import constants  from './constants';

export default class Position {

    constructor (board, index) {
        this.board = board;
        this.i = index;
        this.stones = [];

        let geometry = new THREE.PlaneBufferGeometry(constants.P_CIRCLE, constants.P_CIRCLE);

        let material = null;
        if (index === 2) material = circle_border_material(constants.STONE_COLORS[0]);
        else if (index === 22) material = circle_border_material(constants.STONE_COLORS[1]);
        else material = circle_material();

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.__kerkel_position = this;
    }

    xy () {
        return {x: (this.i % 5), y: Math.floor(this.i / 5)};
    }

    addStone (stone) {
        this.stones.push(stone);
        stone.mesh.rotation.y = Math.PI * Math.random();
        this.positionStones();
    }

    presentPlayer () {
        return this.stones.length === 0 ? null : this.stones[0].player;
    }

    presentNoMan () {
        return this.stones.length > 0 && this.stones[0].player === null;
    }

    setMoveColor () {
        this.mesh.material.uniforms.innerCol.value = new THREE.Color(constants.P_MOVE_COLOR);
    }

    resetColor () {
        this.mesh.material.uniforms.innerCol.value = new THREE.Color(constants.LINES_COLOR);
    }

    removeOneStone () {
        let stone = this.stones.splice(this.stones.length-1, 1)[0];
        this.positionStones();
        return stone;
    }

    positionStones () {
        let count = this.stones.length;
        if (count === 0) return;
        let v_pos = this.board.vPosition(this);

        if (count === 1) {
            this.stones[0].position(v_pos.x, v_pos.y);

        }
        else {
            let r = constants.P_CIRCLE / (count > 3 ? 2 : 3);
            let angle_step = 2 * Math.PI / count;
            let angle_start = 2 * Math.PI * Math.random();
            this.stones.forEach((stone, index) => stone.position(
                v_pos.x + r * Math.cos(angle_start + angle_step*index),
                v_pos.y + r * Math.sin(angle_start + angle_step*index)
            ));
        }
    }

}

// Position.xy = function (i) {
//     return {x: (i % 5), y: Math.floor(i / 5)};
// };
//
// Position.index = function (x, y) {
//     return y * 5 + x;
// };

function circle_material () {
    return new THREE.ShaderMaterial({
        uniforms: {
            radius: {type: 'f', value: constants.P_CIRCLE_RADIUS + constants.P_CIRCLE_STROKE},
            innerCol: {type: 'c', value: new THREE.Color(constants.LINES_COLOR)},
        },
        side: THREE.DoubleSide,
        vertexShader: vertext_shader,
        fragmentShader: fragment_shader
    });
}

function circle_border_material (border_color) {
    return new THREE.ShaderMaterial({
        uniforms: {
            radius: {type: 'f', value: constants.P_CIRCLE_RADIUS},
            stroke: {type: 'f', value: constants.P_CIRCLE_RADIUS + constants.P_CIRCLE_STROKE},
            innerCol: {type: 'c', value: new THREE.Color(constants.LINES_COLOR)},
            strokeCol: {type: 'c', value: new THREE.Color(border_color)}
        },
        side: THREE.DoubleSide,
        vertexShader: vertext_shader,
        fragmentShader: fragment_shader_border
    });
}


const vertext_shader = `varying vec2 vUV;
void main() {
  vUV = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}`;

const fragment_shader = `uniform vec3 innerCol;
uniform float radius;
varying vec2 vUV;
void main() {
  float d = distance(vUV, vec2(.5, .5));
  if(d<radius) gl_FragColor = vec4(innerCol, 1.);
  else discard;
}`;

const fragment_shader_border = `uniform vec3 innerCol;
uniform vec3 strokeCol;
uniform float radius;
uniform float stroke;
varying vec2 vUV;
void main() {
  float d = distance(vUV, vec2(.5, .5));
  if(d < radius) gl_FragColor = vec4(innerCol, 1.);
  else if(d >= radius && d < stroke) gl_FragColor = vec4(strokeCol, 1.);
  else discard;
}`;