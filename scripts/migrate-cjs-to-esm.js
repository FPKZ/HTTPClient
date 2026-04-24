import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const electronDir = path.join(__dirname, '../electron');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(electronDir);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // 1. Converter require simples: const X = require("Y") -> import X from "Y"
    // Note: tsup lidará com a resolução sem .cjs
    content = content.replace(/const\s+(\w+)\s+=\s+require\(["'](.+?)["']\);?/g, (match, name, lib) => {
        const cleanLib = lib.replace(/\.cjs$/, '');
        return `import ${name} from "${cleanLib}";`;
    });

    // 2. Converter require destructuring: const { X, Y } = require("Z") -> import { X, Y } from "Z"
    content = content.replace(/const\s+\{(.+?)\}\s+=\s+require\(["'](.+?)["']\);?/g, (match, keys, lib) => {
        const cleanLib = lib.replace(/\.cjs$/, '');
        return `import { ${keys.trim()} } from "${cleanLib}";`;
    });

    // 3. Converter module.exports: module.exports = X -> export default X
    content = content.replace(/module\.exports\s+=\s+(.+?);?$/gm, 'export default $1;');

    // 4. Remover remanescentes de .cjs em outros caminhos
    content = content.replace(/\.cjs/g, '');

    fs.writeFileSync(file, content, 'utf8');
    console.log(`Migrated: ${file}`);
});
