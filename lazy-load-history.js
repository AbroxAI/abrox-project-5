// ===============================================
// Realism Engine Loader v32.0 — Full Simulation
// ===============================================
(function(){
"use strict";

// Check if the engine is already loaded
if(window.realism && window.realism.loaded){
    console.log("✅ Realism engine already loaded.");
    return;
}

// Mark engine as loaded
window.realism = window.realism || {};
window.realism.loaded = true;

// =====================================================
// Inject the full realism engine script
// =====================================================
const engineScript = document.createElement("script");
engineScript.type = "text/javascript";
engineScript.textContent = `
// ===============================================
// realism-engine-v32.0-full.js contents start
// ===============================================
// Paste the entire v32.0 engine JS you have here
// (Everything from your last code block, starting with (function(){ "use strict"; ... })();
// ===============================================
// realism-engine-v32.0-full.js contents end
// ===============================================
`;
document.head.appendChild(engineScript);

// =====================================================
// Loader feedback
// =====================================================
console.log("🔹 Realism engine v32.0 loader injected. Waiting for page readiness...");

// =====================================================
// Wait for the engine to be ready and start init()
// =====================================================
async function waitForEngineReady(timeout = 30000){
    let waited = 0;
    while(!(window.realism && window.realism.init) && waited < timeout){
        await new Promise(r => setTimeout(r,50));
        waited += 50;
    }
    if(window.realism && window.realism.init){
        console.log("✅ Realism engine ready, initializing...");
        window.realism.init();
    } else {
        console.warn("⚠️ Realism engine did not load within timeout.");
    }
}

waitForEngineReady();

})();
