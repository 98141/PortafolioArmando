/** Estimates reading time in minutes (~200 words/min). */
const WORDS_PER_MINUTE = 200;

const stripMarkdown = (text = "") =>
  text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/[#>*_~\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const calculateReadingTime = (content = "") => {
  const plain = stripMarkdown(content);
  if (!plain) return 1;
  const words = plain.split(" ").filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
};

module.exports = { calculateReadingTime, stripMarkdown };
