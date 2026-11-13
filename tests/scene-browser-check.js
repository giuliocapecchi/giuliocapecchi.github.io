// Run with playwright-cli cli -s=giulio-perf run-code --filename=tests/scene-browser-check.js
async page => {
  const browser = page.context().browser();
  const check = (condition, message) => { if (!condition) throw new Error(message); };
  const passed = [];
  for (const mode of ['no-webgl', 'save-data']) {
    const context = await browser.newContext();
    const tab = await context.newPage();
    const errors = [];
    tab.on('pageerror', error => errors.push(error.message));
    await tab.addInitScript(mode => {
      if (mode === 'save-data') Object.defineProperty(navigator, 'connection', { value:{ saveData:true }, configurable:true });
      else {
        const original = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function(type, ...args) {
          if (type.includes('webgl')) return null;
          return original.call(this, type, ...args);
        };
      }
    }, mode);
    await tab.route('https://api.github.com/**', route => route.fulfill({json:[]}));
    await tab.goto('http://127.0.0.1:4174/');
    await tab.getByText('No public projects to show yet.').waitFor();
    await tab.getByRole('button', {name:'Show background controls'}).click();
    if(mode === 'save-data') check(await tab.getByLabel('Background',{exact:true}).inputValue() === 'Still', 'Save-Data starts animation');
    await tab.getByRole('heading', {name:'Giulio Capecchi'}).waitFor();
    check(await tab.locator('canvas').count() === 0, `${mode} leaves a canvas`);
    check(errors.length === 0, errors.join('; '));
    await context.close();
    passed.push(`${mode}: profile available, zero canvases and zero page errors`);
  }
  const context = await browser.newContext();
  const tab = await context.newPage();
  const errors = [];
  tab.on('pageerror', error => errors.push(error.message));
  await tab.route('https://api.github.com/**', route => route.fulfill({json:[]}));
  let releaseModel;
  const gate = new Promise(resolve => { releaseModel = resolve; });
  let modelRequested;
  const requested = new Promise(resolve => { modelRequested = resolve; });
  await tab.route('**/models/neuron.gltf', async route => {
    const response = await route.fetch();
    modelRequested();
    await gate;
    await route.fulfill({response});
  });
  await tab.goto('http://127.0.0.1:4174/');
  await tab.getByRole('button', {name:'Show background controls'}).click();
  await tab.getByLabel('Background',{exact:true}).selectOption('Neurons');
  await requested;
  await tab.getByLabel('Background',{exact:true}).selectOption('Still');
  const response = tab.waitForResponse('**/models/neuron.gltf');
  releaseModel();
  await response;
  // Allow the asynchronous GLTF parser to finish after the component has unmounted.
  await tab.waitForTimeout(1000);
  check(await tab.locator('canvas').count() === 0, 'Late model load reattaches canvas');
  check(errors.length === 0, errors.join('; '));
  await context.close();
  passed.push('Switching to Still during a pending neuron model load stays stopped without page errors');
  return {passed};
}
