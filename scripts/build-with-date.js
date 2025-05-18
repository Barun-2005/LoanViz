/**
 * Script to build the application with a dynamic date stamp
 *
 * This script sets the REACT_APP_BUILD_DATE environment variable to the current date
 * in YYYY-MM-DD format before running the build command.
 *
 * Usage: node scripts/build-with-date.js
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get current date in YYYY-MM-DD format
const today = new Date();
const formattedDate = today.toISOString().split('T')[0];

console.log(`Setting build date to: ${formattedDate}`);

// Create or update .env file with build date
const envPath = path.join(__dirname, '..', '.env');
let envContent = '';

// Read existing .env file if it exists
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');

  // Replace existing VITE_BUILD_DATE line if it exists
  if (envContent.includes('VITE_BUILD_DATE=')) {
    envContent = envContent.replace(
      /VITE_BUILD_DATE=.*/,
      `VITE_BUILD_DATE=${formattedDate}`
    );
  } else {
    // Add new line if it doesn't exist
    envContent += `\nVITE_BUILD_DATE=${formattedDate}`;
  }
} else {
  // Create new .env file with build date
  envContent = `VITE_BUILD_DATE=${formattedDate}`;
}

// Write updated .env file
fs.writeFileSync(envPath, envContent);

console.log('.env file updated with build date');

// Run the build command
console.log('Starting build process...');

try {
  // Set the environment variable for the build date
  process.env.VITE_BUILD_DATE = formattedDate;

  // Run the build command
  execSync('npm run build', {
    stdio: 'inherit',
    env: process.env
  });

  console.log('Build completed successfully');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
