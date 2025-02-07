#!/bin/bash

# Get the current public IPv4 address
current_ip=$(curl -s ifconfig.me)

# File path of index.html
file_path="/app/index.html"

# Update the IP in the fetch URL using sed
sed -i "s|http://[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}:3000|http://${current_ip}:3000|g" "$file_path"