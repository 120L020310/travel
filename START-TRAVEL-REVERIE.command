#!/bin/bash
cd "$(dirname "$0")"
PORT=8000

if lsof -iTCP:$PORT -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Port $PORT is already in use."
  echo "Close the older Travel Reverie server first (Control+C), then reopen this file."
  read -n 1 -s -r -p "Press any key to close..."
  exit 1
fi

(sleep 1.0; open "http://localhost:$PORT/?build=7.7.0-photo-wall-carousel") &
echo "Travel Reverie 7.7.0 is running at:"
echo "http://localhost:$PORT/?build=7.7.0-photo-wall-carousel"
echo
echo "Keep this window open. Press Control+C to stop."
python3 -m http.server "$PORT"
