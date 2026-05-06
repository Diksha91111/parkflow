const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\asoka\\.gemini\\antigravity\\brain\\8f26dcac-d91d-4ce4-a9b9-182ca3f69d3d';
const destDir = path.join(__dirname, 'public');

fs.copyFileSync(path.join(srcDir, 'media__1776263624843.jpg'), path.join(destDir, 'hero-bg-light.jpg'));
fs.copyFileSync(path.join(srcDir, 'media__1776263679291.jpg'), path.join(destDir, 'hero-bg-dark.jpg'));
console.log('Images copied successfully.');
