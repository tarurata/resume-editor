// Test script to verify skills migration works
const { migrateSkillsFormat } = require('./src/lib/validation.ts');

// Test old string[] format
const oldFormatSkills = [
    "JavaScript",
    "TypeScript", 
    "React",
    "Node.js"
];

console.log('Testing old format migration:');
console.log('Input:', oldFormatSkills);
console.log('Output:', migrateSkillsFormat(oldFormatSkills));

// Test new SkillSubsection[] format
const newFormatSkills = [
    {
        name: "Programming Languages",
        skills: ["JavaScript", "TypeScript", "Python"]
    },
    {
        name: "Frameworks",
        skills: ["React", "Node.js", "Express"]
    }
];

console.log('\nTesting new format (should remain unchanged):');
console.log('Input:', newFormatSkills);
console.log('Output:', migrateSkillsFormat(newFormatSkills));

// Test empty/null cases
console.log('\nTesting edge cases:');
console.log('Empty array:', migrateSkillsFormat([]));
console.log('Null:', migrateSkillsFormat(null));
console.log('Undefined:', migrateSkillsFormat(undefined));
