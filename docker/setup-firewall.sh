#!/bin/bash
# =============================================================================
# FIREWALL SETUP SCRIPT
# Block all ports except 80 (HTTP) and 443 (HTTPS)
# =============================================================================

set -e

echo "Configuring firewall..."

# Flush existing rules
iptables -F
iptables -X

# Default: drop everything
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

# Allow loopback
iptables -A INPUT -i lo -j ACCEPT
iptables -A OUTPUT -o lo -j ACCEPT

# Allow established connections
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

# Allow HTTP (port 80)
iptables -A INPUT -p tcp --dport 80 -j ACCEPT

# Allow HTTPS (port 443)
iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# Allow SSH (restrict to your IP if possible)
# iptables -A INPUT -p tcp --dport 22 -s YOUR_IP -j ACCEPT
iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# Allow ping (optional, can be disabled for security)
# iptables -A INPUT -p icmp --icmp-type echo-request -j ACCEPT

# Rate limit SSH to prevent brute force
iptables -A INPUT -p tcp --dport 22 -m conntrack --ctstate NEW -m recent --set
iptables -A INPUT -p tcp --dport 22 -m conntrack --ctstate NEW -m recent --update --seconds 60 --hitcount 4 -j DROP

# Log dropped packets (optional, for debugging)
# iptables -A INPUT -m limit --limit 5/min -j LOG --log-prefix "IPTables-Dropped: " --log-level 4

# Save rules (persistent after reboot)
if command -v netfilter-persistent &> /dev/null; then
    netfilter-persistent save
elif command -v iptables-save &> /dev/null; then
    iptables-save > /etc/iptables/rules.v4
fi

echo "Firewall configured!"
echo "Allowed ports: 22 (SSH), 80 (HTTP), 443 (HTTPS)"
echo ""

# Show current rules
iptables -L -n -v
