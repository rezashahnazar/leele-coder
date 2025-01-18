/*
  # Code Snippets Schema

  1. New Tables
    - `code_snippets`
      - `id` (uuid, primary key)
      - `code` (text, the actual code content)
      - `title` (text, optional title for the snippet)
      - `user_id` (uuid, references auth.users)
      - `published` (boolean, whether the snippet is published)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `code_snippets` table
    - Add policies for authenticated users to manage their own snippets
    - Add policy for public access to published snippets
*/

CREATE TABLE IF NOT EXISTS code_snippets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  title text,
  user_id uuid REFERENCES auth.users NOT NULL,
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE code_snippets ENABLE ROW LEVEL SECURITY;

-- Policy for users to manage their own snippets
CREATE POLICY "Users can manage their own snippets"
  ON code_snippets
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for public access to published snippets
CREATE POLICY "Anyone can view published snippets"
  ON code_snippets
  FOR SELECT
  TO anon
  USING (published = true);