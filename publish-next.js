#!/usr/bin/env node

const { readFileSync, writeFileSync } = require("fs");
const { resolve } = require("path");

const getPackageJsonPath = projectDir => resolve(projectDir, "package.json");
const getPackageJson = projectDir => {
    const packageJsonPath = getPackageJsonPath(projectDir);
    return JSON.parse(readFileSync(packageJsonPath, "utf8"));
}
const writePackageJson = (content, projectDir) => {
    const packageJsonPath = getPackageJsonPath(projectDir);
    writeFileSync(packageJsonPath, JSON.stringify(content, null, 2));
}

const tag = "next";
const projectDir = __dirname;
const packageJson = getPackageJson(projectDir);
const [, , packageVersion = new Date().toISOString().split("T")[0] ] = process.argv;

packageJson.publishConfig = Object.assign(
    packageJson.publishConfig || {},
    { tag }
);

const currentVersion = packageJson.version;
const nextVersion = `${currentVersion}-${packageVersion}`;
const newPackageJson = Object.assign(packageJson, { version: nextVersion });

writePackageJson(newPackageJson, projectDir);
