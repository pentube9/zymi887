import { spawnSync } from 'child_process';
import path from 'path';

const target = "C:\\Users\\DELL\\AppData\\Roaming\\npm\\node_modules\\opencode-ai\\node_modules\\opencode-windows-x64-baseline\\bin\\opencode.exe";
const args = ["--version"];

console.log(`Running: ${target} ${args.join(' ')}`);

const result = spawnSync(target, args, {
  stdio: "inherit",
});

if (result.error) {
  console.error("Error:", result.error.message);
  process.exit(1);
}

console.log("Status:", result.status);
