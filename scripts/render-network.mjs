import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const CONFIG_PATH = path.join(
  ROOT,
  "profile",
  "network.config.json"
);

const TEMPLATE_PATH = path.join(
  ROOT,
  "profile",
  "assets",
  "hero",
  "hero-dark.template.svg"
);

const HERO_PATH = path.join(
  ROOT,
  "profile",
  "assets",
  "hero",
  "hero-dark.svg"
);

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`Cannot read JSON: ${filePath}\n${error.message}`);
  }
}

function validateConfig(config) {
  if (!config.organization) {
    fail("Missing organization section.");
  }

  if (!config.organization.name) {
    fail("Missing organization.name.");
  }

  if (!config.organization.tagline) {
    fail("Missing organization.tagline.");
  }

  if (!Array.isArray(config.members)) {
    fail("members must be an array.");
  }

  if (config.members.length !== 5) {
    fail(
      `Expected exactly 5 members, found ${config.members.length}.`
    );
  }

  if (!Array.isArray(config.projects)) {
    fail("projects must be an array.");
  }

  if (config.projects.length !== 3) {
    fail(
      `Expected exactly 3 projects, found ${config.projects.length}.`
    );
  }

  for (const member of config.members) {
    if (!member.name || !member.github) {
      fail("Each member needs name and github.");
    }
  }

  for (const project of config.projects) {
    if (!project.name || !project.repository || !project.subtitle) {
      fail(
        "Each project needs name, repository and subtitle."
      );
    }
  }
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function replaceOnce(source, oldValue, newValue, label) {
  if (!source.includes(oldValue)) {
    fail(`Could not find SVG value for: ${label}`);
  }

  return source.replace(oldValue, newValue);
}

const config = readJson(CONFIG_PATH);

validateConfig(config);

if (!fs.existsSync(TEMPLATE_PATH)) {
  fail(`Hero template not found: ${TEMPLATE_PATH}`);
}

let svg = fs.readFileSync(TEMPLATE_PATH, "utf8");

/*
 * --------------------------------------------------------
 * Organization
 * --------------------------------------------------------
 */

svg = replaceOnce(
  svg,
  "We build ideas into real systems.",
  escapeXml(config.organization.tagline),
  "organization tagline"
);

/*
 * --------------------------------------------------------
 * Projects
 *
 * Current visual order:
 * 01 → MASARAK
 * 02 → FRAUD DETECTION
 * 03 → FEDRA
 * --------------------------------------------------------
 */

const currentProjects = [
  {
    name: "MASARAK",
    subtitle: "Academic guidance",
  },
  {
    name: "FRAUD DETECTION",
    subtitle: "Machine learning",
  },
  {
    name: "FEDRA",
    subtitle: "Pharmacy system",
  },
];

for (let i = 0; i < 3; i++) {
  svg = replaceOnce(
    svg,
    currentProjects[i].name,
    escapeXml(config.projects[i].name),
    `project ${i + 1} name`
  );

  svg = replaceOnce(
    svg,
    currentProjects[i].subtitle,
    escapeXml(config.projects[i].subtitle),
    `project ${i + 1} subtitle`
  );
}

/*
 * --------------------------------------------------------
 * Members
 *
 * Visual order is intentionally controlled by config:
 *
 * 1 Ayman
 * 2 Al-Harith
 * 3 Abdullah Hamoud
 * 4 Malek
 * 5 Mulatif
 * --------------------------------------------------------
 */

const currentMembers = [
  "Ayman",
  "Al-Harith",
  "Abdullah Hamoud",
  "Malek",
  "Mulatif",
];

for (let i = 0; i < 5; i++) {
  svg = replaceOnce(
    svg,
    `>${currentMembers[i]}<`,
    `>${escapeXml(config.members[i].name)}<`,
    `member ${i + 1}`
  );
}

/*
 * --------------------------------------------------------
 * Generated marker
 * --------------------------------------------------------
 *
 * Deterministic:
 * no timestamps
 * no random values
 * same input => same output
 */

const marker =
  "<!-- BITO-TECH-LIVING-HERO: GENERATED FROM profile/network.config.json -->";

svg = svg.replace(
  /<!-- BITO-TECH-LIVING-HERO: GENERATED FROM profile\/network\.config\.json -->\n?/g,
  ""
);

svg = svg.replace(
  "<svg ",
  `${marker}\n<svg `
);

fs.writeFileSync(
  HERO_PATH,
  svg,
  "utf8"
);

console.log("");
console.log("Bito-Tech Living Hero");
console.log("----------------------");
console.log(`Organization : ${config.organization.name}`);
console.log(`Members      : ${config.members.length}`);
console.log(`Projects     : ${config.projects.length}`);
console.log(`Motion       : ${config.render?.motion === true ? "ON" : "OFF"}`);
console.log("");
console.log(`Updated: ${HERO_PATH}`);
console.log("");
console.log("PASS: Living Hero rendered successfully.");