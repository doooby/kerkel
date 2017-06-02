import * as THREE from 'three';
import * as Detector from 'three/examples/js/Detector';

import constants from './constants';
import Board from './board';
import Session from './session';

export default class K3D {

    constructor (container) {
        this.session = null;
        this.move_context = null;
        this._on_move_callback = null;
        this.container = container;

        if (!Detector.webgl) {
            Detector.addGetWebGLMessage({parent: container});
            return;
        }

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(constants.BG_COLOR);
        this.setSize();

        container.appendChild(this.renderer.domElement);
        this.scene = new THREE.Scene();
        this.buildCamera();

        Board.addLayout(this.scene);
        this.board = new Board(this.scene);
        this.renderer.domElement.addEventListener('mousedown', on_mouse_down.bind(this));
        this.renderer.domElement.addEventListener('mouseup', on_mouse_up.bind(this));
        this.renderer.domElement.addEventListener('mouseout', on_mouse_out.bind(this));
    }

    setSize () {
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    buildCamera () {
        let scene_h2 = 50;
        let scene_w2 = (this.container.clientWidth / this.container.clientHeight) * scene_h2;
        this.camera = new THREE.OrthographicCamera( scene_w2, -scene_w2, scene_h2, - scene_h2, 0, 100);
        this.camera.position.z = -50;
        this.rotateForPlayer(1);
    }

    onContainerSizeChanged () {
        this.setSize();
        this.buildCamera();
        this.render();
    }

    initSession () {
        if (!this.renderer) return;

        this.clearSession();
        this.board.removeStones();
        this.board.dealStones();

        if (arguments.length) {
            this.session = new Session(this, ...arguments);

        }
        else {
            this.session = null;

        }

        if (this.session !== null) {
            this.rotateForPlayer(this.session.local_player_i);
            this.session.attach();
        }
        this.render();
    }

    clearSession () {
        on_mouse_out.call(this);
        if (this.session) this.session.detach();
    }

    rotateForPlayer (player_i) {
        this.camera.up.y = (player_i === 1 ? 1 : -1);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    }

    render () {
        if (this.renderer) this.renderer.render(this.scene, this.camera);
    }

    mouse_hit_position (event) {
        let element = this.renderer.domElement;
        let x = event.clientX - element.offsetLeft + document.documentElement.scrollLeft;
        let y = event.clientY -  element.offsetTop + document.documentElement.scrollTop;
        let v = new THREE.Vector2(
            2 * (x / element.clientWidth) - 1,
            -2 * (y / element.clientHeight) + 1
        );

        let ray = new THREE.Raycaster();
        ray.setFromCamera(v, this.camera);
        let hit = ray.intersectObjects(this.board.positions.map(p => p.mesh))[0];
        if (hit) return hit.object.__kerkel_position;
    }

}

function on_mouse_down(event) {
    if (!this.session || this.session.local_player_i !== this.board.player_on_move) return;

    let position = this.mouse_hit_position(event);
    if (position) {
        let possible_positions = this.board.possibleMoves(position);
        if (!possible_positions) return;

        this.move_context = {
            start: position,
            possible_positions
        };

        possible_positions.forEach(p => p.setMoveColor());
        this.render();
    }
}

function on_mouse_up (event) {
    let move = this.move_context;

    if (move) {
        this.move_context = null;
        move.possible_positions.forEach(p => p.resetColor());

        let end_position = this.mouse_hit_position(event);
        if (end_position && move.possible_positions.includes(end_position)) {
            this.board.player_on_move = null;
            this.board.move(move.start, end_position);
            if (this._on_move_callback) this._on_move_callback(move.start.i, end_position.i);
        }

        this.render();
    }
}

function on_mouse_out () {
    if (this.move_context) {
        this.move_context.possible_positions.forEach(p => p.resetColor());
        this.render();
    }
    this.move_context = null;
}