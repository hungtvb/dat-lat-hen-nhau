import * as THREE from "three";
import type {AvatarVariant} from "@dalat/shared";
import type {SyncedPlayer} from "../network/rooms";

const VARIANT_COLORS: Record<AvatarVariant, number> = {berry:0xa64f58, forest:0x4b7063, sand:0xc4a984, sky:0x63879b};

type AvatarVisual = {group:THREE.Group; target:THREE.Vector3; variant:string; label:THREE.Sprite; cloth:THREE.MeshStandardMaterial};

function makeAvatar(player:SyncedPlayer):AvatarVisual {
  const group = new THREE.Group();
  const cloth = new THREE.MeshStandardMaterial({color: VARIANT_COLORS[player.variant as AvatarVariant] || VARIANT_COLORS.forest, roughness:0.85});
  const skin = new THREE.MeshStandardMaterial({color:0xe2bba0,roughness:0.88});
  const trouser = new THREE.MeshStandardMaterial({color:0x3c4d50,roughness:0.88});
  const coat = new THREE.Mesh(new THREE.CapsuleGeometry(.38,.72,5,9),cloth);coat.position.y=1.05;group.add(coat);
  const face = new THREE.Mesh(new THREE.SphereGeometry(.25,15,12),skin);face.position.y=1.95;group.add(face);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(.26,12,10),new THREE.MeshStandardMaterial({color:0x342925,roughness:1}));hair.scale.set(1,0.46,1);hair.position.y=2.14;group.add(hair);
  for(const dx of [-.18,.18]){
    const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.13,.55,4,7),trouser);leg.position.set(dx,.42,0);group.add(leg);
    const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.115,.48,4,7),cloth);arm.position.set(dx*2.65,1.13,0);group.add(arm);
  }
  const texture=labelTexture(player.name);
  const labelMaterial=new THREE.SpriteMaterial({map:texture,depthTest:false,transparent:true});
  const label=new THREE.Sprite(labelMaterial);label.scale.set(2.8,.63,1);label.position.y=2.9;group.add(label);
  group.position.set(player.x,0,player.z);
  return {group,target:new THREE.Vector3(player.x,0,player.z),variant:player.variant,label,cloth};
}

function labelTexture(name:string):THREE.CanvasTexture {
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=116;
  const ctx=canvas.getContext('2d')!;ctx.fillStyle='rgba(25,39,33,.82)';ctx.beginPath();ctx.roundRect(8,12,496,92,48);ctx.fill();
  ctx.fillStyle='#f6f1e5';ctx.font='600 36px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(name,256,61,465);
  return new THREE.CanvasTexture(canvas);
}

function makePine(scene:THREE.Scene,x:number,z:number,height:number) {
  const group = new THREE.Group();group.position.set(x,0,z);
  const bark=new THREE.Mesh(new THREE.CylinderGeometry(.11,.17,height*.57,7),new THREE.MeshStandardMaterial({color:0x78644c,roughness:1}));bark.position.y=height*.29;group.add(bark);
  const green=new THREE.MeshStandardMaterial({color:0x345d52,roughness:1});
  for(let j=0;j<3;j++) {const crown=new THREE.Mesh(new THREE.ConeGeometry(.7 +j*.19,height*.55,8),green);crown.position.y=height*.65 + (.48-j*.17);group.add(crown);}
  scene.add(group);
}

