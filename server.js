import express from "express";
import crypto from "crypto";
import cors from "cors";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(
  rateLimit({
    windowMs: 1 * 60 * 1000, // 1 min
    max: 30,
    message: { error: "Too many requests, please try again later." },
  })
);

// In-memory storage
const stringStore = {};

// Helper: Analyze a string
function analyzeString(value) {
  const length = value.length;
  const normalized = value.toLowerCase().replace(/\s+/g, "");
  const is_palindrome = normalized === normalized.split("").reverse().join("");
  const unique_characters = new Set(value).size;
  const word_count = value.trim() === "" ? 0 : value.trim().split(/\s+/).length;
  const sha256_hash = crypto.createHash("sha256").update(value).digest("hex");
  const character_frequency_map = {};
  for (const char of value) {
    character_frequency_map[char] = (character_frequency_map[char] || 0) + 1;
  }

  return {
    length,
    is_palindrome,
    unique_characters,
    word_count,
    sha256_hash,
    character_frequency_map,
  };
}

// POST /strings - create/analyze string
app.post("/strings", (req, res) => {
  const { value } = req.body;
  if (value === undefined)
    return res.status(400).json({ error: '"value" field is required' });
  if (typeof value !== "string")
    return res.status(422).json({ error: '"value" must be a string' });

  const properties = analyzeString(value);

  if (stringStore[properties.sha256_hash])
    return res
      .status(409)
      .json({ error: "String already exists in the system" });

  const created_at = new Date().toISOString();
  const responseObj = {
    id: properties.sha256_hash,
    value,
    properties,
    created_at,
  };
  stringStore[properties.sha256_hash] = responseObj;

  console.log(`Analyzed new string: "${value}"`);
  res.status(201).json(responseObj);
});

// GET /strings/:value - get a specific string
app.get("/strings/:value", (req, res) => {
  const value = req.params.value;
  const hash = crypto.createHash("sha256").update(value).digest("hex");
  const stored = stringStore[hash];
  if (!stored)
    return res
      .status(404)
      .json({ error: "String does not exist in the system" });
  res.json(stored);
});

// GET /strings - get all strings with optional filters
app.get("/strings", (req, res) => {
  const {
    is_palindrome,
    min_length,
    max_length,
    word_count,
    contains_character,
  } = req.query;
  let results = Object.values(stringStore);

  try {
    if (is_palindrome !== undefined)
      results = results.filter(
        (s) => s.properties.is_palindrome === (is_palindrome === "true")
      );
    if (min_length !== undefined)
      results = results.filter(
        (s) => s.properties.length >= parseInt(min_length)
      );
    if (max_length !== undefined)
      results = results.filter(
        (s) => s.properties.length <= parseInt(max_length)
      );
    if (word_count !== undefined)
      results = results.filter(
        (s) => s.properties.word_count === parseInt(word_count)
      );
    if (contains_character !== undefined && contains_character.length === 1)
      results = results.filter((s) => s.value.includes(contains_character));
  } catch {
    return res.status(400).json({ error: "Invalid query parameter values" });
  }

  res.json({
    data: results,
    count: results.length,
    filters_applied: req.query,
  });
});

// GET /strings/filter-by-natural-language - parse simple natural language queries
app.get("/strings/filter-by-natural-language", (req, res) => {
  const { query } = req.query;
  if (!query)
    return res.status(400).json({ error: "Query parameter is required" });

  const parsedFilters = {};
  const q = query.toLowerCase();

  if (q.includes("palindromic") || q.includes("palindrome"))
    parsedFilters.is_palindrome = true;
  if (q.includes("single word") || q.includes("word_count=1"))
    parsedFilters.word_count = 1;
  const lengthMatch = q.match(/longer than (\d+)/);
  if (lengthMatch) parsedFilters.min_length = parseInt(lengthMatch[1]);
  const containsMatch = q.match(/contains the letter (\w)/);
  if (containsMatch) parsedFilters.contains_character = containsMatch[1];

  // Apply parsed filters
  let results = Object.values(stringStore);
  if (parsedFilters.is_palindrome)
    results = results.filter((s) => s.properties.is_palindrome);
  if (parsedFilters.word_count)
    results = results.filter(
      (s) => s.properties.word_count === parsedFilters.word_count
    );
  if (parsedFilters.min_length)
    results = results.filter(
      (s) => s.properties.length >= parsedFilters.min_length
    );
  if (parsedFilters.contains_character)
    results = results.filter((s) =>
      s.value.includes(parsedFilters.contains_character)
    );

  res.json({
    data: results,
    count: results.length,
    interpreted_query: { original: query, parsed_filters: parsedFilters },
  });
});

// DELETE /strings/:value - delete a string
app.delete("/strings/:value", (req, res) => {
  const value = req.params.value;
  const hash = crypto.createHash("sha256").update(value).digest("hex");
  if (!stringStore[hash])
    return res
      .status(404)
      .json({ error: "String does not exist in the system" });
  delete stringStore[hash];
  res.status(204).send();
});

// Start server
app.listen(PORT, () => console.log(`Server running on PORT: ${PORT}`));
