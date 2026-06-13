import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const files = [];
const roots = ["experiments", "games", "tests"].filter((dir) => existsSync(join(root, dir)));

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if ([".git", "node_modules", "dist", "build", "coverage"].includes(entry)) continue;
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) walk(path);
    else if (entry.endsWith(".js") || entry.endsWith(".mjs")) files.push(path);
  }
}

for (const dir of roots) walk(join(root, dir));
files.sort();
for (const file of files) execFileSync(process.execPath, ["--check", file], { stdio: "inherit" });
console.log(`Syntax checked ${files.length} JS/MJS files.`);
