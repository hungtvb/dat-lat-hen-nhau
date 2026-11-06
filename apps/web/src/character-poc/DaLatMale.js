/**
 * Đà Lạt Hẹn Nhau / Nam-02 — original styling around the ACTUAL installed
 * 3Dviz Pro Max blueprint (upstream/creatures/biped-walker.js, MIT).
 * The walker gait, IK, phase/distance, joints and source meshes are not imitations.
 * This layer only adds purpose-made seasonal clothing, hair and travel accessories.
 */
import * as THREE from 'three';
import { create as createBiped } from './upstream/creatures/biped-walker.js';
import { triangleCount, bevelledBox } from './upstream/kit-core.js';

const mat = (color, roughness=0.86, metalness=0) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness, flatShading:false });
const coat = mat('#ae7a59'), coatShade=mat('#865b47'), scarf=mat('#3f695b');
const leather=mat('#55493e'), leatherEdge=mat('#716452'), metal=mat('#c8aa72',.55,.35);
const hair=mat('#302a2a'), hairLight=mat('#423533'), skin=mat('#d9a97f');
const eye=mat('#302724'), stitch=mat('#d8bc99');
function blob(parent, name, material, pos, dimensions, detail=12) {
  const x = new THREE.Mesh(new THREE.SphereGeometry(1,detail,10),material);
  x.name=name;x.position.set(...pos);x.scale.set(...dimensions);
  x.castShadow=true;x.receiveShadow=true;parent.add(x);return x;
}
function block(parent,name,material,pos,dimensions,bevel=.016,rot=0) {
  const x=new THREE.Mesh(bevelledBox({width:dimensions[0],height:dimensions[1],
    depth:dimensions[2],bevel}),material);
  x.name=name;x.position.set(...pos);x.rotation.z=rot;x.castShadow=true;
  x.receiveShadow=true;parent.add(x);return x;
}
export function createDaLatMale() {
  const biped=createBiped({tunic:'#a77a58',seed:31,strideM:.66,strideHz:1.05,
    yawRateRad:2.3});
  biped.group.name='DLHN_Male02_3Dviz_Biped';
  const rig=biped.group.children[0];
  const body=rig.children[0];
  const hips=body.children[0];
  const torso=hips.children.find(x=>x.type==='Group');
  const head=torso.getObjectByName('head');
  if(!head)throw Error('3Dviz blueprint head anchor missing');
  // Source biped comes with a conical fantasy cap: remove those cap meshes,
  // then build an everyday hairstyle instead. The authored gait is untouched.
  const capColor=new THREE.Color('#8d5f4c');
  const oldCap=head.children.filter(x=>x.isMesh&&x.material.color&&x.material.color.equals(capColor));
  oldCap.forEach(x=>head.remove(x));
  // Under-cut + swept fringe. Details intentionally larger than real scale
  // so the hairstyle is legible behind a third-person follow camera.
  blob(head,'hair-crown',hair,[0,.232,-.012],[.112,.055,.106],14);
  blob(head,'hair-back',hair,[0,.190,-.078],[.110,.075,.061],12);
  for (const side of [-1,1]) {
    blob(head,'side-hair-'+side,hair,[side*.096,.194,-.01],[.024,.075,.065],10);
    blob(head,'ear-'+side,skin,[side*.093,.104,.010],[.019,.037,.029],9);
    blob(head,'eyebrow-'+side,hair,[side*.046,.136,.092],[.030,.007,.009],10);
  }
  blob(head,'swept-fringe-left',hairLight,[-.049,.240,.077],[.058,.025,.038],12).rotation.z=-.25;
  blob(head,'swept-fringe-right',hair,[.041,.246,.076],[.067,.021,.036],12).rotation.z=.24;
  // A quiet smile instead of oversize doll-like features.
  const smile=new THREE.Mesh(new THREE.TorusGeometry(.026,.0025,5,12,Math.PI*.75),eye);
  smile.name='subtle-smile';smile.position.set(0,.053,.102);smile.rotation.z=Math.PI*1.12;
  head.add(smile);
  // Cropped field jacket: zipper, panels, patch pockets and collar.
  block(torso,'jacket-placket',coatShade,[.009,.286,.175],[.019,.355,.014],.006);
  for (const s of [-1,1]) {
    block(torso,'jacket-lapel-'+s,coatShade,[s*.091,.443,.128],[.078,.154,.028],.012,-s*.16);
    block(torso,'jacket-pocket-'+s,coatShade,[s*.086,.16,.151],[.084,.11,.014],.009);
    block(torso,'pocket-flap-'+s,coat,[s*.085,.206,.164],[.089,.029,.019],.006);
    block(torso,'backpack-strap-'+s,leatherEdge,[s*.124,.343,.15],[.032,.37,.022],.008,-s*.16);
    blob(torso,'zipper-ornament-'+s,stitch,[s*.12,.18,.177],[.007,.008,.005],7);
  }
  for(let i=0;i<5;i++)
    blob(torso,'zipper-stitch-'+i,stitch,[.016,.130+i*.07,.189],[.004,.003,.004],6);
  // Scarf: wrapped volume and two off-axis tails.
  blob(torso,'scarf-wrap',scarf,[0,.511,.002],[.139,.054,.111],12);
  block(torso,'scarf-tail-left',scarf,[-.045,.367,.196],[.074,.245,.038],.017,-.13);
  block(torso,'scarf-tail-right',scarf,[.053,.399,.193],[.065,.179,.038],.017,.16);
  // Backpack follows the torso joint; shoulder straps bridge to front.
  block(torso,'backpack-body',leather,[0,.295,-.237],[.274,.396,.153],.038);
  block(torso,'backpack-front-pocket',leatherEdge,[0,.174,-.325],[.196,.12,.025],.02);
  block(torso,'backpack-flap',leatherEdge,[0,.405,-.330],[.233,.084,.028],.018);
  block(torso,'backpack-buckle',metal,[0,.387,-.348],[.036,.040,.013],.005);
  for (const s of [-1,1]) {
    block(torso,'backpack-side-zip-'+s,leatherEdge,[s*.143,.30,-.24],[.019,.19,.045],.006);
  }
  // A small handmade badge ties costume to the lakeside exploration theme.
  blob(torso,'pine-badge',scarf,[-.114,.406,.170],[.017,.027,.006],8);
  rig.updateMatrixWorld(true);
  return { ...biped,
    triangleCount:triangleCount(biped.group),
    sourceBlueprint:'knowledge.blueprint-biped-walker r4',
    rigType:'procedural joint hierarchy (not skinned bones)',
    animations:['walk via original 3Dviz biped-walker.animate(dt)', 'idle pose hold'],
    assetLicense:'original styling + MIT skill source'
  };
}