/** Neutral art-spike world. Not the approved final Xuân Hương visual proof. */
export class World {
  readonly renderer:THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(56,1,.1,160);
  private readonly avatars=new Map<string,AvatarVisual>();
  private readonly keys=new Set<string>();
  private selfId='';private stopped=false;private raf=0;private yaw=0;
  private width=1;private height=1;
  private dragFromX: number|null=null;
  private resizeObserver:ResizeObserver;
  constructor(private container:HTMLElement) {
    this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    this.renderer.shadowMap.enabled=false;
    this.renderer.outputColorSpace=THREE.SRGBColorSpace;
    this.container.appendChild(this.renderer.domElement);
    this.scene.background=new THREE.Color(0xa5c9c3);
    this.scene.fog=new THREE.Fog(0xa5c9c3,33,82);
    this.scene.add(new THREE.HemisphereLight(0xece6cf,0x5f7562,2.5));
    const light=new THREE.DirectionalLight(0xffe6b4,2.2);light.position.set(-10,22,12);this.scene.add(light);
    const ground=new THREE.Mesh(new THREE.PlaneGeometry(120,120),new THREE.MeshStandardMaterial({color:0x69877a,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-.03;this.scene.add(ground);
    const path=new THREE.Mesh(new THREE.PlaneGeometry(11,45),new THREE.MeshStandardMaterial({color:0xc0b6a0,roughness:1}));path.rotation.x=-Math.PI/2;path.position.set(0,0.006,0);this.scene.add(path);
    const lake=new THREE.Mesh(new THREE.CircleGeometry(22,64),new THREE.MeshStandardMaterial({color:0x5e9aa1,metalness:.1,roughness:.38}));lake.rotation.x=-Math.PI/2;lake.position.set(-34,0.01,-1);lake.scale.y=1.5;this.scene.add(lake);
    for(let i=0;i<19;i++){const x=i%2===0?8+(i%3)*1.8:-9-(i%3)*1.5;const z=-21+i*2.2;makePine(this.scene,x,z,4+(i%4)*1.3)}
    this.camera.position.set(10,8,13);this.camera.lookAt(0,1,0);
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(container);this.resize();
    window.addEventListener('keydown',this.onKeyDown);window.addEventListener('keyup',this.onKeyUp);window.addEventListener('blur',this.clearKeys);
    this.renderer.domElement.addEventListener('pointerdown',this.onPointerDown);window.addEventListener('pointermove',this.onPointerMove);window.addEventListener('pointerup',this.onPointerUp);
    this.update();
  }
  setSelf(id:string){this.selfId=id;}
  upsert(id:string,player:SyncedPlayer) {
    let a=this.avatars.get(id);
    if(!a){a=makeAvatar(player);this.avatars.set(id,a);this.scene.add(a.group);}
    if(a.variant!==player.variant){a.variant=player.variant;a.cloth.color.setHex(VARIANT_COLORS[player.variant as AvatarVariant]||VARIANT_COLORS.forest);}
    a.target.set(player.x,0,player.z);
    a.group.rotation.y=-player.heading;
    a.group.visible=player.connected;
  }
  remove(id:string) {
    const a=this.avatars.get(id);if(!a)return;
    this.scene.remove(a.group);
    const materials=new Set<THREE.Material>();
    a.group.traverse(obj=>{
      if(obj instanceof THREE.Mesh){
        obj.geometry.dispose();
        const owned=Array.isArray(obj.material)?obj.material:[obj.material];
        owned.forEach(material=>materials.add(material));
      }
    });
    materials.forEach(material=>material.dispose());
    const labelMaterial=a.label.material as THREE.SpriteMaterial;
    labelMaterial.map?.dispose();
    labelMaterial.dispose();
    this.avatars.delete(id);
  }
  getInput(){let f=0,s=0;if(this.keys.has('w')||this.keys.has('arrowup'))f+=1;if(this.keys.has('s')||this.keys.has('arrowdown'))f-=1;if(this.keys.has('a')||this.keys.has('arrowleft'))s-=1;if(this.keys.has('d')||this.keys.has('arrowright'))s+=1;return {forward:f,strafe:s,heading:this.yaw};}
  private activeInInput(){const e=document.activeElement;return e instanceof HTMLInputElement||e instanceof HTMLTextAreaElement||e instanceof HTMLButtonElement||e instanceof HTMLSelectElement;}
  private onKeyDown=(e:KeyboardEvent)=>{if(this.activeInInput())return;const k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k)){e.preventDefault();this.keys.add(k);}};
  private onKeyUp=(e:KeyboardEvent)=>{this.keys.delete(e.key.toLowerCase());};
  private clearKeys=()=>{this.keys.clear()};
  private onPointerDown=(e:PointerEvent)=>{this.dragFromX=e.clientX;};
  private onPointerMove=(e:PointerEvent)=>{if(this.dragFromX==null)return;this.yaw=Math.max(-Math.PI,Math.min(Math.PI,this.yaw+(e.clientX-this.dragFromX)*.008));this.dragFromX=e.clientX;};
  private onPointerUp=()=>{this.dragFromX=null;};
  private resize(){this.width=Math.max(1,this.container.clientWidth);this.height=Math.max(1,this.container.clientHeight);this.camera.aspect=this.width/this.height;this.camera.updateProjectionMatrix();this.renderer.setSize(this.width,this.height,false);}
  private update=()=>{
    if(this.stopped)return;
    this.avatars.forEach(a=>a.group.position.lerp(a.target,.18));
    const self=this.avatars.get(this.selfId);
    if(self){const p=self.group.position;const offset=new THREE.Vector3(Math.sin(this.yaw)*8,5.8,Math.cos(this.yaw)*8.4);const pos=p.clone().add(offset);this.camera.position.lerp(pos,.075);this.camera.lookAt(p.x,p.y+1.3,p.z);}
    this.renderer.render(this.scene,this.camera);
    this.raf=requestAnimationFrame(this.update);
  };
  dispose(){this.stopped=true;cancelAnimationFrame(this.raf);this.clearKeys();this.resizeObserver.disconnect();window.removeEventListener('keydown',this.onKeyDown);window.removeEventListener('keyup',this.onKeyUp);window.removeEventListener('blur',this.clearKeys);this.renderer.domElement.removeEventListener('pointerdown',this.onPointerDown);window.removeEventListener('pointermove',this.onPointerMove);window.removeEventListener('pointerup',this.onPointerUp);for(const id of [...this.avatars.keys()])this.remove(id);this.scene.traverse(obj=>{if(obj instanceof THREE.Mesh){obj.geometry.dispose();const mats=Array.isArray(obj.material)?obj.material:[obj.material];mats.forEach(m=>m.dispose());}});this.renderer.dispose();this.renderer.domElement.remove();}
}
