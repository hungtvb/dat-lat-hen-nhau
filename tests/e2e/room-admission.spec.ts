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
    await expect.poll(()=>Array.from((allowed!.state as any).players.values()).length).toBe(1);
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
