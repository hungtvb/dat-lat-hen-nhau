import {test, expect} from '@playwright/test';
import {Client, type Room} from '@colyseus/sdk';

// Uses real matchmaking + Colyseus WebSockets; no fake room-state or renderer.
// Keep the room invite out of console logs, test titles and screenshots.
const ORIGIN='http://127.0.0.1:2567';

async function createPrivateRoom(request: import('@playwright/test').APIRequestContext) {
  const response=await request.post(ORIGIN+'/api/rooms');
  expect(response.status()).toBe(201);
  const body=await response.json() as {roomId:string;invite:string};
  expect(body.roomId).toMatch(/^[A-Za-z0-9_-]{6,64}$/);
  expect(body.invite).toMatch(/^[A-Za-z0-9_-]{32,64}$/);
  return body;
}

test('direct joinById without invite token cannot enter a private room',async ({request}) => {
  const {roomId,invite}=await createPrivateRoom(request);
  const client=new Client(ORIGIN);
  let allowed:Room|undefined;
  try {
    await expect(client.joinById(roomId,{name:'Khách Không Mời',variant:'forest'}))
      .rejects.toThrow();
    // Denied attempt must not lock the room or occupy a player slot.
    allowed=await client.joinById(roomId,{invite,name:'Người Hợp Lệ',variant:'forest'});
    await expect.poll(()=>{const players=(allowed!.state as any)?.players;return players ? Array.from(players.values()).length : -1;}).toBe(1);
  } finally {
    await allowed?.leave();
  }
});

test('room admits six guests, rejects seventh, then frees a seat after leave',async ({request}) => {
  test.setTimeout(60000);
  const {roomId,invite}=await createPrivateRoom(request);
  const rooms:Room[]=[];
  try {
    for(let i=0;i<6;i++){
      const client=new Client(ORIGIN);
      const room=await client.joinById(roomId,{invite,name:`Khách ${i+1}`,variant:'forest'});
      rooms.push(room);
    }
    expect(rooms.map(room=>room.sessionId).filter(Boolean).length).toBe(6);
    await expect.poll(()=>Array.from((rooms[0].state as any).players.values()).length).toBe(6);
    await expect(new Client(ORIGIN).joinById(roomId,{invite,name:'Khách Thứ Bảy',variant:'sky'}))
      .rejects.toThrow();
    await expect.poll(()=>Array.from((rooms[0].state as any).players.values()).length).toBe(6);

    await rooms[5].leave();
    rooms.pop();
    await expect.poll(()=>Array.from((rooms[0].state as any).players.values()).length).toBe(5);
    const replacement=await new Client(ORIGIN).joinById(roomId,{invite,name:'Người Thay Thế',variant:'sky'});
    rooms.push(replacement);
    await expect.poll(()=>Array.from((rooms[0].state as any).players.values()).length).toBe(6);
  } finally {
    await Promise.allSettled(rooms.map(room=>room.leave()));
  }
});

test('replacement guest does not reuse an occupied spawn position',async ({request}) => {
  const {roomId,invite}=await createPrivateRoom(request);
  const rooms:Room[]=[];
  try {
    const join=async (name:string) => {
      const room=await new Client(ORIGIN).joinById(roomId,{invite,name,variant:'forest'});
      rooms.push(room);
      return room;
    };
    const a=await join('An Bình');
    const b=await join('Bình Yên');
    const c=await join('Cao Nguyên');
    const getPlayers=()=> (a.state as any)?.players;
    await expect.poll(()=>getPlayers()?.size ?? 0).toBe(3);
    await b.leave();
    rooms.splice(rooms.indexOf(b),1);
    await expect.poll(()=>getPlayers()?.size ?? 0).toBe(2);

    const d=await join('Đồi Thông');
    await expect.poll(()=>getPlayers()?.size ?? 0).toBe(3);
    const location=(id:string)=> {
      const player=getPlayers().get(id);
      return {x:player.x,z:player.z};
    };
    const replacement=location(d.sessionId);
    expect(replacement).not.toEqual(location(a.sessionId));
    expect(replacement).not.toEqual(location(c.sessionId));
  } finally {
    await Promise.allSettled(rooms.map(room=>room.leave()));
  }
});

test('host handoff skips disconnected guest during reconnect reservation',async ({request}) => {
  test.setTimeout(35000);
  const {roomId,invite}=await createPrivateRoom(request);
  const rooms:Room[]=[];
  try {
    const join=async (name:string) => {
      const room=await new Client(ORIGIN).joinById(roomId,{invite,name,variant:'forest'});
      rooms.push(room);
      return room;
    };
    const a=await join('Host An');
    const b=await join('Khách B');
    const c=await join('Khách C');
    const state=()=>c.state as any;
    await expect.poll(()=>state()?.players?.size ?? 0).toBe(3);
    await expect.poll(()=>state().hostPlayerId).toBe(a.sessionId);

    // Close before the SDK automatic reconnect minUptime, keeping B's
    // authoritative player record reserved via server.onDrop().
    b.connection.close(4010, 'Simulated network drop');
    rooms.splice(rooms.indexOf(b),1); // transport closed; don't call consented leave()
    await expect.poll(()=>state().players.get(b.sessionId)?.connected).toBe(false);
    await a.leave();
    rooms.splice(rooms.indexOf(a),1);
    await expect.poll(()=>state().hostPlayerId).toBe(c.sessionId);
  } finally {
    await Promise.allSettled(rooms.map(room=>room.leave()));
  }
});

test('expired reconnect reservation removes the ghost avatar after 45 seconds',async ({request}) => {
  test.setTimeout(80000);
  const {roomId,invite}=await createPrivateRoom(request);
  const a=await new Client(ORIGIN).joinById(roomId,{invite,name:'Người Ở Lại',variant:'forest'});
  let b:Room|undefined;
  try {
    b=await new Client(ORIGIN).joinById(roomId,{invite,name:'Người Mất Mạng',variant:'sky'});
    const players=()=>(a.state as any)?.players;
    await expect.poll(()=>players()?.size ?? 0).toBe(2);
    const disconnectedId=b.sessionId;

    // Drop before minUptime so Node SDK does not auto-reconnect; room must
    // reserve this session for its real 45-second production timeout.
    b.connection.close(4010, 'Simulated persistent transport outage');
    await expect.poll(()=>players()?.get(disconnectedId)?.connected).toBe(false);
    await expect.poll(()=>players()?.has(disconnectedId) ?? true, {timeout:65000}).toBe(false);
    await expect.poll(()=>players()?.size ?? 0).toBe(1);
  } finally {
    await a.leave();
    // B transport is intentionally closed; allowReconnection expiry removes it.
  }
});
