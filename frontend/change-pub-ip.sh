# #!/bin/bash

# # Get the current public IPv4 address
# current_ip=$(aws elbv2 describe-load-balancers | jq -r '.LoadBalancers[0].DNSName')

# # File path of index.html
# file_path="frontend/nginx.conf"

# # Update the IP in the fetch URL using sed
# sed -i "s|###enterALBDNShere###|${current_ip}|g" "$file_path"




########## for running on only ec2 instance docker ############

#!/bin/bash

# Get the current public IPv4 address
current_ip=$(curl ifconfig.me)

# File path of index.html
file_path="frontend/nginx.conf"

# Update the IP in the fetch URL using sed
sed -i "s|###enterALBDNShere###|${current_ip}|g" "$file_path"