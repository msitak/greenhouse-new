const fs = require('fs');
const path = require('path');

const clientPath = path.join(__dirname, '..', 'src', 'generated', 'client');
const indexPath = path.join(clientPath, 'index.ts');

const indexContent = `// Re-export everything from the main Prisma Client file
export * from './client';
`;

// Ensure the directory exists
if (fs.existsSync(clientPath)) {
  fs.writeFileSync(indexPath, indexContent, 'utf8');
  console.log('✓ Created index.ts for Prisma Client');
} else {
  console.error('✗ Prisma Client directory not found');
  process.exit(1);
}
