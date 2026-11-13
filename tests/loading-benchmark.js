// Serve the merge-base export on :4173 and the PR export on :4174.
// Same public repository snapshot and 3-second API delay for each of three cold contexts.
// playwright-cli cli -s=giulio-perf --raw run-code --filename=tests/loading-benchmark.js
async page => {
 const fixture = [{"id": 1237505636, "name": "sound-mcp", "description": "MCP client that lets your agents play notification sounds and show desktop toasts", "html_url": "https://github.com/giuliocapecchi/sound-mcp", "created_at": "2026-05-13T08:42:56Z"}, {"id": 1229313614, "name": "jisho-mcp", "description": "A lightweight Model Context Protocol (MCP) server for Jisho.org, the popular Japanese-English dictionary.", "html_url": "https://github.com/giuliocapecchi/jisho-mcp", "created_at": "2026-05-04T23:19:29Z"}, {"id": 993798683, "name": "legalbenchrag2beir", "description": "Scripts to convert the LegalBench-RAG dataset into the standard IR format", "html_url": "https://github.com/giuliocapecchi/legalbenchrag2beir", "created_at": "2025-05-31T14:48:56Z"}, {"id": 901421891, "name": "LLama-RAG", "description": "Chat with Your PDFs Using LLaMA 3.2 3B", "html_url": "https://github.com/giuliocapecchi/LLama-RAG", "created_at": "2024-12-10T16:19:39Z"}, {"id": 895249936, "name": "giuliocapecchi.github.io", "description": "Code for my github.io page", "html_url": "https://github.com/giuliocapecchi/giuliocapecchi.github.io", "created_at": "2024-11-27T21:02:11Z"}, {"id": 892540142, "name": "Vitis-HLS", "description": "Hardware-Level Synthesis (HLS) on FPGA devices for the forward pass of two basic neural networks", "html_url": "https://github.com/giuliocapecchi/Vitis-HLS", "created_at": "2024-11-22T10:01:06Z"}, {"id": 878400516, "name": "AulePi", "description": "Resource for available classrooms @unipi", "html_url": "https://github.com/giuliocapecchi/AulePi", "created_at": "2024-10-25T10:19:45Z"}, {"id": 875536672, "name": "IR_project", "description": "Simple search engine implementation for the MIRCV course", "html_url": "https://github.com/giuliocapecchi/IR_project", "created_at": "2024-10-20T08:45:28Z"}, {"id": 802567929, "name": "SonicRoutes_server", "description": "Simple Flask server for the SonicRoutes android application", "html_url": "https://github.com/giuliocapecchi/SonicRoutes_server", "created_at": "2024-05-18T16:56:12Z"}];
 const measurements = [];
 const browser = page.context().browser();
 for (const [label, port] of [['before',4173],['after',4174]]) {
  for(let run=0;run<3;run++) {
   const context = await browser.newContext({viewport:{width:1440,height:900}});
   const tab = await context.newPage();
   await tab.route('https://api.github.com/users/giuliocapecchi/repos*', async route => {
    await new Promise(resolve=>setTimeout(resolve,3000));
    await route.fulfill({json:fixture});
   });
   await tab.goto(`http://127.0.0.1:${port}/`, {waitUntil:'domcontentloaded'});
   await tab.waitForFunction(() => {
    let el = Array.from(document.querySelectorAll('h1,h2')).find(el=>el.textContent==='Giulio Capecchi');
    if(!el) return false;
    while(el) { if(getComputedStyle(el).opacity==='0') return false; el=el.parentElement; }
    return true;
   });
   const profileVisibleMs = await tab.evaluate(()=>Math.round(performance.now()));
   await tab.getByRole('link',{name:new RegExp(fixture[0].name)}).waitFor();
   await tab.evaluate(()=>document.fonts.ready);
   const assets=await tab.evaluate(()=>performance.getEntriesByType('resource').filter(r=>r.name.includes('.woff')||r.name.includes('pf_pic.')).map(r=>({path:new URL(r.name).pathname,bytes:r.encodedBodySize})));
   if(run===2) await tab.screenshot({path:`/tmp/giulio-${label==='before'?'prima':'dopo'}.png`});
   measurements.push({label,run,profileVisibleMs,assets});
   await context.close();
  }
 }
 return measurements;
}
