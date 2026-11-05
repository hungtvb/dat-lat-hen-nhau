import {test,expect} from '@playwright/test';

/** Real Colyseus room + WebGL frames from GitHub CI Chromium.
 * Headless software renderer images are NOT physical-GPU or human art approval.
 */
test('D2-A1 SHOT-01 draws real lakeside canvas at two desktop sizes',async ({page},testInfo)=>{
  const errors:string[]=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/');
  await page.locator('#nickname').fill('Người Ngắm Hồ');
  await page.locator('#join-button').click();
  await expect(page.locator('#world')).toBeVisible({timeout:20000});
  const canvas=page.locator('#viewport canvas');
  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveAttribute('data-scene','D2A1-SHOT01');
  await page.waitForTimeout(450);
  const metrics=await canvas.evaluate(node=>{
    const el=node as HTMLCanvasElement;
    const gl=el.getContext('webgl2');
    return {width:el.width,height:el.height,
      renderer:gl?.getParameter(gl.RENDERER) ?? 'unavailable',
      devicePixelRatio:window.devicePixelRatio};
  });
  expect(metrics.width).toBeGreaterThanOrEqual(1440);
  expect(metrics.height).toBeGreaterThanOrEqual(900);
  const large=await canvas.screenshot();
  expect(large.byteLength).toBeGreaterThan(10000);
  await testInfo.attach('D2A1-SHOT01-canvas-1440x900.png',{body:large,contentType:'image/png'});
  await testInfo.attach('D2A1-renderer.json',{body:JSON.stringify(metrics,null,2),contentType:'application/json'});
  await page.setViewportSize({width:1280,height:720});
  await page.waitForTimeout(150);
  const small=await canvas.screenshot();
  expect(small.byteLength).toBeGreaterThan(10000);
  await testInfo.attach('D2A1-SHOT01-canvas-1280x720.png',{body:small,contentType:'image/png'});
  expect(errors).toEqual([]);
});
