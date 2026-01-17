// scripts/generateStudentData.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- CONFIGURATION ---
const REGISTRATION_FILE = 'xpreppg.registrations.json';
const RESULT_FILE = 'Student_Wise_Report_All_Data.csv'; // NEW FILE
const OUTPUT_FILE = 'data/studentData.ts';
const TOTAL_STUDENTS_COHORT = 2278; // Fixed cohort size

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// --- HELPERS ---
function parseCSV(csvText) {
  const lines = csvText.split(/\r?\n/).filter(l => l.trim());
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    // Handle commas inside quotes if present (basic handler)
    const values = [];
    let currentVal = '';
    let inQuotes = false;
    for (let char of line) {
      if (char === '"') { inQuotes = !inQuotes; }
      else if (char === ',' && !inQuotes) { values.push(currentVal); currentVal = ''; }
      else { currentVal += char; }
    }
    values.push(currentVal);
    
    const row = {};
    headers.forEach((h, i) => row[h] = values[i]?.replace(/^"|"$/g, '').trim());
    return row;
  });
}

function generatePassword(name, mobile) {
  if (!name || !mobile) return "PASS1234";
  const namePart = name.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase();
  const mobilePart = mobile.toString().slice(-4);
  return `${namePart}${mobilePart}`;
}

// --- MAIN LOGIC ---
async function generate() {
  console.log("🚀 Starting Data Mapping (No Calculations)...");

  let registrations = [];
  let csvRows = [];

  try {
    const regContent = fs.readFileSync(path.join(rootDir, REGISTRATION_FILE), 'utf8');
    registrations = JSON.parse(regContent);
    const csvContent = fs.readFileSync(path.join(rootDir, RESULT_FILE), 'utf8');
    csvRows = parseCSV(csvContent);
    console.log(`📦 Loaded ${csvRows.length} rows from ${RESULT_FILE}`);
  } catch (e) {
    console.error("❌ Error reading files:", e.message);
    process.exit(1);
  }

  // 1. PROCESS CSV DATA
  const FINAL_RESULTS = {};

  csvRows.forEach(row => {
    const studentId = row['Student ID'];
    if (!studentId) return;

    // A. Parse Basic Stats
    const result = {
      rank: parseInt(row['Rank']) || 0,
      totalStudents: TOTAL_STUDENTS_COHORT,
      totalScore: parseInt(row['Total Score']) || 0,
      totalQs: parseInt(row['Total Qs']) || 200,
      attempted: parseInt(row['Attempted']) || 0,
      unattempted: parseInt(row['Unattempted']) || 0,
      correct: parseInt(row['Correct']) || 0,
      incorrect: parseInt(row['Incorrect']) || 0,
      accuracy: parseFloat(row['Overall Accuracy %']).toFixed(1),
      totalTime: row['Total Time (Formatted)'] || "0h 0m 0s",
      difficulty: [],
      tags: [],
      subjects: []
    };

    // B. Parse Difficulty (Dynamic Columns)
    ['EASY', 'MEDIUM', 'HARD'].forEach(diff => {
      result.difficulty.push({
        name: diff,
        accuracy: parseFloat(row[`Diff_${diff}_Accuracy`] || 0).toFixed(1),
        correct: parseInt(row[`Diff_${diff}_Correct`] || 0),
        total: parseInt(row[`Diff_${diff}_Total`] || 0)
      });
    });

    // C. Parse Tags (Dynamic Columns)
    ['Clinical Based', 'Image Based', 'One Liner'].forEach(tag => {
      result.tags.push({
        name: tag,
        accuracy: parseFloat(row[`Tag_${tag}_Accuracy`] || 0).toFixed(1),
        avgTime: parseFloat(row[`Tag_${tag}_AvgTime`] || 0).toFixed(1) + "s",
        correct: parseInt(row[`Tag_${tag}_Correct`] || 0),
        total: parseInt(row[`Tag_${tag}_Total`] || 0),
        totalTime: "-" // Not in CSV, placeholder
      });
    });

    // D. Parse Subjects (Dynamic Discovery)
    // Find all columns starting with "Sub_" and ending with "_Total" to identify subjects
    const subjectNames = Object.keys(row)
      .filter(k => k.startsWith('Sub_') && k.endsWith('_Total'))
      .map(k => k.replace('Sub_', '').replace('_Total', ''));

    subjectNames.forEach(subName => {
      // Clean up subject name (e.g. OBS_&_GNY -> Obs & Gyn) if needed, 
      // but keeping it raw is safer for matching unless you want specific formatting.
      // We will replace underscores with spaces for display.
      const displayName = subName.replace(/_+/g, ' ').trim();
      
      result.subjects.push({
        subject: displayName,
        totalQs: parseInt(row[`Sub_${subName}_Total`] || 0),
        score: parseInt(row[`Sub_${subName}_Score`] || 0),
        correct: Math.round((parseFloat(row[`Sub_${subName}_Accuracy`] || 0) / 100) * parseInt(row[`Sub_${subName}_Total`] || 0)), // Derive correct count from accuracy/total if missing, or specific col if exists
        accuracy: parseFloat(row[`Sub_${subName}_Accuracy`] || 0).toFixed(1),
        avgTime: "-", // Data not in CSV
        totalTime: "-" // Data not in CSV
      });
    });

    // Sort subjects by Score (High to Low) or any other metric preferred
    result.subjects.sort((a, b) => parseFloat(b.accuracy) - parseFloat(a.accuracy));

    FINAL_RESULTS[studentId] = result;
  });

  // 2. MERGE WITH REGISTRATIONS
  const STUDENT_DATABASE = {};
  
  // Fuzzy Lookup (First 4 chars of ID)
  const fuzzyLookup = {};
  Object.keys(FINAL_RESULTS).forEach(id => {
    const prefix = id.substring(0, 4);
    if (!fuzzyLookup[prefix]) fuzzyLookup[prefix] = [];
    fuzzyLookup[prefix].push(id);
  });

  registrations.forEach(reg => {
    if (!reg.mobile) return;

    const strictId = generatePassword(reg.name, reg.mobile);
    const namePrefix = strictId.substring(0, 4);
    
    let result = FINAL_RESULTS[strictId];
    let finalId = strictId;

    // Fallback logic
    if (!result && fuzzyLookup[namePrefix]) {
      const possibleId = fuzzyLookup[namePrefix][0];
      if (possibleId) {
        result = FINAL_RESULTS[possibleId];
        finalId = possibleId;
      }
    }

    STUDENT_DATABASE[reg.mobile] = {
      user: {
        _id: reg._id || `STU_${reg.mobile}`,
        name: reg.name,
        mobile: reg.mobile,
        applicationNo: finalId,
        password: strictId,
        photo: reg.photo || null
      },
      result: result || null
    };
  });

  // 3. WRITE OUTPUT
  const fileContent = `
// AUTO-GENERATED FILE
export const STUDENT_DATABASE: any = ${JSON.stringify(STUDENT_DATABASE, null, 2)};
`;

  fs.writeFileSync(path.join(rootDir, OUTPUT_FILE), fileContent);
  console.log(`🎉 Generated data for ${Object.keys(STUDENT_DATABASE).length} students.`);
}

generate();