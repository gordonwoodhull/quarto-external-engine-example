#!/bin/bash
set -e

echo "Testing external engine loading..."

# Navigate to the test directory
cd "$(dirname "$0")"

# Run quarto render on the test file
echo "Rendering test document with external engine..."
quarto render test-external-engine.qmd

# Check if the output file exists
if [ -f _output/test-external-engine.html ]; then
  echo "Output file generated successfully."

  # Check if the example block was properly processed
  if grep -q "example-output" _output/test-external-engine.html; then
    echo "External engine successfully processed the example block."
    exit 0
  else
    echo "Error: Output file exists but example block was not processed correctly."
    exit 1
  fi
else
  echo "Error: Output file was not generated."
  exit 1
fi