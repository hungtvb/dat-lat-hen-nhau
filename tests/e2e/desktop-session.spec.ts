import {test,expect} from '@playwright/test';

/** All actions run in a real browser attached to the real Colyseus server. */
test('voluntary leave releases the world and allows a fresh room in the same tab',async ({page})=>{
  await page.goto('/');
  await page.locator('#nickname').fill('Người Thử');
  await page.locator('#join-button').click();
  await expect(page.locator('#world')).toBeVisible();
  await expect(page.locator('#viewport canvas')).toHaveCount(1);
  const original=page.url();

  await page.locator('#leave').click();
  await expect(page.locator('#world')).toBeHidden();
  await expect(page.locator('#lobby')).toBeVisible();
  await expect(page.locator('#viewport canvas')).toHaveCount(0);
  await expect.poll(()=>new URL(page.url()).hash).toBe('');
  await expect(page.locator('#join-button')).toBeEnabled();
  await expect(page.locator('#join-button')).toContainText('Tạo chỗ hẹn');

  await page.locator('#join-button').click();
  await expect(page.locator('#world')).toBeVisible();
  await expect(page.locator('#viewport canvas')).toHaveCount(1);
  expect(page.url()).not.toBe(original);
});

test('terminal websocket close returns the player to a usable lobby',async ({browser})=>{
  const context=await browser.newContext();
  await context.addInitScript(()=>{
    const NativeSocket=window.WebSocket;
    const sockets:WebSocket[]=[];
    (window as any).__DALAT_TEST_SOCKETS__=sockets;
    window.WebSocket=class extends NativeSocket {
      constructor(url:string|URL,protocols?:string|string[]){
        super(url,protocols);sockets.push(this);
      }
    } as typeof WebSocket;
  });
  try{
    const page=await context.newPage();
    await page.goto('/');
    await page.locator('#nickname').fill('Người Mất Kết Nối');
    await page.locator('#join-button').click();
    await expect(page.locator('#world')).toBeVisible();
    await page.evaluate(()=>{
      const sockets=(window as any).__DALAT_TEST_SOCKETS__ as WebSocket[];
      const active=sockets.findLast(socket=>socket.readyState===WebSocket.OPEN);
      if(!active)throw new Error('No active transport');
      // A normal 1000 close must not enter the SDK 4010 reconnect grace.
      active.close(1000,'Terminal close from browser E2E');
    });
    await expect(page.locator('#lobby')).toBeVisible({timeout:15000});
    await expect(page.locator('#world')).toBeHidden();
    await expect(page.locator('#viewport canvas')).toHaveCount(0);
    await expect(page.locator('#join-error')).toContainText('Kết nối phòng đã kết thúc');
    await expect(page.locator('#join-button')).toBeEnabled();
    await expect.poll(()=>new URL(page.url()).hash).toBe('');

    await page.locator('#join-button').click();
    await expect(page.locator('#world')).toBeVisible({timeout:15000});
    await expect(page.locator('#viewport canvas')).toHaveCount(1);
  }finally{await context.close();}
});

test('WebGL initialization failure releases the joined room and shows a retry path',async ({browser})=>{
  const context=await browser.newContext();
  await context.addInitScript(()=>{
    const original=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=new Proxy(original,{
      apply(target,thisArg,args){
        if(['webgl2','webgl','experimental-webgl'].includes(String(args[0])))return null;
        return Reflect.apply(target,thisArg,args);
      }
    });
  });
  try{
    const page=await context.newPage();
    await page.goto('/');
    await page.locator('#nickname').fill('Không Có WebGL');
    await page.locator('#join-button').click();
    await expect(page.locator('#lobby')).toBeVisible({timeout:15000});
    await expect(page.locator('#world')).toBeHidden();
    await expect(page.locator('#join-error')).toContainText('Không thể khởi tạo WebGL');
    await expect(page.locator('#viewport canvas')).toHaveCount(0);
    await expect(page.locator('#join-button')).toBeEnabled();
    await expect.poll(()=>new URL(page.url()).hash).toBe('');
  }finally{await context.close();}
});
