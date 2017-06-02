import * as THREE from 'three';
import constants  from './constants';

export default class Stone {

    constructor (player_i=null) {
        let material = Stone.materials[player_i === null ? 2 : player_i];
        this.mesh = new THREE.Mesh(Stone.geometry, material);
        this.mesh.position.z = -10;
        this.mesh.rotation.x = Math.PI / 2;
        this.player = player_i;
    }

    position (x, y) {
        this.mesh.position.x = x;
        this.mesh.position.y = y;
    }

}

Stone.geometry = new THREE.CylinderBufferGeometry(
    constants.STONE_SIZE,
    constants.STONE_SIZE,
    5,
    5
);

Stone.materials = constants.STONE_COLORS.map(color =>
    new THREE.MeshBasicMaterial({color: color})
);