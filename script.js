// Base Constants
const BASE_ZIP_CODE = 76058;  // Fort Worth Base
const UPSTAIRS_FEE = 75;      // 100% directly to climber
const EXTRA_MILE_RATE = 2.50; // Per mile over included radius

// Tiered Baseline Pricing Scale (1 to 7 Windows)
const SMALL_JOB_TIERS = {
    1: 1400,
    2: 2600,
    3: 3750,
    4: 4800,
    5: 5750,
    6: 6600,
    7: 7350
};

// Master Update Function when Total Window Slider Moves
function updateCalculator() {
    // Step 2 Fix: Force integer parsing with parseInt(..., 10)
    const totalWindows = parseInt(document.getElementById('windowQuantity').value, 10) || 1;
    document.getElementById('windowQtyDisplay').innerText = totalWindows;

    const hasSecondStory = document.getElementById('hasSecondStory').checked;
    const upstairsInput = document.getElementById('upstairsCount');

    // Dynamically update upper limit of second story slider to match total windows
    if (hasSecondStory) {
        upstairsInput.max = totalWindows;
        if (parseInt(upstairsInput.value, 10) > totalWindows) {
            upstairsInput.value = totalWindows;
        }
        document.getElementById('upstairsDisplay').innerText = upstairsInput.value;
    }

    calculateEstimate();
}

// Reveal/Hide Second Story Slider
function toggleUpstairsSlider() {
    const isChecked = document.getElementById('hasSecondStory').checked;
    const upstairsContainer = document.getElementById('upstairsContainer');

    if (isChecked) {
        upstairsContainer.style.display = 'block';
    } else {
        upstairsContainer.style.display = 'none';
        document.getElementById('upstairsCount').value = 0;
    }

    updateCalculator();
}

// Core Math & Price Renderer
function calculateEstimate() {
    // Step 2 Fix: Force integer parsing with parseInt(..., 10)
    const totalWindows = parseInt(document.getElementById('windowQuantity').value, 10) || 1;
    const isChecked = document.getElementById('hasSecondStory').checked;
    const upstairsWindows = isChecked ? (parseInt(document.getElementById('upstairsCount').value, 10) || 0) : 0;
    const zipVal = document.getElementById('zipCode').value.trim();

    if (isChecked) {
        document.getElementById('upstairsDisplay').innerText = upstairsWindows;
    }

    // 1. Calculate Base Window Package Cost
    let basePrice = 0;
    if (totalWindows <= 7) {
        basePrice = SMALL_JOB_TIERS[totalWindows];
    } else {
        basePrice = totalWindows * 1000; // Standard $1,000/window average for 8+
    }

    // 2. Second Story Access Fee ($75/window to climber)
    let climberPay = upstairsWindows * UPSTAIRS_FEE;

    // 3. Dynamic Service Radius Calculation
    let freeRadius = 15;
    if (totalWindows >= 6) {
        freeRadius = 60;
    } else if (totalWindows >= 3) {
        freeRadius = 35;
    }

    // 4. Distance Calculation via ZIP Proximity
    let travelCost = 0;
    let noteText = `Includes standard installation, trim, caulk, and haul-away (${freeRadius} mi free travel included).`;

    if (zipVal.length === 5 && !isNaN(zipVal)) {
        let zipDelta = Math.abs(parseInt(zipVal, 10) - BASE_ZIP_CODE);
        let estimatedMiles = Math.min(Math.max(Math.round(zipDelta * 0.4), 5), 75);

        if (estimatedMiles > freeRadius) {
            let extraMiles = estimatedMiles - freeRadius;
            travelCost = extraMiles * EXTRA_MILE_RATE;
            noteText = `Rough estimate. Includes $${travelCost.toFixed(2)} travel rate (~${estimatedMiles} mi trip). Final price confirmed after supplier quote.`;
        } else {
            noteText = `Rough estimate. Job is within your ${freeRadius}-mile free service radius! Final price confirmed after supplier quote.`;
        }
    }

    // 5. Grand Total Calculation
    let grandTotal = basePrice + climberPay + travelCost;
    let formattedTotal = `$${grandTotal.toLocaleString()}`;

    // 6. Update Screen UI
    document.getElementById('priceOutput').innerText = formattedTotal;
    document.getElementById('distanceNote').innerText = noteText;

    // 7. Sync values into hidden inputs for Web3Forms email sending
    document.getElementById('hiddenTotalWindows').value = totalWindows;
    document.getElementById('hiddenUpstairsWindows').value = upstairsWindows;
    document.getElementById('hiddenEstimatedPrice').value = formattedTotal;
    document.getElementById('hiddenTravelDetails').value = noteText;
}