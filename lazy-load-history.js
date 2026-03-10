// realism-sync-loader-v1.js — Full sync loader for realism engine v28.2
(function(){
"use strict";

/* =====================================================
SYNC LOADER
Ensures historical data + pool + joiners are fully loaded
before starting live simulation
===================================================== */

async function waitForRealismReady(timeout=45000){
    let waited = 0;
    while((!window.realism || !window.identity?.getRandomPersona || !window.TGRenderer?.appendMessage) && waited < timeout){
        await new Promise(r => setTimeout(r, 50));
        waited += 50;
    }
    return !!window.realism && !!window.identity?.getRandomPersona && !!window.TGRenderer?.appendMessage;
}

async function preloadHistoricalMessages(){
    if(!window.realism || !window.realism.injectHistoricalPool) return;
    console.log("⏳ Injecting historical messages...");
    await window.realism.injectHistorical();
    console.log("✅ Historical messages injected!");
}

async function preloadPool(min=10000){
    if(!window.realism) return;
    console.log(`⏳ Ensuring message pool has at least ${min} items...`);
    window.realism.POOL.length = 0; // clear old pool
    if(window.realism.ensurePool) window.realism.ensurePool(min);
    console.log(`✅ Message pool ready: ${window.realism.POOL.length} items`);
}

async function startSimulation(){
    console.log("🚀 Starting live realism engine simulation...");
    if(window.realism.simulateJoiner) window.realism.simulateJoiner(45000,120000);
    if(window.realism.simulateCrowd) window.realism.simulateCrowd(120,150,600);
}

/* =====================================================
MAIN SYNC FUNCTION
===================================================== */
async function syncLoader(){
    const ready = await waitForRealismReady();
    if(!ready){
        console.error("❌ Realism engine did not become ready in time!");
        return;
    }

    await preloadHistoricalMessages();
    await preloadPool(10000);
    await startSimulation();

    console.log("✅ Realism engine fully loaded and running!");
}

/* =====================================================
START LOADER
===================================================== */
syncLoader();

})();
