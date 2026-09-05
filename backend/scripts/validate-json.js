import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function validateNoDuplicateKeys(jsonText, filename = 'JSON file') {
  let pos = 0;
  let line = 1;
  let col = 1;

  function error(msg) {
    throw new Error(`${msg} in ${filename} at line ${line}, col ${col} (pos ${pos})`);
  }

  function nextChar() {
    const ch = jsonText[pos++];
    if (ch === '\n') {
      line++;
      col = 1;
    } else {
      col++;
    }
    return ch;
  }

  function peekChar() {
    return jsonText[pos];
  }

  function skipWhitespace() {
    while (pos < jsonText.length) {
      const ch = peekChar();
      if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
        nextChar();
      } else {
        break;
      }
    }
  }

  const duplicates = [];

  function parseValue(currentPath) {
    skipWhitespace();
    if (pos >= jsonText.length) error('Unexpected EOF');

    const ch = peekChar();
    if (ch === '{') return parseObject(currentPath);
    if (ch === '[') return parseArray(currentPath);
    if (ch === '"') return parseString();
    if (ch === 't' || ch === 'f') return parseBoolean();
    if (ch === 'n') return parseNull();
    if (ch === '-' || (ch >= '0' && ch <= '9')) return parseNumber();

    error(`Unexpected token '${ch}'`);
  }

  function parseObject(currentPath) {
    nextChar(); // consume '{'
    skipWhitespace();

    const keysSeen = new Map();

    if (peekChar() === '}') {
      nextChar();
      return;
    }

    while (pos < jsonText.length) {
      skipWhitespace();
      const startLine = line;
      const startCol = col;
      if (peekChar() !== '"') {
        error(`Expected string key in object, found '${peekChar()}'`);
      }
      const key = parseString();

      if (keysSeen.has(key)) {
        duplicates.push({
          key,
          path: currentPath ? `${currentPath}.${key}` : key,
          firstSeen: keysSeen.get(key),
          duplicateAt: { line: startLine, col: startCol },
        });
      } else {
        keysSeen.set(key, { line: startLine, col: startCol });
      }

      skipWhitespace();
      if (peekChar() !== ':') {
        error(`Expected ':' after key '${key}'`);
      }
      nextChar(); // consume ':'

      const childPath = currentPath ? `${currentPath}.${key}` : key;
      parseValue(childPath);

      skipWhitespace();
      const nextC = peekChar();
      if (nextC === '}') {
        nextChar();
        break;
      } else if (nextC === ',') {
        nextChar();
      } else {
        error(`Expected ',' or '}' in object, found '${nextC}'`);
      }
    }
  }

  function parseArray(currentPath) {
    nextChar(); // consume '['
    skipWhitespace();

    if (peekChar() === ']') {
      nextChar();
      return;
    }

    let idx = 0;
    while (pos < jsonText.length) {
      skipWhitespace();
      parseValue(`${currentPath}[${idx}]`);
      idx++;

      skipWhitespace();
      const nextC = peekChar();
      if (nextC === ']') {
        nextChar();
        break;
      } else if (nextC === ',') {
        nextChar();
      } else {
        error(`Expected ',' or ']' in array, found '${nextC}'`);
      }
    }
  }

  function parseString() {
    nextChar(); // consume leading '"'
    let str = '';
    while (pos < jsonText.length) {
      const ch = nextChar();
      if (ch === '"') {
        return str;
      }
      if (ch === '\\') {
        const esc = nextChar();
        if (esc === '"') str += '"';
        else if (esc === '\\') str += '\\';
        else if (esc === '/') str += '/';
        else if (esc === 'b') str += '\b';
        else if (esc === 'f') str += '\f';
        else if (esc === 'n') str += '\n';
        else if (esc === 'r') str += '\r';
        else if (esc === 't') str += '\t';
        else if (esc === 'u') {
          const hex = jsonText.slice(pos, pos + 4);
          pos += 4;
          str += String.fromCharCode(parseInt(hex, 16));
        } else {
          str += esc;
        }
      } else {
        str += ch;
      }
    }
    error('Unterminated string');
  }

  function parseBoolean() {
    if (jsonText.startsWith('true', pos)) {
      pos += 4;
      col += 4;
      return true;
    }
    if (jsonText.startsWith('false', pos)) {
      pos += 5;
      col += 5;
      return false;
    }
    error('Invalid boolean');
  }

  function parseNull() {
    if (jsonText.startsWith('null', pos)) {
      pos += 4;
      col += 4;
      return null;
    }
    error('Invalid null');
  }

  function parseNumber() {
    const start = pos;
    while (pos < jsonText.length) {
      const ch = peekChar();
      if ((ch >= '0' && ch <= '9') || ch === '.' || ch === 'e' || ch === 'E' || ch === '+' || ch === '-') {
        nextChar();
      } else {
        break;
      }
    }
    const numStr = jsonText.slice(start, pos);
    const num = Number(numStr);
    if (isNaN(num)) error(`Invalid number '${numStr}'`);
    return num;
  }

  parseValue('');
  skipWhitespace();
  if (pos < jsonText.length) {
    error('Trailing characters after JSON object');
  }

  return duplicates;
}

// CLI runner if executed directly
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  const targetFiles = [
    path.join(__dirname, '..', 'data', 'tax_database.json'),
  ];

  let hasErrors = false;

  for (const filePath of targetFiles) {
    if (!fs.existsSync(filePath)) {
      console.warn(`[JSON Validator] File not found: ${filePath}`);
      continue;
    }

    const raw = fs.readFileSync(filePath, 'utf-8');
    try {
      JSON.parse(raw);
    } catch (err) {
      console.error(`❌ [JSON Validator] Standard JSON.parse failed for ${path.basename(filePath)}:`, err.message);
      hasErrors = true;
      continue;
    }

    try {
      const duplicates = validateNoDuplicateKeys(raw, path.basename(filePath));
      if (duplicates.length > 0) {
        console.error(`❌ [JSON Validator] Found ${duplicates.length} duplicate key(s) in ${path.basename(filePath)}:`);
        duplicates.forEach((dup) => {
          console.error(`   - Key "${dup.key}" at path "${dup.path}" (first at L${dup.firstSeen.line}:C${dup.firstSeen.col}, duplicate at L${dup.duplicateAt.line}:C${dup.duplicateAt.col})`);
        });
        hasErrors = true;
      } else {
        console.log(`✔ [JSON Validator] ${path.basename(filePath)} passed JSON validation with NO duplicate keys.`);
      }
    } catch (err) {
      console.error(`❌ [JSON Validator] Validation error for ${path.basename(filePath)}:`, err.message);
      hasErrors = true;
    }
  }

  if (hasErrors) {
    process.exit(1);
  }
}
