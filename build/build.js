// 📦 Dependencies
import esbuild from 'esbuild';
import fs from 'fs';
import zlib from 'zlib';

/**
 * Retrieve the file size for reporting.
 *
 * @param {string} filePath - Path to the built file.
 * @returns {string} - File size report.
 */
function getFileSize(filePath) {

    // Read file content
    const file = fs.readFileSync(filePath);

    // Return formatted size (both raw & gzipped)
    return `📂 ${filePath} - ${(file.length / 1024).toFixed(2)} KB (gzipped: ${(zlib.gzipSync(file).length / 1024).toFixed(2)} KB)`;
}

// Variant Map: Defines Build Variants & Configurations
const VARIANTS = {

    // Core (Minimal, No Selection/State/Components)
    core: {
        name: "Core",
        entry: './src/prebuilt.js',
        outputBrowser: './dist/browser/almostno.js',
        outputCDN: './dist/cdn/almostno.min.js',
        format: "iife",
        defines: { selection: false, state: false, components: false, elements: false, animate: false },
        sourcemap: true 
    },

    // Extended (Filtering, Traversal, Animations)
    extended: {
        name: "Extended",
        entry: './src/prebuilt.js',
        outputBrowser: './dist/browser/almostno.extended.js',
        outputCDN: './dist/cdn/almostno.extended.min.js',
        format: "iife",
        defines: { selection: true, animate: true, state: false, components: false, elements: false },
        sourcemap: true
    },

    // Full (State, Components, Elements)
    full: {
        name: "Full",
        entry: './src/prebuilt.js',
        outputBrowser: './dist/browser/almostno.full.js',
        outputCDN: './dist/cdn/almostno.full.min.js',
        format: "iife",
        defines: { state: true, components: true, elements: false },
        sourcemap: true
    },

    // Core Module (ESM and CJS)
    coreESM: {
        name: "Core (ESM)",
        entry: './src/core.js',
        outputNPM: './dist/esm/core.module.js', // Updated to esm/
        format: "esm",
        defines: {},
        sourcemap: false
    },
    coreCJS: {
        name: "Core (CJS)",
        entry: './src/core.js',
        outputNPM: './dist/cjs/core.cjs.js', // Updated to cjs/
        format: "cjs",
        defines: {},
        sourcemap: false
    },

    // Extend Module (ESM and CJS)
    extendESM: {
        name: "Extend (ESM)",
        entry: './src/extend.js',
        outputNPM: './dist/esm/extend.module.js', // Updated to esm/
        format: "esm",
        defines: {},
        sourcemap: false
    },
    extendCJS: {
        name: "Extend (CJS)",
        entry: './src/extend.js',
        outputNPM: './dist/cjs/extend.cjs.js', // Updated to cjs/
        format: "cjs",
        defines: {},
        sourcemap: false
    },

    // Element Module (ESM and CJS)
    elementESM: {
        name: "Element (ESM)",
        entry: './src/element.js',
        outputNPM: './dist/esm/element.module.js', // Updated to esm/
        format: "esm",
        defines: {},
        sourcemap: false
    },
    elementCJS: {
        name: "Element (CJS)",
        entry: './src/element.js',
        outputNPM: './dist/cjs/element.cjs.js', // Updated to cjs/
        format: "cjs",
        defines: {},
        sourcemap: false
    },

    // Existing Full Library Builds
    esm: {
        name: "ESM",
        entry: './src/index.js',
        outputNPM: './dist/esm/almostno.module.js',
        format: "esm",
        defines: {},
        sourcemap: false
    },
    cjs: {
        name: "CommonJS",
        entry: './src/index.js',
        outputNPM: './dist/cjs/almostno.cjs.js',
        format: "cjs",
        defines: {},
        sourcemap: false
    },

    // Event Bus Module (ESM and CJS)
    eventsESM: {
        name: "Events (ESM)",
        entry: './src/events.js',
        outputNPM: './dist/esm/events.module.js',
        format: "esm",
        defines: {},
        sourcemap: false
    },
    eventsCJS: {
        name: "Events (CJS)",
        entry: './src/events.js',
        outputNPM: './dist/cjs/events.cjs.js',
        format: "cjs",
        defines: {},
        sourcemap: false
    },

    // HTTP Request Module (ESM and CJS)
    requestESM: {
        name: "Request (ESM)",
        entry: './src/request.js',
        outputNPM: './dist/esm/request.module.js',
        format: "esm",
        defines: {},
        sourcemap: false
    },
    requestCJS: {
        name: "Request (CJS)",
        entry: './src/request.js',
        outputNPM: './dist/cjs/request.cjs.js',
        format: "cjs",
        defines: {},
        sourcemap: false
    },

    // Utilities Module (ESM and CJS)
    utilitiesESM: {
        name: "Utilities (ESM)",
        entry: './src/utilities.js',
        outputNPM: './dist/esm/utilities.module.js',
        format: "esm",
        defines: {},
        sourcemap: false
    },
    utilitiesCJS: {
        name: "Utilities (CJS)",
        entry: './src/utilities.js',
        outputNPM: './dist/cjs/utilities.cjs.js',
        format: "cjs",
        defines: {},
        sourcemap: false
    }
};

/**
 * 🔨 Build Function (Handles Browser, CDN, and NPM Builds)
 *
 * @param {Object} variant - Build configuration object.
 */
function build(variant) {

    // Read package version
    const { version } = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

    // Base Configuration
    const config = {
        entryPoints: [variant.entry],
        bundle: true,
        target: ['es2020'],
        format: variant.format,
        define: Object.fromEntries(
            Object.entries(variant.defines).map(([key, value]) => [`FEATURE_${key.toUpperCase()}`, value ? "true" : "false"])
        ),
        banner: { js: `/* AlmostNo.js v${version} ${variant.name} */` },
        footer: variant.format === "iife" ? { js: `window.$ = $;` } : { js: `export { $ };` }
    };

    // Build Browser Version (Regular, Includes Source Maps)
    if (variant.outputBrowser) {
        esbuild.build({ ...config, outfile: variant.outputBrowser, minify: false, sourcemap: variant.sourcemap })
            .then(() => console.log(`✅`, getFileSize(variant.outputBrowser)))
            .catch(() => process.exit(1));
    }

    // Build CDN Version (Minified, No Source Maps)
    if (variant.outputCDN) {
        esbuild.build({ ...config, outfile: variant.outputCDN, minify: true, sourcemap: false })
            .then(() => console.log(`✅`, getFileSize(variant.outputCDN)))
            .catch(() => process.exit(1));
    }

    // Build NPM Version (ESM or CJS - Not Minified)
    if (variant.outputNPM) {
        esbuild.build({ ...config, outfile: variant.outputNPM, minify: false, sourcemap: false })
            .then(() => console.log(`✅`, getFileSize(variant.outputNPM)))
            .catch(() => process.exit(1));
    }
}

// Execute Builds for All Variants
Object.values(VARIANTS).forEach(build);