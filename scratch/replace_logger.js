const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'apps/web/lib/api/handler.ts',
  'apps/web/app/api/v1/commandes/route.ts',
  'apps/web/lib/emails/send.ts',
  'apps/web/app/sitemap.ts',
  'apps/web/lib/resend/client.ts',
  'apps/web/lib/utils/product-urls.ts',
  'apps/web/lib/middleware/rate-limit.ts'
];

filesToUpdate.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  console.log(`Checking ${filePath}...`);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes("import { createLogger } from '@maison/shared'")) {
    // Add import right after the first set of imports or at the top
    content = "import { createLogger } from '@maison/shared';\n" + content;
    // Add instantiation right after the imports
    content = content.replace(/(import .*?;[\n\r]+)+/m, (match) => {
      return match + "\nconst logger = createLogger('" + file.split('/').pop().split('.')[0] + "');\n";
    });
  }

  // Find console.error(MSG, err) or console.error(MSG) and replace with logger.error
  content = content.replace(/console\.error\((.*?)[,\s]+(error|err|e)\)/g, "logger.error($1, $2)");
  content = content.replace(/console\.error\((.*?)\)/g, (match, p1) => {
    // Prevent double replacing if already matched by the previous regex
    if (match.includes('logger.')) return match;
    return `logger.error(${p1})`;
  });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
});
