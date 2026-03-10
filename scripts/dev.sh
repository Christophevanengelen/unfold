#!/bin/bash
# Unfold dev server launcher — loads NVM + starts Next.js on port 3333
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
cd /Users/jhondoe/Documents/unfold
exec npm run dev
