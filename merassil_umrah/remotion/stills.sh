#!/bin/bash
# usage: stills.sh out.png frame1 frame2 ...
B=$(ls -d /opt/pw-browsers/chromium_headless_shell-1194/*/)headless_shell
S=$(mktemp -d); out=$1; shift; i=0
for fr in "$@"; do i=$((i+1)); npx remotion still src/index.jsx Ad $S/$(printf %03d $i).png --frame=$fr --browser-executable=$B --log=error >/dev/null 2>&1 & done; wait
ffmpeg -v error -y -pattern_type glob -i "$S/*.png" -vf "scale=270:-1,tile=6x$(( ($#+5)/6 ))" -frames:v 1 $out
