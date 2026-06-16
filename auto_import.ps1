#!/bin/bash

# ---- CONFIG ----
ZIP_FILE="$1"                 # pass zip file as argument
BRANCH="main"
COMMIT_MSG="Auto import from zip"

# ---- VALIDATION ----
if [ -z "$ZIP_FILE" ]; then
  echo "❌ Usage: ./auto_import.sh yourfile.zip"
  exit 1
fi

if [ ! -f "$ZIP_FILE" ]; then
  echo "❌ File not found: $ZIP_FILE"
  exit 1
fi

# ---- UNZIP ----
echo "📦 Unzipping $ZIP_FILE..."
unzip -q "$ZIP_FILE"

# Get extracted folder name (top-level folder in zip)
EXTRACTED_FOLDER=$(unzip -Z1 "$ZIP_FILE" | head -1 | cut -d/ -f1)

# ---- FIX NESTED FOLDER ISSUE ----
if [ -d "$EXTRACTED_FOLDER" ]; then
  echo "📁 Flattening directory structure..."
  mv "$EXTRACTED_FOLDER"/* . 2>/dev/null
  mv "$EXTRACTED_FOLDER"/.* . 2>/dev/null
  rm -rf "$EXTRACTED_FOLDER"
fi

# ---- CLEANUP ----
echo "🧹 Cleaning up..."
rm -f "$ZIP_FILE"
rm -rf __MACOSX

# ---- GIT COMMIT ----
echo "📌 Committing changes..."
git add .
git commit -m "$COMMIT_MSG"
git push origin "$BRANCH"

echo "✅ Done!"