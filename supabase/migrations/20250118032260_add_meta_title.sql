-- Add meta_title column to code_snippets table
ALTER TABLE code_snippets ADD COLUMN IF NOT EXISTS meta_title text; 