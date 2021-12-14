#!/bin/bash

cd /home/rocket/examples/server/
cargo run &
cd /home/rocket/examples/server/static/location
while true
do
        cat p*.gpx > gps.gpx
        sleep 8
done