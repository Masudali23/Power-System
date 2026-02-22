import fs from 'fs';
import path from 'path';

const contentDir = path.join(process.cwd(), 'src/content');
const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
    const filePath = path.join(contentDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    // Find all $...$ that are NOT inside a tag's attribute like math="..."
    // A simple way is to match text outside of HTML tags, but since this is TSX,
    // we can just replace $math$ with <MathTex math={`math`} />
    // Be careful with escaped \$ if any.

    // Replace $...$ with <MathTex math="..." />
    // We use a regex that matches $ followed by non-$ followed by $
    content = content.replace(/\$([^$\n]+)\$/g, (match, p1) => {
        // Escape backslashes for string literal, or just use curly strings
        const escaped = p1.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        return `<MathTex math={"${escaped}"} />`;
    });

    // Make sure to import MathTex if not already imported
    if (content.indexOf('<MathTex') > -1 && content.indexOf('import { MathTex }') === -1) {
        content = "import { MathTex } from '../components/MathTex';\n" + content;
    }

    fs.writeFileSync(filePath, content);
});
console.log('Fixed inline math in JSX');
