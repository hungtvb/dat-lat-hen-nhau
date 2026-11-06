import {mkdirSync,statSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {test,expect} from '@playwright/test';

test('3Dviz original biped: three actual WebGL views, procedural gait, GLB export',async({page})=>{
  test.setTimeout(60000);
  const errs:string[]=[];
  page.on('pageerror',e=>errs.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/character-poc.html');
  await page.waitForFunction(()=>Boolean((window as any).__characterProof),{timeout:15000});
  const base=await page.evaluate(()=>{
    const p=(window as any).__characterProof;
    return {source:p.source,triangles:p.triangles,rigType:p.rigType,
      renderer:p.renderer,canvasWidth:(document.querySelector('canvas') as HTMLCanvasElement).width};
  });
  expect(base.source).toBe('knowledge.blueprint-biped-walker r4');
  expect(base.triangles).toBeGreaterThan(1500);
  expect(base.canvasWidth).toBeGreaterThan(1000);
  mkdirSync('test-results/character-proof',{recursive:true});
  writeFileSync('test-results/character-proof/metadata.json',JSON.stringify(base,null,2));
  const frames:Buffer[]=[];
  for(const name of ['front','side','back']){
    await page.locator('#'+name).click();
    await page.waitForTimeout(230);
    const bytes=await page.screenshot({path:'test-results/character-proof/'+name+'.png'});
    frames.push(bytes);
  }
  const sha=(x:Buffer)=>createHash('sha256').update(x).digest('hex');
  expect(sha(frames[0])).not.toBe(sha(frames[2]));
  const before=await page.evaluate(()=>(window as any).__characterProof.phase as number);
  await page.locator('#walk').click();
  await page.waitForTimeout(800);
  const after=await page.evaluate(()=>(window as any).__characterProof.phase as number);
  expect(after).toBeGreaterThan(before);
  await page.screenshot({path:'test-results/character-proof/walk.png'});
  const downloadPromise=page.waitForEvent('download',{timeout:15000});
  await page.locator('#export').click();
  const download=await downloadPromise;
  await download.saveAs('test-results/character-proof/da-lat-nam02-3dviz-biped.glb');
  expect(statSync('test-results/character-proof/da-lat-nam02-3dviz-biped.glb').size).toBeGreaterThan(10000);
  expect(errs).toEqual([]);
});
