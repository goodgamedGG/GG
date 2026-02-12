const { body, validationResult } = require('express-validator');

// Mock constants (based on backend/src/utils/constants.js)
const REGIONS = {
    GLOBAL: 'Global',
    EGYPT: 'Egypt',
    USA: 'USA',
    EU: 'EU',
    MENA: 'MENA',
    ASIA: 'Asia',
    MIDDLE_EAST: 'Middle East',
    EUROPE: 'Europe'
};

const PLATFORMS = {
    PC: 'PC',
    STEAM: 'Steam'
};

// Mock requests
const requests = [
    {
        name: 'Valid Request',
        body: {
            platform: 'PC',
            region: 'Middle East'
        }
    },
    {
        name: 'Invalid Region',
        body: {
            platform: 'PC',
            region: 'Mars'
        }
    },
    {
        name: 'Platform Case Sensitive?',
        body: {
            platform: 'pc', // Should fail if strict
            region: 'Global'
        }
    }
];

// Run validator
const run = async () => {
    console.log('Testing validators...');

    for (const req of requests) {
        // Replicate logic from validators.js
        const platformChain = body('platform').optional().trim().escape().isIn(Object.values(PLATFORMS)).withMessage('Invalid platform');
        const regionChain = body('region').optional().trim().escape().isIn(Object.values(REGIONS)).withMessage('Invalid region');

        await platformChain.run(req);
        await regionChain.run(req);

        const result = validationResult(req);
        if (result.isEmpty()) {
            console.log(`[${req.name}] Passed`);
        } else {
            console.log(`[${req.name}] Failed:`, JSON.stringify(result.array(), null, 2));
        }
    }
};

run();
