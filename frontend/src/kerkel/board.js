import * as THREE from 'three';
import constants  from './constants';
import Position from './position';
import Stone from './stone';

export default class Board {

    constructor (scene) {
        this.scene = scene;
        this.position = new THREE.Vector3(0, 0, 0);

        this.positions = [];
        this.player_on_move = null;

        for (let i=0; i<25; i+=1) {
            let position = new Position(this, i);
            this.positions[i] = position;
            position.mesh.position.copy(this.vPosition(position));
            scene.add(position.mesh);
        }

    }

    dealStones () {
        for (let row=0; row<3; row+=1) for (let i=0; i<5; i+=1) {
            let player = null;
            if (row === 0) player = 0;
            else if (row === 2) player = 1;

            if (player !== null && i === 2) continue;

            let stone = new Stone(player);
            this.scene.add(stone.mesh);
            this.positions[row * 10 + i].addStone(stone);
        }
    }

    setSituation (situation) {
        this.removeStones();
        this.positions.forEach(position => {
            const field = situation[position.i];
            if (field && field.stones) for (let i=0; i<field.stones; i+=1) {
                const stone = new Stone(field.player);
                this.scene.add(stone.mesh);
                position.addStone(stone);
            }
        });
    }

    removeStones () {
        this.positions.forEach(p => {
            p.stones.forEach(s => this.scene.remove(s.mesh));
            p.stones.length = 0;
        });
    }

    vPosition (position) {
        let {x, y} = position.xy();

        let v = this.position.clone();
        v.x += (-2 + x) * constants.P_SIZE;
        v.y += (2 - y) * constants.P_SIZE;
        return v;
    }

    possibleMoves (position) {
        if (this.player_on_move === null || position.presentPlayer() !== this.player_on_move) return;
        return POSSIBLE_MOVES[position.i].map(i => this.positions[i]);
    }

    move (from, to) {
        let stone = from.removeOneStone();
        let present_player = to.presentPlayer();

        if (present_player !== null && present_player !== stone.player) {
            to.stones.forEach(s => this.scene.remove(s.mesh));
            to.stones = [];

        } else if (to.presentNoMan()) {
            to.stones.forEach(s => this.scene.remove(s.mesh));
            to.stones = [];
            let s = new Stone(stone.player);
            this.scene.add(s.mesh);
            to.addStone(s);

        }
        to.addStone(stone);
    }

    isAtWinningPosition (player) {
        const winning_positions = POSSIBLE_MOVES[player === 0 ? 22 : 2];
        const position = winning_positions.find(p => this.positions[p].presentPlayer() === player);
        return !!position;
    }

    hasNoStonesLeft (player) {
        const position = this.positions.find(p => p.presentPlayer() === player);
        return !position;
    }

}


Board.addLayout = function (scene) {
    let size = constants.P_SIZE;

    let geometry = new THREE.Geometry();
    let points = [];

    // horizontals & verticals
    for (let i=-2; i<3; i+=1) {
        points.push([2 * -size, i * size]);
        points.push([2 * size, i * size]);
        points.push([i * size, 2 * -size]);
        points.push([i * size, 2 * size]);
    }
    // diagonals
    points.push([2 * -size, 2 * -size]);
    points.push([2 * size, 2 * size]);
    points.push([2 * -size, 2 * size]);
    points.push([2 * size, 2 * -size]);
    points.push([2 * -size, 0]);
    points.push([0, 2 * -size]);
    points.push([0, 2 * -size]);
    points.push([2 * size, 0]);
    points.push([2 * size, 0]);
    points.push([0, 2 * size]);
    points.push([0, 2 * size]);
    points.push([2 * -size, 0]);

    points.forEach(point_def =>
        geometry.vertices.push(new THREE.Vector3(...point_def, 0))
    );


    // curved paths
    let curves = [
        [[2 * size, 2 * size], [size, 3 * size], [-size, 3 * size], [2 * -size, 2 * size]],
        [[size, 2 * size], [size/2, 2.5 * size], [-size/2, 2.5 * size], [-size, 2 * size]],

        [[2 * -size, 2 * size], [3 * -size, size], [3 * -size, -size], [2 * -size, 2 * -size]],
        [[2 * -size, size], [2.5 * -size, size/2], [2.5 * -size, -size/2], [2 * -size, -size]],

        [[2 * -size, 2 * -size], [-size, 3 * -size], [size, 3 * -size], [2 * size, 2 * -size]],
        [[-size, 2 * -size], [-size/2, 2.5 * -size], [size/2, 2.5 * -size], [size, 2 * -size]],

        [[2 * size, 2 * -size], [3 * size, -size], [3 * size, size], [2 * size, 2 * size]],
        [[2 * size, -size], [2.5 * size, -size/2], [2.5 * size, size/2], [2 * size, size]]
    ];

    curves.forEach(curve_def => {
        let curve = new THREE.CubicBezierCurve3(
            ...curve_def.map(def => new THREE.Vector3(...def, 0))
        );
        curve.getPoints(5).forEach((p, i, all) => {
            geometry.vertices.push(p);
            if (i > 0 && i < all.length - 1) geometry.vertices.push(p);
        });
    });


    let material = new THREE.LineBasicMaterial({color: constants.LINES_COLOR, linewidth: 2});

    let line = new THREE.LineSegments(geometry, material);

    scene.add(line);
};

const POSSIBLE_MOVES = {
    0: [1, 4, 5, 20, 6],
    1: [0, 6, 3], //2
    2: [1, 3, 6, 7, 8],
    3: [4, 8, 1], //2
    4: [0, 3, 9, 24, 8],
    5: [6, 15, 10, 0],
    6: [7, 5, 11, 1, 12, 10, 0], //2
    7: [8, 6, 12], //2
    8: [9, 7, 13, 3, 14, 12, 4], //2
    9: [19, 8, 14, 4],
    10: [11, 15, 5, 16, 6],
    11: [12, 10, 16, 6],
    12: [13, 11, 17, 7, 18, 16, 6, 8],
    13: [14, 12, 18, 8],
    14: [13, 19, 9, 18, 8],
    15: [16, 5, 20, 10],
    16: [17, 15, 21, 11, 20, 10, 12], //22
    17: [18, 16, 12], //22
    18: [19, 17, 23, 13, 24, 12, 14], //22
    19: [9, 18, 24, 14],
    20: [21, 24, 0, 15, 16],
    21: [20, 23, 16], //22
    22: [16, 17, 18, 21, 23],
    23: [24, 21, 18], //22
    24: [20, 23, 4, 19, 18]
};