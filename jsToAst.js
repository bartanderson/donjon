const esprima = require('esprima');
const JSONStream = require('JSONStream');
const fs = require('fs');

// Read the JavaScript code from a file
const code = fs.readFileSync('example.js', 'utf8');

// Parse the code and get the AST
const ast = esprima.parse(code);

// Create a JSON stream with a chunk size of 10 and a newline delimiter
const stream = JSONStream.stringify(false, '\n', '\n', 10);

// Pipe the AST to the stream
stream.write(ast);

// Pipe the stream to a file or a machine learning model
stream.pipe(fs.createWriteStream('ast_chunks.json'));