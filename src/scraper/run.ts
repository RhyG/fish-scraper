const childProcess = require("child_process");

// Extract the brand name from the command line arguments
const brand = process.argv[2].split("=")[1];

// Construct the script path based on the brand name
const scriptPath = `./src/scraper/products/${brand}.ts`;
console.log(scriptPath);

// Use child_process to execute the TypeScript file using ts-node
// @ts-ignore
childProcess.exec(`ts-node ${scriptPath}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.error(`stderr: ${stderr}`);
});
