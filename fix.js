const fs = require('fs');
let content = fs.readFileSync('client/src/app/dashboard/knowledge-map/page.tsx', 'utf8');
content = content.replace(/<span className="text-gray-400">.*<\/span>/, '<ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />');
fs.writeFileSync('client/src/app/dashboard/knowledge-map/page.tsx', content);
