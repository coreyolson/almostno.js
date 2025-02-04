// -------------------------------------------
// Build Script for AnJS
// -------------------------------------------

// Dependencies
import esbuild from 'esbuild';
import fs from 'fs';
import zlib from 'zlib';

// -------------------------------------------
// Build Configuration
// -------------------------------------------

/**
 * Build options for esbuild
 */
const buildOptions = {

    // Entry point for the build
    entryPoints: ['./src/index.js'],

    // Bundle all dependencies into a single file
    bundle: true,

    // Disable source maps for production
    sourcemap: false,

    // Target modern browsers
    target: ['es2020'],
};

// -------------------------------------------
// File Size Utility
// -------------------------------------------

/**
 * Get file size and gzipped size
 * 
 * @param {string} filePath - Path to file.
 * @returns {string} - File size info in KB.
 */
function getFileSize(filePath) {

    // Read the file content
    const file = fs.readFileSync(filePath);

    // Calculate uncompressed size (KB)
    const size = (file.length / 1024).toFixed(2);

    // Calculate gzipped size (KB)
    const gzipped = (zlib.gzipSync(file).length / 1024).toFixed(2);

    // Return formatted size information
    return `📂 ${filePath} - ${size} KB (gzipped: ${gzipped} KB)`;
}

// -------------------------------------------
// Build Function
// -------------------------------------------

/**
 * Run esbuild to generate a JavaScript bundle.
 * 
 * @param {string} outfile - The output file path.
 * @param {boolean} minify - Whether to minify the output.
 */
function build(outfile, minify) {

    // Get the current year
    const year = new Date().getFullYear();

    // Get the package version
    const { version } = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

    // Execute the build process
    esbuild.build({ ...buildOptions, outfile, minify, banner: { js: `/* AlmostNo.js v${version} */` } })

        // On success, log the file size
        .then(() => console.log(`✅`, getFileSize(outfile)))

        // On failure, exit process with error code
        .catch(() => process.exit(1));
}

// -------------------------------------------
// Execute Builds
// -------------------------------------------

// Build unminified version
build('./dist/almostno.js', false);

// Build minified version
build('./dist/almostno.min.js', true);