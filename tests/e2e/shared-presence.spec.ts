import {test,expect} from '@playwright/test';

/** Real room + two isolated browser contexts. Not a mocked network test. */
test('two friends share a room and see authoritative movement', async ({browser}) => {
  const contextA=await browser.newContext();
  const contextB=await browser.newContext();
  try {
    const a=await contextA.newPage(); const b=await contextB.newPage();
    await a.goto('/');
    await a.locator('#nickname').fill('Mây Nhỏ');
    await a.locator('#join-button').click();
    await expect(a.locator('#world')).toBeVisible();
    const invite=a.url();
    expect(invite).toContain('#room=');
    await b.goto(invite);
    await b.locator('#nickname').fill('Nắng Sớm');
    await b.locator('#join-button').click();
    await expect(b.locator('#world')).toBeVisible();
    await expect(a.locator('#player-list')).toContainText('Nắng Sớm');
    await expect(b.locator('#player-list')).toContainText('Mây Nhỏ');
    await expect(a.locator('#room-status')).toContainText('2/6');
    await expect(b.locator('#room-status')).toContainText('2/6');
    const before=await b.evaluate(() => (window as any).__DALAT_DEBUG__.players().find((p:any)=>p.name==='Mây Nhỏ')?.z);
    expect(typeof before).toBe('number');
    // Focus render canvas so keyboard controls are not captured by lobby fields.
    await a.locator('#viewport canvas').click();
    await a.keyboard.down('w'); await a.waitForTimeout(550); await a.keyboard.up('w');
    await expect.poll(async()=>b.evaluate(() => (window as any).__DALAT_DEBUG__.players().find((p:any)=>p.name==='Mây Nhỏ')?.z)).toBeLessThan(before-.15);
  } finally {await contextA.close();await contextB.close();}
});

test('an invalid invite token cannot enter an existing room', async ({browser}) => {
  const c1=await browser.newContext(); const c2=await browser.newContext();
  try {
    const a=await c1.newPage();const b=await c2.newPage();
    await a.goto('/');await a.locator('#nickname').fill('Người Mời');await a.locator('#join-button').click();
    await expect(a.locator('#world')).toBeVisible();
    const url=new URL(a.url());const query=new URLSearchParams(url.hash.slice(1));query.set('invite','x'.repeat(32));url.hash=query.toString();
    await b.goto(url.toString());await b.locator('#nickname').fill('Khách Lạ');await b.locator('#join-button').click();
    await expect(b.locator('#join-error')).toBeVisible();
    await expect(b.locator('#world')).toBeHidden();
    await expect(a.locator('#room-status')).toContainText('1/6');
  } finally {await c1.close();await c2.close();}
});

test('temporary network drop reconnects with the same avatar identity', async ({browser}) => {
  const contextA=await browser.newContext();
  const contextB=await browser.newContext();
  // Observe the real WebSocket used by the client without mocking Colyseus messages.
  await contextB.addInitScript(() => {
    const NativeSocket=window.WebSocket;
    const sockets: WebSocket[]=[];
    (window as any).__DALAT_TEST_SOCKETS__=sockets;
    window.WebSocket=class extends NativeSocket {
      constructor(url:string|URL, protocols?:string|string[]) {
        super(url, protocols);
        sockets.push(this);
      }
    } as typeof WebSocket;
  });
  try {
    const a=await contextA.newPage();
    const b=await contextB.newPage();
    await a.goto('/');
    await a.locator('#nickname').fill('Mây Nhỏ');
    await a.locator('#join-button').click();
    await expect(a.locator('#world')).toBeVisible();

    await b.goto(a.url());
    await b.locator('#nickname').fill('Nắng Sớm');
    await b.locator('#join-button').click();
    await expect(b.locator('#world')).toBeVisible();
    await expect(a.locator('#room-status')).toContainText('2/6');

    const identity=await a.evaluate(() =>
      (window as any).__DALAT_DEBUG__.players().find((p:any) => p.name === 'Nắng Sớm')?.id
    );
    expect(typeof identity).toBe('string');
    const connectionMark=a.locator('#player-list .player-row').filter({hasText:'Nắng Sớm'}).locator('.player-connection');
    await expect(connectionMark).toHaveText('●');

    // The SDK has a minimum uptime before automatic reconnect is enabled.
    // Chromium's setOffline() does not necessarily close existing WebSockets,
    // so explicitly end the actual browser transport with a non-consented code.
    await b.waitForTimeout(2500);
    await b.evaluate(() => {
      const sockets=(window as any).__DALAT_TEST_SOCKETS__ as WebSocket[];
      const active=sockets.findLast(socket => socket.readyState === WebSocket.OPEN);
      if (!active) throw new Error('No active Colyseus WebSocket to interrupt');
      active.close(4102, 'Temporary transport failure (E2E)');
    });
    await expect(connectionMark).toHaveText('○', {timeout: 12000});
    await expect(connectionMark).toHaveText('●', {timeout: 25000});

    await expect.poll(async () => a.evaluate(() => {
      const same=(window as any).__DALAT_DEBUG__.players().filter((p:any) => p.name === 'Nắng Sớm');
      return same.length === 1 ? same[0].id : null;
    })).toBe(identity);
    await expect(a.locator('#room-status')).toContainText('2/6');
  } finally {
    await contextA.close();
    await contextB.close();
  }
});
