// frontend/src/services/simulationEngine.js

// Predefined lists for generating logical data
const IP_RANGES = [
  '192.168.10.0/24', '192.168.20.0/24', '192.168.30.0/24', '192.168.40.0/24',
  '192.168.50.0/24', '10.0.10.0/24', '10.0.20.0/24', '10.0.30.0/24',
  '172.16.10.0/24', '172.16.20.0/24', '10.100.1.0/24', '10.200.5.0/24'
];

const PROTOCOLS = ['TCP', 'UDP', 'ICMP', 'ANY'];
const ACTIONS = ['ALLOW', 'DENY', 'REJECT', 'LOG'];
const OWNERS = ['SecOps Admin', 'NetOps Bot', 'CISCO-Controller', 'Juniper-MIST-API', 'PolicyEngine'];
const REASONS = [
  'Block malicious port scanning activity',
  'Allow student gateway access',
  'Redirect guest traffic to portal',
  'Block untrusted torrent tracker range',
  'Allow Faculty ERP access',
  'Restrict IoT devices access to database',
  'Limit parent login endpoints',
  'Enforce secure VPN endpoint route'
];

const RULE_NAMES = [
  'INBOUND_ACADEMIC_SSH', 'OUTBOUND_WEB_SECURE', 'GUEST_REDIRECT_CAPTIVE',
  'MALICIOUS_TRACKER_DROP', 'FACULTY_PORTAL_BYPASS', 'IOT_DB_LIMITER',
  'PARENT_OTP_BLOCK', 'VPN_GATEWAY_ENFORCE', 'DNS_RESOLVER_ALLOW',
  'SMTP_RELAY_DENY', 'API_CONTROLLER_INSPECT', 'LOAD_BALANCER_UDP'
];

const DESTINATIONS = ['any', '10.0.0.0/8', '8.8.8.8', '192.168.1.1', '10.10.20.5', 'https://instagram.com', 'https://github.com'];

// Helper to generate a random IP address
const randomIP = () => {
  return `${Math.floor(Math.random() * 223) + 1}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 254) + 1}`;
};

export const simulationEngine = {
  // Generate random subnets between 10 and 20 records
  generateSubnets() {
    const count = Math.floor(Math.random() * 11) + 10; // 10 to 20 subnets
    const subnets = [];

    for (let i = 0; i < count; i++) {
      const vlanId = Math.floor(Math.random() * 4094) + 1;
      const activeClients = Math.floor(Math.random() * 350) + 5;
      const apCount = Math.floor(Math.random() * 18) + 2;
      
      const up = (Math.random() * 450 + 10).toFixed(1);
      const down = (Math.random() * 850 + 50).toFixed(1);

      subnets.push({
        id: `subnet-${i}-${Date.now()}`,
        subnet_range: IP_RANGES[i % IP_RANGES.length] || `192.168.${100 + i}.0/24`,
        gateway: `192.168.${100 + i}.1`,
        vlan_id: vlanId,
        subnet_mask: '255.255.255.0',
        active_clients: activeClients,
        connected_devices: Math.floor(activeClients * 1.5),
        ap_count: apCount,
        bandwidth_usage: `${((parseFloat(up) + parseFloat(down)) / 10).toFixed(1)} Gbps`,
        upload: `${up} Mbps`,
        download: `${down} Mbps`,
        packet_loss: `${(Math.random() * 0.15).toFixed(3)}%`,
        latency: `${(Math.random() * 12 + 2).toFixed(1)} ms`,
        signal_health: `${Math.floor(Math.random() * 15) + 85}%`, // 85% to 100%
        network_health: `${(Math.random() * 2 + 98).toFixed(2)}%`, // 98% to 100%
        status: Math.random() > 0.08 ? 'Active' : 'Warning',
        traffic: Math.random() > 0.5 ? 'High' : 'Normal',
        last_updated: new Date().toISOString()
      });
    }

    return subnets;
  },

  // Calculate Subnet Overview Metrics
  calculateSubnetStats(subnets) {
    if (!subnets || subnets.length === 0) return { health: '0%', latency: '0 ms', loss: '0%', clients: 0 };
    
    let totalHealth = 0;
    let totalLatency = 0;
    let totalLoss = 0;
    let totalClients = 0;

    subnets.forEach(s => {
      totalHealth += parseFloat(s.network_health);
      totalLatency += parseFloat(s.latency);
      totalLoss += parseFloat(s.packet_loss);
      totalClients += s.active_clients;
    });

    return {
      health: `${(totalHealth / subnets.length).toFixed(2)}%`,
      latency: `${(totalLatency / subnets.length).toFixed(1)} ms`,
      loss: `${(totalLoss / subnets.length).toFixed(3)}%`,
      clients: totalClients
    };
  },

  // Generate dynamic firewall rules
  generateFirewallRules() {
    const count = Math.floor(Math.random() * 9) + 12; // 12 to 20 rules
    const rules = [];

    // Create unique random priorities
    const priorities = [];
    while (priorities.length < count) {
      const prio = Math.floor(Math.random() * 190) + 10;
      if (!priorities.includes(prio)) {
        priorities.push(prio);
      }
    }

    for (let i = 0; i < count; i++) {
      const policy = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
      const protocol = PROTOCOLS[Math.floor(Math.random() * PROTOCOLS.length)];
      const logs = Math.floor(Math.random() * 4500) + 10;
      const allowedLogs = policy === 'ALLOW' ? logs : 0;
      const blockedLogs = policy !== 'ALLOW' ? logs : 0;

      rules.push({
        id: `rule-${i}-${Date.now()}-${Math.random()}`,
        rule_name: RULE_NAMES[i % RULE_NAMES.length] || `RULE_GEN_${i}`,
        priority: priorities[i],
        source_ip: Math.random() > 0.3 ? randomIP() : 'any',
        destination: DESTINATIONS[Math.floor(Math.random() * DESTINATIONS.length)],
        source_port: Math.random() > 0.5 ? `${Math.floor(Math.random() * 65534) + 1}` : 'any',
        port: protocol === 'ICMP' ? 'any' : `${Math.floor(Math.random() * 9000) + 80}`, // Destination Port
        protocol: protocol,
        policy: policy,
        status: Math.random() > 0.15 ? 'Active' : 'Disabled',
        allowed_logs: allowedLogs,
        blocked_logs: blockedLogs,
        logs_count: logs,
        threat_score: Math.floor(Math.random() * 85),
        created_at: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString(),
        expiration_time: Math.random() > 0.7 ? new Date(Date.now() + 864000000).toISOString() : 'Never',
        rule_owner: OWNERS[Math.floor(Math.random() * OWNERS.length)],
        reason: REASONS[Math.floor(Math.random() * REASONS.length)]
      });
    }

    // Return the generated set in a randomized sorting order (not sorted by priority, or sorted differently)
    // The requirement states "Randomize the rule order" on refresh, let's keep it randomized!
    return rules;
  },

  // Calculate Firewall Stats
  calculateFirewallStats(rules) {
    if (!rules || rules.length === 0) return { activeRules: 0, blockCount: 0, threatScore: 0, blockedDomains: 0 };
    
    let activeRules = 0;
    let blockCount = 0;
    let maxThreat = 0;

    rules.forEach(r => {
      if (r.status === 'Active') {
        activeRules++;
      }
      blockCount += r.blocked_logs;
      if (r.threat_score > maxThreat) {
        maxThreat = r.threat_score;
      }
    });

    return {
      activeRules,
      blockCount,
      threatScore: maxThreat,
      blockedDomains: Math.floor(activeRules * 1.5)
    };
  }
};
