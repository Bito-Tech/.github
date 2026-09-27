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

const DARK_OUTPUT = path.join(
  ROOT,
  "profile",
  "assets",
  "hero",
  "hero-dark.svg"
);

const LIGHT_OUTPUT = path.join(
  ROOT,
  "profile",
  "assets",
  "hero",
  "hero-light.svg"
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
  if (!config.organization?.name) {
    fail("Missing organization.name.");
  }

  if (!config.organization?.tagline) {
    fail("Missing organization.tagline.");
  }

  if (!Array.isArray(config.members) || config.members.length !== 5) {
    fail("Exactly 5 members are required.");
  }

  if (!Array.isArray(config.projects) || config.projects.length !== 3) {
    fail("Exactly 3 projects are required.");
  }

  for (const member of config.members) {
    if (!member.name || !member.github) {
      fail("Each member needs name and github.");
    }
  }

  for (const project of config.projects) {
    if (!project.name || !project.repository || !project.subtitle) {
      fail("Each project needs name, repository and subtitle.");
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

function renderContent(template, config) {
  let svg = template;

  svg = replaceOnce(
    svg,
    "We build ideas into real systems.",
    escapeXml(config.organization.tagline),
    "organization tagline"
  );

  const templateProjects = [
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
      templateProjects[i].name,
      escapeXml(config.projects[i].name),
      `project ${i + 1} name`
    );

    svg = replaceOnce(
      svg,
      templateProjects[i].subtitle,
      escapeXml(config.projects[i].subtitle),
      `project ${i + 1} subtitle`
    );
  }

  const templateMembers = [
    "Ayman",
    "Al-Harith",
    "Abdullah Hamoud",
    "Malek",
    "Mulatif",
  ];

  for (let i = 0; i < 5; i++) {
    svg = replaceOnce(
      svg,
      `>${templateMembers[i]}<`,
      `>${escapeXml(config.members[i].name)}<`,
      `member ${i + 1}`
    );
  }

  return svg;
}

function addGeneratedMarker(svg, theme) {
  const marker =
    `<!-- BITO-TECH-LIVING-HERO: GENERATED / ${theme.toUpperCase()} -->`;

  return `${marker}\n${svg}`;
}

function createLightTheme(svg) {
  const palette = new Map([
    // Background
    ["#020406", "#FAFBFD"],
    ["#080C11", "#F3F6FA"],
    ["#101821", "#EAF0F6"],

    // Deep dark fills
    ["#04070A", "#FFFFFF"],
    ["#071018", "#FFFFFF"],
    ["#080D12", "#FCFDFE"],
    ["#0A1016", "#F5F7FA"],
    ["#070B10", "#F1F4F8"],

    // Card / metal bases
    ["#252F3A", "#FFFFFF"],
    ["#111820", "#F7F9FC"],

    // Borders / dividers
    ["#303B48", "#C5D0DB"],
    ["#3B4857", "#BAC7D4"],
    ["#455362", "#AEBECD"],
    ["#27313D", "#D3DBE4"],

    // Headings / primary text
    ["#F5F7FA", "#18212B"],
    ["#F0F3F6", "#1E2935"],
    ["#CDD5DE", "#40505F"],
    ["#D7DEE7", "#2B3947"],
    ["#BEC8D4", "#4A5C6D"],

    // Secondary text
    ["#8190A0", "#6C7C8C"],
    ["#7F8D9D", "#718192"],
    ["#586777", "#7B8A99"],
    ["#596878", "#7B8A99"],

    // Network lines / accents
    ["#718398", "#8FA3B7"],
    ["#65778B", "#9AAABA"],

    // Blue accents
    ["#9DC4ED", "#7EA8D4"],
    ["#A8CEF5", "#6E9BCB"],
    ["#92BBE8", "#5F8FBE"]
  ]);

  let light = svg;

  // 1) Basic color replacement
  for (const [darkColor, lightColor] of palette) {
    light = light.replaceAll(darkColor, lightColor);
  }

  // 2) Make the page really light and clean
  light = light.replace(
    'fill="url(#background)"',
    'fill="#F8FAFD"'
  );

  light = light.replace(
    'fill="url(#ambient)"',
    'fill="#EAF3FC" opacity="0.9"'
  );

  // 3) Make network rings and lines more visible in light mode
  light = light.replaceAll('stroke-opacity=".045"', 'stroke-opacity=".12"');
  light = light.replaceAll('stroke-opacity=".055"', 'stroke-opacity=".14"');
  light = light.replaceAll('stroke-opacity=".075"', 'stroke-opacity=".18"');
  light = light.replaceAll('stroke-opacity=".36"', 'stroke-opacity=".42"');
  light = light.replaceAll('stroke-opacity=".27"', 'stroke-opacity=".34"');

  // 4) Remove heavy dark-card feeling from project cards
  light = light.replace(
    '<g font-family="Segoe UI, Arial, sans-serif" filter="url(#cardShadow)">',
    '<g font-family="Segoe UI, Arial, sans-serif">'
  );

  // 5) Soften chip backgrounds
  light = light.replaceAll(
    'fill="#F5F7FA" stroke="#C5D0DB"',
    'fill="#FFFFFF" stroke="#D5DEE8"'
  );

  // 6) Make project cards cleaner and calmer
  light = light.replaceAll(
    'fill="url(#gunmetal)" stroke="#BAC7D4"',
    'fill="#FFFFFF" stroke="#CDD7E2"'
  );

  // 7) Improve readability of small subtitles in project cards
  light = light.replaceAll(
    'fill="#718192"',
    'fill="#667788"'
  );

  // 8) Make frame border cleaner
  light = light.replace(
    'stroke="#303B48"',
    'stroke="#D7E0E8"'
  );

  return light;
}
const config = readJson(CONFIG_PATH);

validateConfig(config);

if (!fs.existsSync(TEMPLATE_PATH)) {
  fail(`Hero template not found: ${TEMPLATE_PATH}`);
}

const template = fs.readFileSync(TEMPLATE_PATH, "utf8");

const rendered = renderContent(template, config);

const darkSvg = addGeneratedMarker(
  rendered,
  "dark"
);

const lightSvg = addGeneratedMarker(
  createLightTheme(rendered),
  "light"
);

fs.writeFileSync(
  DARK_OUTPUT,
  darkSvg,
  "utf8"
);

fs.writeFileSync(
  LIGHT_OUTPUT,
  lightSvg,
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
console.log("Generated:");
console.log("  hero-dark.svg");
console.log("  hero-light.svg");
console.log("");
console.log("PASS: Dark + Light Living Hero rendered successfully.");