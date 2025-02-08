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

    // ESM Module (Tree-Shakable, For NPM)
    esm: {
        name: "ESM",
        entry: './src/index.js',
        outputNPM: './dist/npm/almostno.module.js',
        format: "esm",
        defines: {},
        sourcemap: false 
    },

    // CommonJS (For Node.js)
    cjs: {
        name: "CommonJS",
        entry: './src/index.js',
        outputNPM: './dist/npm/almostno.cjs.js',
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