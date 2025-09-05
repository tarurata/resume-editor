#!/usr/bin/env node

/**
 * Schema validation script for resume.json
 * Validates fixtures against the JSON schema
 */

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

// Load the schema
const schemaPath = path.join(__dirname, '../schemas/resume-schema.json');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

// Initialize AJV validator
const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schema);

// Test fixtures
const fixtures = [
    '../fixtures/sample-resume.json',
    '../fixtures/templates/ats-clean.json',
    '../fixtures/templates/compact.json'
];

console.log('🔍 Validating resume schema...\n');

let allValid = true;

fixtures.forEach(fixturePath => {
    const fullPath = path.join(__dirname, fixturePath);
    const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));

    const isValid = validate(data);

    if (isValid) {
        console.log(`✅ ${fixturePath} - Valid`);
    } else {
        console.log(`❌ ${fixturePath} - Invalid`);
        console.log('Errors:', JSON.stringify(validate.errors, null, 2));
        allValid = false;
    }
});

console.log('\n' + '='.repeat(50));
if (allValid) {
    console.log('🎉 All fixtures are valid against the schema!');
    process.exit(0);
} else {
    console.log('💥 Some fixtures failed validation. Please fix the errors above.');
    process.exit(1);
}