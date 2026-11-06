import * as THREE from "three";

/**
 * One authored, Xuân Hương-inspired mature pine silhouette — not a botanical scan.
 * The bole sits outside the server's x >= -22m playable rectangle. The needles
 * are static to keep the first visual / multiplayer QA reproducible.
 */
export function createHeroPine(): THREE.Group {
  const tree = new THREE.Group();
  tree.name = "D2A2_hero_pine";
  const bark = new THREE.MeshStandardMaterial({color: 0x594b3e, roughness: 1});
  const darkBark = new THREE.MeshStandardMaterial({color: 0x3e3b33, roughness: 1});
  const foliage = new THREE.MeshStandardMaterial({
    color: 0xffffff, roughness: 1, flatShading: true,
  });
  const up = new THREE.Vector3(0, 1, 0);
  const xAxis = new THREE.Vector3(1, 0, 0);

  function limb(a: THREE.Vector3, b: THREE.Vector3, foot: number, tip: number, material = bark) {
    const direction = b.clone().sub(a);
    const cylinder = new THREE.Mesh(
      new THREE.CylinderGeometry(tip, foot, direction.length(), 7),
      material,
    );
    cylinder.quaternion.setFromUnitVectors(up, direction.clone().normalize());
    cylinder.position.copy(a).add(b).multiplyScalar(.5);
    tree.add(cylinder);
  }

  // Visible leaning trunk with separate taper stages and exposed lower bole.
  const trunk = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(.08, 2.9, -.09),
    new THREE.Vector3(.28, 5.8, -.27),
    new THREE.Vector3(.52, 9.0, -.32),
    new THREE.Vector3(.21, 12.0, -.61),
    new THREE.Vector3(-.22, 14.3, -.78),
  ];
  const radii = [.45, .31, .23, .16, .095, .025];
  for (let i = 0; i < trunk.length - 1; i++) {
    limb(trunk[i], trunk[i + 1], radii[i], radii[i + 1]);
  }

  // Low, fine roots imply a planted tree without adding walkable collision.
  for (let i = 0; i < 5; i++) {
    const angle = i * Math.PI * 2 / 5 + .4;
    limb(trunk[0], new THREE.Vector3(Math.cos(angle) * 1.0, .08, Math.sin(angle) * .87),
      .16, .035, darkBark);
  }

  const sprays: Array<{point: THREE.Vector3; rotation: THREE.Quaternion; scale: THREE.Vector3; color: number}> = [];
  const tones = [0x28483e, 0x315848, 0x426653, 0x557360, 0x345044];
  // Mature pine: different branch counts/lengths per layer, broad sideways reach
  // with open gaps. Deliberately *not* nested cones or a uniform spruce skirt.
  const tiers = [
    {y: 5.0, width: 5.4, count: 5},
    {y: 6.4, width: 5.9, count: 6},
    {y: 7.8, width: 5.4, count: 5},
    {y: 9.3, width: 4.6, count: 5},
    {y: 10.8, width: 3.65, count: 4},
    {y: 12.15, width: 2.65, count: 3},
  ];

  tiers.forEach((tier, t) => {
    for (let i = 0; i < tier.count; i++) {
      const angle = i * Math.PI * 2 / tier.count + t * .63 + .28;
      const radial = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
      const irregular = .76 + .23 * (1 + Math.sin(i * 2.39 + t * 4.8)) / 2;
      const reach = tier.width * irregular;
      const origin = new THREE.Vector3(.15 + tier.y * .018, tier.y, -.22 - tier.y * .024);
      const mid = origin.clone().addScaledVector(radial, reach * .6);
      mid.y -= .36 + (i % 3) * .11;
      const tip = origin.clone().addScaledVector(radial, reach);
      tip.y += .15 + (i % 2) * .19;
      limb(origin, mid, .125 - t * .009, .065 - t * .004, darkBark);
      limb(mid, tip, .064 - t * .004, .018);

      const direction = tip.clone().sub(origin).normalize();
      for (let s = 0; s < 5; s++) {
        const along = .40 + s * .13;
        const point = origin.clone().lerp(tip, along);
        const side = new THREE.Vector3(-radial.z, 0, radial.x);
        const flip = s % 2 ? 1 : -1;
        point.addScaledVector(side, flip * (.30 + s * .045));
        point.y += .13 * Math.sin(s * 2.2 + i);
        const rotation = new THREE.Quaternion().setFromUnitVectors(xAxis, direction);
        const tilt = new THREE.Quaternion().setFromAxisAngle(direction, flip * (.16 + (i % 3) * .1));
        rotation.multiply(tilt);
        const extent = .86 + (s % 3) * .15;
        sprays.push({
          point, rotation,
          scale: new THREE.Vector3(extent, .24 + (i % 2) * .06, .48 + (s % 2) * .16),
          color: tones[(i + t + s * 2) % tones.length],
        });
      }
    }
  });

  // One shared needle geometry + instanced colour variations; no random-frame jitter.
  const needles = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), foliage, sprays.length);
  needles.name = "D2A2_asymmetric_needle_sprays";
  const dummy = new THREE.Object3D();
  sprays.forEach((spray, index) => {
    dummy.position.copy(spray.point);
    dummy.quaternion.copy(spray.rotation);
    dummy.scale.copy(spray.scale);
    dummy.updateMatrix();
    needles.setMatrixAt(index, dummy.matrix);
    needles.setColorAt(index, new THREE.Color(spray.color));
  });
  needles.instanceMatrix.needsUpdate = true;
  if (needles.instanceColor) needles.instanceColor.needsUpdate = true;
  needles.computeBoundingSphere();
  tree.add(needles);

  tree.position.set(-23.6, -.02, -11.5);
  return tree;
}
