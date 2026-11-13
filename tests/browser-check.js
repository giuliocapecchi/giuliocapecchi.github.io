// Run against the static export on :4174 with:
// playwright-cli cli -s=giulio-perf run-code --filename=tests/browser-check.js
async page => {
  const results = [];
  const check = (condition, message) => { if (!condition) throw new Error(message); };
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const fixture = Array.from({ length: 9 }, (_, i) => ({
    id: i, name: `project-${i}`, html_url: `https://github.com/giuliocapecchi/project-${i}`,
    description: 'A project with enough description text to exercise card wrapping on narrow screens.',
    created_at: `2026-10-${String(20 - i).padStart(2, '0')}T00:00:00Z`,
  }));
  let mode = 'success';
  await page.unrouteAll({ behavior: 'wait' });
  await page.route('https://api.github.com/users/giuliocapecchi/repos*', async route => {
    if (mode === 'timeout') { await new Promise(resolve => setTimeout(resolve, 8500)); await route.abort().catch(() => {}); return; }
    if (mode === 'error') return route.fulfill({ status: 403, json: { message: 'rate limit' } });
    if (mode === 'malformed') return route.fulfill({ json: { message: 'unexpected response' } });
    return route.fulfill({ json: mode === 'empty' ? [] : fixture });
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:4174/');
  await page.getByText('1 / 3', { exact: true }).waitFor();
  check(await page.getByRole('button', { name: 'Previous page' }).isDisabled(), 'First page goes backwards');
  await page.getByRole('button', { name: 'Next page' }).click();
  await page.getByText('2 / 3', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Next page' }).click();
  await page.getByRole('link', { name: /project-8/ }).waitFor();
  check(await page.getByRole('button', { name: 'Next page' }).isDisabled(), 'Last page advances');
  await page.getByRole('button', { name: 'Previous page' }).click();
  await page.getByText('2 / 3', { exact: true }).waitFor();
  results.push('Desktop pagination: first, next, last, previous and disabled boundaries');

  await page.setViewportSize({ width: 375, height: 667 });
  await page.getByRole('button', { name: 'Show portfolio' }).click();
  await page.getByText('1 / 3', { exact: true }).waitFor();
  check(await page.locator('.project-card').count() === 3, 'Narrow viewport page size');
  await page.getByRole('button', { name: 'Show about' }).click();
  await page.getByRole('heading', { name: 'Giulio Capecchi' }).waitFor();
  results.push('Mobile about/portfolio navigation and pagination reset after resize');

  for (const size of [{width:320,height:568}, {width:768,height:300}, {width:768,height:400}, {width:1440,height:900}]) {
    await page.setViewportSize(size);
    await page.getByRole('region', { name: 'About me' }).evaluate(el => { el.scrollTop = 0; });
    const box = await page.locator('.profile-photo').boundingBox();
    const panel = await page.getByRole('region', { name: 'About me' }).boundingBox();
    check(box && panel && box.y >= panel.y, `Profile clipped at ${size.width}×${size.height}`);
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Horizontal overflow');
    await page.getByRole('link', { name: 'CV', exact:true }).scrollIntoViewIfNeeded();
    check(await page.getByRole('link', { name: 'CV', exact:true }).isVisible(), 'CV unreachable');
  }
  results.push('Layout: 320×568, 375×667, 768×300, 768×400 and 1440×900');

  await page.getByRole('button', { name: 'Show background controls' }).click();
  for (const scene of ['Blizzard', 'Neurons', 'Lair', 'Still']) {
    await page.getByLabel('Background', { exact:true }).selectOption(scene);
    await page.waitForFunction(expected => document.querySelectorAll('canvas').length === expected, scene === 'Still' ? 0 : 1);
    if (scene !== 'Still') {
      await page.getByLabel('Speed', { exact:true }).fill('0.7');
      check(await page.getByLabel('Speed', { exact:true }).inputValue() === '0.7', 'Speed not updated');
    }
  }
  await page.getByLabel('Background', { exact:true }).focus();
  await page.keyboard.press('Escape');
  check(await page.getByLabel('Background', { exact:true }).count() === 0, 'Collapsed controls remain focusable');
  check(await page.getByRole('button', { name:'Show background controls' }).evaluate(el => el === document.activeElement), 'Escape loses focus');
  results.push('All 3 WebGL scenes, speed control, Still mode, Escape and collapsed-control focus');

  for (const failure of ['error', 'malformed', 'timeout']) {
    mode = failure;
    await page.reload();
    await page.getByRole('heading', { name:'Giulio Capecchi' }).waitFor();
    await page.getByRole('button', { name:'Try again' }).waitFor({timeout:12000});
    mode = 'success';
    await page.getByRole('button', { name:'Try again' }).click();
    await page.getByText('1 / 3', { exact:true }).waitFor();
  }
  results.push('HTTP 403, malformed response and 8-second timeout recover through Retry');
  mode = 'empty';
  await page.reload();
  await page.getByText('No public projects to show yet.').waitFor();
  check(await page.getByRole('navigation', {name:'Project pages'}).count() === 0, 'Empty state has page 1/0');
  results.push('Empty repository response without invalid pagination');

  const browser = page.context().browser();
  const reduced = await browser.newContext({ reducedMotion: 'reduce', viewport:{width:1440,height:900} });
  const quiet = await reduced.newPage();
  await quiet.route('https://api.github.com/**', route => route.fulfill({json:fixture}));
  await quiet.goto('http://127.0.0.1:4174/');
  await quiet.getByText('1 / 3', {exact:true}).waitFor();
  check(await quiet.locator('canvas').count() === 0, 'Reduced motion starts WebGL');
  await quiet.getByRole('button', {name:'Show background controls'}).click();
  check(await quiet.getByLabel('Background', {exact:true}).inputValue() === 'Still', 'Reduced motion choice');
  await reduced.close();
  results.push('Reduced motion defaults to Still without a WebGL canvas');

  const noJs = await browser.newContext({javaScriptEnabled:false,viewport:{width:375,height:667}});
  const staticPage = await noJs.newPage();
  await staticPage.goto('http://127.0.0.1:4174/');
  check(await staticPage.getByRole('heading', {name:'Giulio Capecchi'}).isVisible(), 'No-JS profile missing');
  check(await staticPage.getByRole('link', {name:'Email Giulio'}).isVisible(), 'No-JS contact missing');
  await noJs.close();
  results.push('Profile and contact links available without JavaScript');
  check(errors.length === 0, `Runtime errors: ${errors.join('; ')}`);
  mode = 'success';
  await page.reload();
  await page.getByText('1 / 3', {exact:true}).waitFor();
  return { passed: results, pageErrors: errors };
}
