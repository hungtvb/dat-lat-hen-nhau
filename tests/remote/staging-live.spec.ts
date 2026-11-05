import {test,expect} from '@playwright/test';

const API=process.env.STAGING_API_ORIGIN;
if(!API || !/^https:\/\//.test(API)) throw new Error('STAGING_API_ORIGIN must be an HTTPS origin');

test('staging backend responds to HTTPS healthcheck',async ({request})=>{
  const result=await request.get(new URL('/health',API).toString());
  expect(result.status()).toBe(200);
  expect((await result.json()).ok).toBe(true);
});

test('foreign origin cannot create rooms on public staging API',async ({request})=>{
  const result=await request.post(new URL('/api/rooms',API).toString(),{
    headers:{Origin:'https://not-authorized.example.net'}
  });
  expect(result.status()).toBe(403);
});

test('two browsers can create, join and walk together over actual HTTPS/WSS',async ({browser})=>{
  const c1=await browser.newContext();
  const c2=await browser.newContext();
  const jsErrors:string[]=[];
  try {
    const a=await c1.newPage();
    const b=await c2.newPage();
    for(const page of [a,b])page.on('pageerror',e=>jsErrors.push(e.message));
    let remoteFrames=0;
    b.on('websocket',socket=>socket.on('framereceived',()=>remoteFrames++));
    await a.goto('/');
    await expect(a.locator('#join-button')).toBeVisible();
    await a.locator('#nickname').fill('Mây Nhỏ');
    await a.locator('#join-button').click();
    await expect(a.locator('#world')).toBeVisible({timeout:25000});
    await expect(a.locator('#viewport canvas')).toBeVisible({timeout:10000});
    const invite=a.url();
    expect(new URL(invite).hash).toContain('invite=');

    await b.goto(invite);
    await b.locator('#nickname').fill('Nắng Sớm');
    await b.locator('#join-button').click();
    await expect(b.locator('#world')).toBeVisible({timeout:25000});
    await expect(b.locator('#viewport canvas')).toBeVisible({timeout:10000});
    await expect(a.locator('#room-status')).toContainText('2/6',{timeout:15000});
    await expect(b.locator('#room-status')).toContainText('2/6',{timeout:15000});
    await expect(a.locator('#player-list')).toContainText('Nắng Sớm');
    await expect(b.locator('#player-list')).toContainText('Mây Nhỏ');

    await a.locator('#viewport canvas').click();
    const before=remoteFrames;
    await a.keyboard.down('w');
    await a.waitForTimeout(750);
    await a.keyboard.up('w');
    // A's authoritative walking movement produces real state patches to B.
    // This is transport evidence; visual position smoothing requires device QA.
    await expect.poll(()=>remoteFrames,{timeout:15000}).toBeGreaterThan(before+2);
    expect(jsErrors).toEqual([]);
  } finally {await Promise.allSettled([c1.close(),c2.close()]);}
});
