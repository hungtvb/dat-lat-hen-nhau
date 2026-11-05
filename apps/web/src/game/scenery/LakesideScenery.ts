import * as THREE from "three";

/** D2-A1 original geometry — painterly Xuân Hương-inspired greybox, not GIS data.
 * Shore/water stay to the west of the server-authoritative x = -22m boundary.
 */
const edgeX = (z:number) => -24.7 + .65*Math.sin(z*.14) + .24*Math.cos(z*.3);

function ribbon(name:string, steps:number, columns:number,
  point:(i:number,j:number)=>[number,number,number], material:THREE.Material) {
  const vertices:number[]=[],indices:number[]=[];
  for(let i=0;i<=steps;i++)for(let j=0;j<columns;j++)vertices.push(...point(i,j));
  for(let i=0;i<steps;i++)for(let j=0;j<columns-1;j++){
    const a=i*columns+j,b=a+columns;
    indices.push(a,b,a+1,a+1,b,b+1);
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute("position",new THREE.Float32BufferAttribute(vertices,3));
  g.setIndex(indices);g.computeVertexNormals();
  const mesh=new THREE.Mesh(g,material);mesh.name=name;return mesh;
}

export function buildLakesideGreybox(scene:THREE.Scene) {
  const world=new THREE.Group();world.name="D2A1_Xuan_Huong_Lakeside";
  // Flat authoritative walking ground: players stay at y=0.
  const lawn=new THREE.Mesh(new THREE.PlaneGeometry(144,132),
    new THREE.MeshStandardMaterial({color:0x748e78,roughness:1}));
  lawn.rotation.x=-Math.PI/2;lawn.position.set(50,-.037,0);world.add(lawn);

  const water=ribbon("D2A_calm_lake",90,2,(i,j)=>{
    const z=-65+130*i/90;
    return [j===0?-147:edgeX(z)-.05,-.14,z];
  },new THREE.MeshStandardMaterial({color:0x70999c,roughness:.48,metalness:.04,side:THREE.DoubleSide}));
  world.add(water);

  const bank=ribbon("D2A_curved_bank",90,3,(i,j)=>{
    const z=-59+118*i/90,edge=edgeX(z);
    const cross=[-1.1,1.25,5.2][j];
    return [edge+cross,[-.137,-.032,-.026][j],z];
  },new THREE.MeshStandardMaterial({color:0x879987,roughness:1,side:THREE.DoubleSide}));
  world.add(bank);

  const walkway=ribbon("D2A_40m_walkable_path",80,2,(i,j)=>{
    const z=-20+40*i/80,center=-2.9+.55*Math.sin(z*.1);
    return [center+(j===0?-2.95:2.95),.009,z];
  },new THREE.MeshStandardMaterial({color:0xbcb5a2,roughness:1,side:THREE.DoubleSide}));
  world.add(walkway);

  const rocks=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),
    new THREE.MeshStandardMaterial({color:0x999a89,roughness:1}),48);
  const item=new THREE.Object3D();
  for(let i=0;i<48;i++){
    const z=-42+i*1.76;
    item.position.set(edgeX(z)+1.45+.22*Math.sin(i*2.01),-.07,z);
    item.rotation.set(0,i*.31,.06);
    item.scale.set(.3+(i%3)*.11,.09,.2+(i%4)*.09);
    item.updateMatrix();rocks.setMatrixAt(i,item.matrix);
  }
  rocks.instanceMatrix.needsUpdate=true;world.add(rocks);

  const ripples=new THREE.InstancedMesh(
    new THREE.PlaneGeometry(.95,.05).rotateX(-Math.PI/2),
    new THREE.MeshBasicMaterial({color:0xdaebe0,transparent:true,opacity:.2,side:THREE.DoubleSide,depthWrite:false}),
    56);
  for(let i=0;i<56;i++){
    item.position.set(-31-(i*17%68),-.126,-46+(i*29%94));
    item.rotation.set(0,(i%5)*.11,0);
    item.scale.set(.7+(i%4)*.2,1,1);
    item.updateMatrix();ripples.setMatrixAt(i,item.matrix);
  }
  ripples.instanceMatrix.needsUpdate=true;world.add(ripples);

  scene.add(world);
  return world;
}
