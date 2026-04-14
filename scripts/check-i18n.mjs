import { readFileSync } from "node:fs";
import path from "node:path";

const SOURCE_LOCALE = "en";
const LOCALES_TO_CHECK = ["zh", "es", "hi", "ar"];
const messagesDir = path.join(process.cwd(), "messages");

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function describeValue(value) {
  if (Array.isArray(value)) {
    return "array";
  }

  if (value === null) {
    return "null";
  }

  return typeof value;
}

function compareStructure(source, target, keyPath, issues) {
  if (isRecord(source)) {
    if (!isRecord(target)) {
      issues.push(
        `${keyPath || "<root>"}: expected nested object, received ${describeValue(target)}`,
      );
      return;
    }

    for (const [key, value] of Object.entries(source)) {
      const nextPath = keyPath ? `${keyPath}.${key}` : key;

      if (!(key in target)) {
        issues.push(`${nextPath}: missing key`);
        continue;
      }

      compareStructure(value, target[key], nextPath, issues);
    }

    return;
  }

  if (isRecord(target)) {
    issues.push(
      `${keyPath || "<root>"}: expected value, received nested object`,
    );
  }
}

function main() {
  const sourcePath = path.join(messagesDir, `${SOURCE_LOCALE}.json`);
  const source = readJson(sourcePath);
  let hasErrors = false;

  for (const locale of LOCALES_TO_CHECK) {
    const localePath = path.join(messagesDir, `${locale}.json`);
    const localeMessages = readJson(localePath);
    const issues = [];

    compareStructure(source, localeMessages, "", issues);

    if (issues.length > 0) {
      hasErrors = true;
      console.error(`\n[i18n:check] ${locale}.json is out of sync with ${SOURCE_LOCALE}.json`);

      for (const issue of issues) {
        console.error(`- ${issue}`);
      }

      continue;
    }

    console.log(`[i18n:check] ${locale}.json OK`);
  }

  if (hasErrors) {
    process.exitCode = 1;
    return;
  }

  console.log(`\n[i18n:check] All locale files match ${SOURCE_LOCALE}.json`);
}

main();
