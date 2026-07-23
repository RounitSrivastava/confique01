import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const directoryPath = path.join(__dirname, 'src');

const replacements = [
  // Backgrounds
  { regex: /\bbg-bg-1(\/80)?\b/g, replacement: 'bg-white' },
  { regex: /\bbg-bg-2(\/80)?\b/g, replacement: 'bg-white' },
  { regex: /\bbg-bg-3(\/80)?\b/g, replacement: 'bg-gray-50' },
  { regex: /\bbg-bg-4(\/80)?\b/g, replacement: 'bg-gray-100' },
  
  // Texts
  { regex: /\btext-text-1\b/g, replacement: 'text-gray-900' },
  { regex: /\btext-text-2\b/g, replacement: 'text-gray-600' },
  { regex: /\btext-text-3\b/g, replacement: 'text-gray-500' },
  { regex: /\btext-text-4\b/g, replacement: 'text-gray-400' },
  
  // Borders
  { regex: /\bborder-border-1\b/g, replacement: 'border-gray-200' },
  { regex: /\bborder-border-2(\/60)?\b/g, replacement: 'border-gray-200' },
  
  // Divides
  { regex: /\bdivide-border-1\b/g, replacement: 'divide-gray-200' },
  { regex: /\bdivide-border-2\b/g, replacement: 'divide-gray-200' }
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    
    // Explicitly SKIP events, Topbar, Sidebar, RightSidebar, ClientLayout, etc.
    // because those are either shared or events-only.
    if (
      fullPath.includes(path.join('src', 'app', 'events')) ||
      fullPath.includes(path.join('src', 'app', 'api', 'events')) ||
      fullPath.includes('Topbar.jsx') ||
      fullPath.includes('Sidebar.jsx') ||
      fullPath.includes('RightSidebar.jsx') ||
      fullPath.includes('ClientLayout.jsx')
    ) {
      continue;
    }
    
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  for (const { regex, replacement } of replacements) {
    content = content.replace(regex, replacement);
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

console.log("Starting hardcode light theme...");
processDirectory(directoryPath);
console.log("Finished.");
