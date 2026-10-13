#!/bin/bash
set -e

echo "token length: ${#GITHUB_TOKEN}"
curl -s -o /dev/null -w "registry status: %{http_code}\n" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  "https://npm.pkg.github.com/@barito-bahalap%2Fconfig"

printf '//npm.pkg.github.com/:_authToken=%s\n' "$GITHUB_TOKEN" >> ~/.npmrc
pnpm install --frozen-lockfile