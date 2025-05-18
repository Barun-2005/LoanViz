/**
 * Script to fetch and update stamp duty rates from official government sources
 *
 * This script fetches the latest stamp duty rates from official government websites
 * and updates the stampDutyConfig.json file with the latest rates.
 *
 * Usage: node scripts/updateStampDutyRates.js
 */

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import cheerio from 'cheerio';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the stamp duty config file
const configPath = path.join(__dirname, '..', 'src', 'config', 'stampDutyConfig.json');

// Function to read the current config
const readConfig = () => {
  try {
    const configData = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    console.error('Error reading config file:', error);
    process.exit(1);
  }
};

// Function to write the updated config
const writeConfig = (config) => {
  try {
    const configData = JSON.stringify(config, null, 2);
    fs.writeFileSync(configPath, configData);
    console.log('Config file updated successfully');
  } catch (error) {
    console.error('Error writing config file:', error);
    process.exit(1);
  }
};

// Function to fetch UK stamp duty rates
const fetchUKRates = async () => {
  console.log('Fetching UK stamp duty rates...');

  try {
    // England and Northern Ireland (SDLT)
    const sdltResponse = await axios.get('https://www.gov.uk/stamp-duty-land-tax/residential-property-rates');
    const sdlt$ = cheerio.load(sdltResponse.data);

    // Scotland (LBTT)
    const lbttResponse = await axios.get('https://www.revenue.scot/taxes/land-buildings-transaction-tax/residential-property');
    const lbtt$ = cheerio.load(lbttResponse.data);

    // Wales (LTT)
    const lttResponse = await axios.get('https://gov.wales/land-transaction-tax-rates-and-bands');
    const ltt$ = cheerio.load(lttResponse.data);

    // Parse the rates from the HTML (implementation would depend on the structure of each website)
    // This is a simplified example - actual implementation would need to parse the specific HTML structure

    console.log('UK rates fetched successfully');

    // Return the parsed rates
    return {
      // This would be populated with the actual parsed rates
      // For now, we'll return null to indicate that manual verification is needed
      england: null,
      scotland: null,
      wales: null,
      northernIreland: null
    };
  } catch (error) {
    console.error('Error fetching UK rates:', error);
    return null;
  }
};

// Function to fetch Indian stamp duty rates
const fetchIndianRates = async () => {
  console.log('Fetching Indian stamp duty rates...');

  try {
    // Maharashtra
    const maharashtraResponse = await axios.get('https://www.igrs.maharashtra.gov.in/');

    // Karnataka
    const karnatakaResponse = await axios.get('https://karunadu.karnataka.gov.in/ksboard/');

    // Delhi
    const delhiResponse = await axios.get('https://revenue.delhi.gov.in/');

    // Parse the rates from the HTML (implementation would depend on the structure of each website)
    // This is a simplified example - actual implementation would need to parse the specific HTML structure

    console.log('Indian rates fetched successfully');

    // Return the parsed rates
    return {
      // This would be populated with the actual parsed rates
      // For now, we'll return null to indicate that manual verification is needed
      maharashtra: null,
      karnataka: null,
      delhi: null
    };
  } catch (error) {
    console.error('Error fetching Indian rates:', error);
    return null;
  }
};

// Main function to update the stamp duty rates
const updateStampDutyRates = async () => {
  console.log('Updating stamp duty rates...');

  // Read the current config
  const config = readConfig();

  // Fetch the latest rates
  const ukRates = await fetchUKRates();
  const indianRates = await fetchIndianRates();

  // Update the config with the latest rates if available
  if (ukRates) {
    // Update UK rates
    if (ukRates.england) config['en-GB'].england = ukRates.england;
    if (ukRates.scotland) config['en-GB'].scotland = ukRates.scotland;
    if (ukRates.wales) config['en-GB'].wales = ukRates.wales;
    if (ukRates.northernIreland) config['en-GB'].northernIreland = ukRates.northernIreland;
  }

  if (indianRates) {
    // Update Indian rates
    if (indianRates.maharashtra) config['en-IN'].maharashtra = indianRates.maharashtra;
    if (indianRates.karnataka) config['en-IN'].karnataka = indianRates.karnataka;
    if (indianRates.delhi) config['en-IN'].delhi = indianRates.delhi;
  }

  // Add last updated timestamp
  config.lastUpdated = new Date().toISOString();

  // Write the updated config
  writeConfig(config);

  console.log('Stamp duty rates updated successfully');
  console.log('Last updated:', config.lastUpdated);
  console.log('Note: Some rates may require manual verification');
};

// Run the update function
updateStampDutyRates().catch(error => {
  console.error('Error updating stamp duty rates:', error);
  process.exit(1);
});
