import './style.css';
import {normalizeGuestName, parseVariant, SIM_TICK_MS} from '@dalat/shared';
import {createRoom,joinRoom,inviteFromHash,inviteUrl,listenPlayers,type Invite,type SyncedPlayer} from './network/rooms';
import {World} from './game/World';
import type {Room} from '@colyseus/sdk';

const lobby=document.querySelector<HTMLElement>('#lobby')!;
const worldScreen=document.querySelector<HTMLElement>('#world')!;
const nickname=document.querySelector<HTMLInputElement>('#nickname')!;
const form=document.querySelector<HTMLFormElement>('#join-form')!;
const joinButton=document.querySelector<HTMLButtonElement>('#join-button')!;
const joinDesc=document.querySelector<HTMLElement>('#join-desc')!;
const inviteNote=document.querySelector<HTMLElement>('#invite-note')!;
const error=document.querySelector<HTMLElement>('#join-error')!;
const roster=document.querySelector<HTMLElement>('#player-list')!;
const roomStatus=document.querySelector<HTMLElement>('#room-status')!;
const status=document.querySelector<HTMLElement>('#invite-status')!;
const copy=document.querySelector<HTMLButtonElement>('#copy-invite')!;
const leave=document.querySelector<HTMLButtonElement>('#leave')!;
let room:Room|null=null;
let scene:World|null=null;
let stopInput:()=>void=()=>{};
let detachPlayers:()=>void=()=>{};
let currentInvite:Invite|null=inviteFromHash();
let pending=false;
const players=new Map<string,SyncedPlayer>();
if (import.meta.env.DEV) {
  (window as unknown as {__DALAT_DEBUG__: {players: () => Array<{id:string,x:number,z:number,name:string}>}}).__DALAT_DEBUG__ = {
    players: () => [...players].map(([id, player]) => ({id,x:player.x,z:player.z,name:player.name}))
  };
}

if(currentInvite){
  document.querySelector('#join-title')!.textContent='Bạn bè đang đợi.';
  joinDesc.textContent='Nhập tên, chọn màu áo rồi bước vào cùng mọi người.';
  joinButton.textContent='Vào gặp mọi người ↗';
  inviteNote.textContent='Link mời riêng đã được nhận. Chỉ chia sẻ với bạn bè.';
}

function report(message:string){error.hidden=false;error.textContent=message;}
function setPending(value:boolean){pending=value;joinButton.disabled=value;joinButton.textContent=value?'Đang chuẩn bị chỗ hẹn…':currentInvite?'Vào gặp mọi người ↗':'Tạo chỗ hẹn ↗';}

form.addEventListener('submit',async event=>{
  event.preventDefault();if(pending)return;
  error.hidden=true;
  const name=normalizeGuestName(nickname.value);
  const variant=parseVariant((form.querySelector<HTMLInputElement>('input[name=variant]:checked')?.value));
  if(!name||!variant){report('Kiểm tra tên và màu áo trước khi vào nhé.');return;}
  setPending(true);
  try{
    const invite=currentInvite??await createRoom();
    currentInvite=invite;
    history.replaceState(null,'',inviteUrl(invite));
    const connected=await joinRoom(invite,{name,variant});
    room=connected;
    await openRoom(connected);
  }catch(e){report(e instanceof Error?e.message:'Không kết nối được đến máy chủ.');setPending(false);}
});

async function openRoom(connected:Room){
  lobby.hidden=true;worldScreen.hidden=false;
  try{scene=new World(document.querySelector<HTMLElement>('#viewport')!);}catch(e){
    document.querySelector<HTMLElement>('#webgl-error')!.hidden=false;
    roomStatus.textContent='Không thể khởi tạo WebGL trên thiết bị này.';
  }
  scene?.setSelf(connected.sessionId);
  const renderRoster=()=>{
    roster.replaceChildren();
    const frag=document.createDocumentFragment();
    players.forEach((player,id)=>{
      const line=document.createElement('div');line.className='player-row';
      const dot=document.createElement('span');dot.className='player-dot '+(player.variant||'forest');
      const label=document.createElement('span');label.textContent=player.name+(id===connected.sessionId?' (bạn)':'');
      const connectedMark=document.createElement('span');connectedMark.className='player-connection';connectedMark.textContent=player.connected?'●':'○';
      line.append(dot,label,connectedMark);frag.appendChild(line);
    });
    roster.appendChild(frag);roomStatus.textContent=`${players.size}/6 người đang cùng phòng`;
  };
  detachPlayers=listenPlayers(connected,(id,p)=>{players.set(id,p);scene?.upsert(id,p);renderRoster();},(id,p)=>{players.set(id,p);scene?.upsert(id,p);renderRoster();},id=>{players.delete(id);scene?.remove(id);renderRoster();});
  connected.onDrop(()=>roomStatus.textContent='Đang nối lại kết nối…');
  connected.onReconnect(()=>roomStatus.textContent='Đã trở lại bên mọi người.');
  connected.onLeave(()=>{
    roomStatus.textContent='Kết nối đã kết thúc.';
    stopInput();
  });
  let seq=0;
  const timer=window.setInterval(()=>{
    const input=scene?.getInput()??{forward:0,strafe:0,heading:0};
    try { connected.send('moveInput',{seq:++seq,...input}); } catch { /* connection recovering; Colyseus handles reconnection */ }
  },SIM_TICK_MS);
  stopInput=()=>window.clearInterval(timer);
}
copy.addEventListener('click',async()=>{
  if(!currentInvite)return;
  const url=inviteUrl(currentInvite);
  try{await navigator.clipboard.writeText(url);status.textContent='Đã sao chép. Gửi cho hội bạn nhé!';}
  catch{status.textContent='Trình duyệt chặn clipboard. Hãy sao chép link trên thanh địa chỉ.';}
});
leave.addEventListener('click',async()=>{
  stopInput();detachPlayers();players.clear();scene?.dispose();scene=null;
  if(room){try{await room.leave();}catch{}room=null;}
  worldScreen.hidden=true;lobby.hidden=false;history.replaceState(null,'',location.pathname);currentInvite=null;
  document.querySelector('#join-title')!.textContent='Cùng đi dạo thôi.';
  joinDesc.textContent='Chọn một tên gọi, một màu áo khoác. Bạn có thể tạo phòng mới hoặc mở link bạn bè gửi.';
  inviteNote.textContent='Nếu có link mời, mở link đó để vào cùng phòng bạn.';
  setPending(false);
});
