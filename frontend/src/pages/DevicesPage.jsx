// frontend/src/pages/DevicesPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Network, Plus, Trash2, Edit, RefreshCw, X, Shield, Server, Wifi, WifiOff,
  Cpu, HardDrive, Thermometer, Clock, Database, Radio, ToggleLeft, Activity, CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import { PageHeader } from '../components/ui/PageHeader';
import { RefreshButton } from '../components/ui/RefreshButton';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { SearchBar } from '../components/ui/SearchBar';
import { ActionToolbar } from '../components/ui/ActionToolbar';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';

export const DevicesPage = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [viewMode, setViewMode] = useState('front'); // 'front' | 'rear'
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Search and filter states
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Edit Telemetry Form state
  const [isTelemetryModalOpen, setIsTelemetryModalOpen] = useState(false);
  const [telemetryForm, setTelemetryForm] = useState({
    cpu: 15,
    ram: 28,
    temp: 39,
    uptime: '12 days, 4 hours',
    serial: 'JN123X456Y'
  });

  // Default rich Juniper Telemetry dataset
  const defaultJuniperInventory = [
    {
      id: 'juniper-srx300',
      device_name: 'Core-SRX300-Gateway',
      model: 'Juniper SRX300',
      ip_address: '192.168.1.1',
      mac_address: '00:05:85:A1:B2:C3',
      device_type: 'Firewall',
      status: 'Online',
      serial: 'JN-SRX300-98214',
      uptime: '45 days, 8 hours',
      cpu: 18,
      ram: 42,
      temp: 39,
      ports: 8,
      desc: 'Next-Generation Firewall for secure campus perimeter control.',
      img_front: '/images/devices/srx300-front.png',
      img_rear: '/images/devices/srx300_rear.png',
      manufacturer: 'Juniper Networks',
      firmware: 'Junos OS 21.4R3-S5',
      clients: 0,
      throughput: '428 Mbps',
      last_seen: 'Just Now'
    },
    {
      id: 'juniper-ex2300',
      device_name: 'Agg-EX2300-C-Switch',
      model: 'Juniper EX2300-C',
      ip_address: '192.168.1.2',
      mac_address: '00:05:85:D4:E5:F6',
      device_type: 'Switch',
      status: 'Online',
      serial: 'JN-EX2300C-44129',
      uptime: '128 days, 22 hours',
      cpu: 11,
      ram: 35,
      temp: 36,
      ports: 12,
      desc: 'Compact, fanless Gigabit Ethernet distribution switch.',
      img_front: '/images/devices/ex2300-front.png',
      img_rear: '/images/devices/ex2300c_rear.png',
      manufacturer: 'Juniper Networks',
      firmware: 'Junos OS 21.2R2',
      clients: 24,
      throughput: '890 Mbps',
      last_seen: 'Just Now'
    },
    {
      id: 'juniper-ex4100',
      device_name: 'Core-EX4100-Switch',
      model: 'Juniper EX4100',
      ip_address: '192.168.1.5',
      mac_address: '00:05:85:F1:G2:H3',
      device_type: 'Switch',
      status: 'Online',
      serial: 'JN-EX4100-88349',
      uptime: '64 days, 15 hours',
      cpu: 14,
      ram: 41,
      temp: 37,
      ports: 26,
      desc: 'Enterprise-grade Access Switch with Virtual Chassis capability.',
      img_front: '/images/devices/ex4100-front.png',
      img_rear: '/images/devices/ex4100_rear.png',
      manufacturer: 'Juniper Networks',
      firmware: 'Junos OS 22.3R1',
      clients: 52,
      throughput: '2.4 Gbps',
      last_seen: 'Just Now'
    },
    {
      id: 'juniper-ap32',
      device_name: 'AP-Library-01',
      model: 'Juniper AP32',
      ip_address: '192.168.1.3',
      mac_address: '00:05:85:99:88:77',
      device_type: 'Access Point',
      status: 'Online',
      serial: 'JN-AP32-09823',
      uptime: '18 days, 3 hours',
      cpu: 9,
      ram: 19,
      temp: 34,
      ports: 2,
      desc: 'High-performance Wi-Fi 6 Access Point with virtual BLE.',
      img_front: '/images/devices/ap32-front.png',
      img_rear: '/images/devices/ap32_rear.png',
      manufacturer: 'Juniper Networks',
      firmware: 'AP-Firmware 1.2.4',
      clients: 28,
      throughput: '340 Mbps',
      last_seen: 'Just Now'
    },
    {
      id: 'juniper-ap36',
      device_name: 'AP-MainHall-01',
      model: 'Juniper AP36',
      ip_address: '192.168.1.4',
      mac_address: '00:05:85:55:44:33',
      device_type: 'Access Point',
      status: 'Online',
      serial: 'JN-AP36-54128',
      uptime: '6 days, 12 hours',
      cpu: 13,
      ram: 31,
      temp: 35,
      ports: 3,
      desc: 'Premium Wi-Fi 6E Access Point with dedicated scanning radio.',
      img_front: '/images/devices/ap36-front.png',
      img_rear: '/images/devices/ap36_rear.png',
      manufacturer: 'Juniper Networks',
      firmware: 'AP-Firmware 1.3.1',
      clients: 41,
      throughput: '650 Mbps',
      last_seen: 'Just Now'
    }
  ];

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/devices');
      if (response.data && response.data.success && response.data.data.items?.length > 0) {
        // Blend database devices with our rich default Juniper inventory
        const dbItems = response.data.data.items;
        const blended = defaultJuniperInventory.map(def => {
          const match = dbItems.find(db => db.model === def.model || db.device_name === def.device_name);
          if (match) {
            return {
              ...def,
              device_name: match.device_name,
              ip_address: match.ip_address,
              mac_address: match.mac_address,
              status: match.status
            };
          }
          return def;
        });
        setDevices(blended);
        if (!selectedDevice && blended.length > 0) {
          setSelectedDevice(blended[0]);
        }
      } else {
        setDevices(defaultJuniperInventory);
        if (!selectedDevice) setSelectedDevice(defaultJuniperInventory[0]);
      }
    } catch (err) {
      setDevices(defaultJuniperInventory);
      if (!selectedDevice) setSelectedDevice(defaultJuniperInventory[0]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    const randomizedInventory = defaultJuniperInventory.map(dev => {
      const isOnline = dev.status === 'Online';
      return {
        ...dev,
        cpu: isOnline ? Math.floor(Math.random() * 25) + 5 : 0,
        ram: isOnline ? Math.floor(Math.random() * 30) + 20 : 0,
        temp: isOnline ? Math.floor(Math.random() * 15) + 30 : 0,
        clients: isOnline ? (dev.device_type === 'Access Point' ? Math.floor(Math.random() * 50) + 10 : dev.clients) : 0,
        throughput: isOnline ? `${Math.floor(Math.random() * 400) + 100} Mbps` : '0 Mbps'
      };
    });
    setDevices(randomizedInventory);
    if (selectedDevice) {
      const match = randomizedInventory.find(d => d.id === selectedDevice.id);
      if (match) {
        setSelectedDevice(match);
      }
    }
    await fetchDevices();
  };

  useEffect(() => {
    document.title = "SecureCampus AI | Juniper Inventory";
    fetchDevices();
  }, []);

  const handleSyncJuniper = async () => {
    setSyncing(true);
    try {
      const response = await api.post('/api/juniper/sync');
      if (response.data && response.data.success) {
        toast.success('Juniper Inventory synced successfully!');
        fetchDevices();
      }
    } catch (err) {
      toast.error('Sync request completed (using simulation fallback).');
      fetchDevices();
    } finally {
      setSyncing(false);
    }
  };

  const handleOpenTelemetryEdit = () => {
    if (!selectedDevice) return;
    setTelemetryForm({
      cpu: selectedDevice.cpu,
      ram: selectedDevice.ram,
      temp: selectedDevice.temp,
      uptime: selectedDevice.uptime,
      serial: selectedDevice.serial
    });
    setIsTelemetryModalOpen(true);
  };

  const handleSaveTelemetry = (e) => {
    e.preventDefault();
    if (!selectedDevice) return;
    const updated = devices.map(d => 
      d.id === selectedDevice.id 
        ? {
            ...d,
            cpu: parseInt(telemetryForm.cpu),
            ram: parseInt(telemetryForm.ram),
            temp: parseInt(telemetryForm.temp),
            uptime: telemetryForm.uptime,
            serial: telemetryForm.serial
          }
        : d
    );
    setDevices(updated);
    const updatedSelected = updated.find(d => d.id === selectedDevice.id);
    setSelectedDevice(updatedSelected);
    setIsTelemetryModalOpen(false);
    toast.success(`Telemetry parameters updated for ${selectedDevice.model}`);
  };

  // Live simulation telemetry fluctuation
  useEffect(() => {
    const isSimulated = localStorage.getItem('simulation_mode') !== 'false';
    if (!isSimulated) return;

    const interval = setInterval(() => {
      setDevices(prev => 
        prev.map(d => {
          if (d.status === 'Online') {
            const cpuShift = Math.floor(Math.random() * 5) - 2; // -2% to +2%
            const ramShift = Math.floor(Math.random() * 3) - 1; // -1% to +1%
            const tempShift = Math.floor(Math.random() * 3) - 1; // -1°C to +1°C
            return {
              ...d,
              cpu: Math.max(5, Math.min(95, d.cpu + cpuShift)),
              ram: Math.max(10, Math.min(90, d.ram + ramShift)),
              temp: Math.max(25, Math.min(85, d.temp + tempShift))
            };
          }
          return d;
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Update selected device if the devices list changes (e.g. from telemetry simulator)
  useEffect(() => {
    if (selectedDevice) {
      const match = devices.find(d => d.id === selectedDevice.id);
      if (match) setSelectedDevice(match);
    }
  }, [devices]);

  // CSS/SVG Device Render Fallbacks
  const renderDeviceChassis = (model, view) => {
    const isFront = view === 'front';

    if (model === 'Juniper SRX300') {
      return (
        <div className="w-full bg-[#1e293b] border-2 border-slate-700 h-28 rounded-xl relative p-4 flex flex-col justify-between shadow-2xl overflow-hidden font-mono text-[9px]">
          <div className="flex justify-between items-start">
            <span className="font-extrabold text-slate-400">JUNIPER SRX300 GATEWAY</span>
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
          </div>
          {isFront ? (
            /* Front Ethernet ports and status lights */
            <div className="flex items-end justify-between border-t border-slate-800 pt-3">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((port) => (
                  <div key={port} className="flex flex-col items-center">
                    <span className="text-[7px] text-slate-500 mb-1">{port}</span>
                    <div className="w-7 h-7 bg-slate-900 border border-slate-700 rounded flex flex-col justify-between p-0.5 relative group">
                      <div className="flex justify-between w-full">
                        <span className={`w-1 h-1 rounded-full ${Math.random() > 0.3 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`} />
                        <span className={`w-1 h-1 rounded-full ${Math.random() > 0.4 ? 'bg-amber-500' : 'bg-slate-700'}`} />
                      </div>
                      <div className="w-4 h-2 bg-slate-800 mx-auto rounded-b border-t border-slate-600" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-1 items-end pr-2 text-slate-400">
                <span className="text-[7px] text-slate-500">MFA / STAT</span>
                <div className="flex gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="PWR" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="STAT" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600" title="ALM" />
                </div>
              </div>
            </div>
          ) : (
            /* Rear connections */
            <div className="flex items-center justify-between border-t border-slate-800 pt-3">
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-start gap-1">
                  <span className="text-[8px] text-slate-500">POWER INLET</span>
                  <div className="w-10 h-7 bg-slate-950 rounded border border-slate-800 flex items-center justify-center">
                    <div className="w-4 h-4 bg-slate-900 rounded border" />
                  </div>
                </div>
                <div className="w-12 h-6 bg-slate-950 rounded border border-slate-800 flex flex-col justify-center items-center">
                  <span className="text-[6px] text-slate-500">CONSOLE</span>
                  <div className="w-5 h-2.5 bg-[#4f46e5]/40 rounded border border-[#4f46e5]/80" />
                </div>
              </div>
              <div className="text-right text-slate-500 pr-2">
                <span>Made in USA</span>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (model === 'Juniper EX2300-C') {
      return (
        <div className="w-full bg-[#334155] border-2 border-slate-600 h-28 rounded-xl relative p-4 flex flex-col justify-between shadow-2xl overflow-hidden font-mono text-[9px]">
          <div className="flex justify-between items-start">
            <span className="font-extrabold text-slate-300">JUNIPER EX2300-C POE+ SWITCH</span>
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
          </div>
          {isFront ? (
            <div className="flex items-end justify-between border-t border-slate-700 pt-3">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((port) => (
                  <div key={port} className="flex flex-col items-center">
                    <span className="text-[6px] text-slate-400 mb-0.5">{port}</span>
                    <div className="w-5 h-6 bg-slate-950 border border-slate-800 rounded flex flex-col justify-between p-0.5 relative">
                      <span className={`w-1 h-1 rounded-full mx-auto ${Math.random() > 0.2 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`} />
                      <div className="w-3.5 h-1.5 bg-slate-800 mx-auto rounded-b" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 items-center bg-slate-900/60 p-1 rounded border border-slate-850">
                <span className="text-[6px] text-slate-400">SFP+ 1/2</span>
                <div className="w-6 h-5 bg-[#4f46e5]/10 border border-[#4f46e5]/40 rounded" />
                <div className="w-6 h-5 bg-[#4f46e5]/10 border border-[#4f46e5]/40 rounded" />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between border-t border-slate-700 pt-3">
              <div className="flex items-center gap-8">
                <div className="flex flex-col gap-1">
                  <span className="text-[7px] text-slate-400">POWER AC</span>
                  <div className="w-12 h-6 bg-slate-950 rounded border flex items-center justify-center" />
                </div>
                <div className="w-10 h-6 border-dashed border border-slate-500 flex items-center justify-center text-[7px] text-slate-400">
                  GROUND
                </div>
              </div>
              <div className="text-slate-500 pr-2">
                <span>FANLESS HEATSINK</span>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (model === 'Juniper EX4100') {
      return (
        <div className="w-full bg-[#1e293b] border-2 border-slate-700 h-28 rounded-xl relative p-4 flex flex-col justify-between shadow-2xl overflow-hidden font-mono text-[9px]">
          <div className="flex justify-between items-start">
            <span className="font-extrabold text-slate-300">JUNIPER EX4100 24-PORT POE+ ACCESS SWITCH</span>
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
          {isFront ? (
            <div className="flex items-end justify-between border-t border-slate-800 pt-3">
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24].map((port) => (
                  <div key={port} className="flex flex-col items-center">
                    <span className="text-[5px] text-slate-500 mb-0.5">{port}</span>
                    <div className="w-3.5 h-5 bg-slate-950 border border-slate-800 rounded flex flex-col justify-between p-0.5 relative">
                      <span className={`w-1 h-1 rounded-full mx-auto ${Math.random() > 0.3 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`} />
                      <div className="w-2.5 h-1 bg-slate-800 mx-auto rounded-b" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-1 items-center bg-slate-900/60 p-0.5 rounded border border-slate-800">
                <span className="text-[5px] text-slate-500">UPLINKS</span>
                <div className="w-4 h-4 bg-[#4f46e5]/20 border border-[#4f46e5]/60 rounded" />
                <div className="w-4 h-4 bg-[#4f46e5]/20 border border-[#4f46e5]/60 rounded animate-pulse" />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between border-t border-slate-800 pt-3">
              <div className="flex items-center gap-6">
                <div className="flex flex-col gap-1">
                  <span className="text-[7px] text-slate-400">DUAL HOT-SWAP AC POWER</span>
                  <div className="flex gap-2">
                    <div className="w-12 h-6 bg-slate-950 rounded border flex items-center justify-center text-[6px] text-slate-500">PSU 1</div>
                    <div className="w-12 h-6 bg-slate-950 rounded border flex items-center justify-center text-[6px] text-slate-500">PSU 2</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 items-center text-slate-400">
                <span className="text-[6px] text-slate-500">SYSTEM FANS</span>
                <div className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center animate-spin">🌀</div>
                <div className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center animate-spin">🌀</div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Access Point dome front and ports rear
    return (
      <div className="w-full bg-slate-900 border-2 border-slate-700 h-28 rounded-xl relative p-4 flex flex-col justify-between shadow-2xl overflow-hidden font-mono text-[9px]">
        {isFront ? (
          /* Smooth elegant dome AP view */
          <div className="flex flex-col justify-center items-center h-full gap-2 relative">
            <span className="font-extrabold text-slate-500 tracking-wider text-[8px] uppercase">{model}</span>
            <div className="w-12 h-12 rounded-full bg-slate-850 border border-slate-700 flex items-center justify-center relative shadow-lg">
              <div className="w-3.5 h-3.5 rounded-full bg-indigo-500/20 border border-indigo-400 flex items-center justify-center animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              </div>
            </div>
          </div>
        ) : (
          /* Rear details - ports and mounts */
          <div className="flex flex-col justify-between h-full">
            <div className="flex justify-between items-center text-slate-500">
              <span>{model} AP MOUNT CHASSIS</span>
              <span className="text-[7px]">802.11AX WIFI6</span>
            </div>
            <div className="flex justify-start gap-4 border-t border-slate-800 pt-3">
              <div className="flex flex-col items-center">
                <span className="text-[6px] text-slate-500">ETH0/POE+</span>
                <div className="w-6 h-5 bg-slate-950 border border-slate-800 rounded flex items-center justify-center">
                  <div className="w-3 h-2 bg-indigo-500/40 border border-indigo-500 rounded-sm" />
                </div>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[6px] text-slate-500">CONSOLE</span>
                <div className="w-6 h-5 bg-slate-950 border border-slate-800 rounded" />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const filteredDevices = devices.filter(d => {
    // Search filter
    const matchesSearch = 
      d.device_name.toLowerCase().includes(search.toLowerCase()) ||
      d.model.toLowerCase().includes(search.toLowerCase()) ||
      d.ip_address.toLowerCase().includes(search.toLowerCase()) ||
      d.mac_address.toLowerCase().includes(search.toLowerCase()) ||
      d.serial.toLowerCase().includes(search.toLowerCase());

    // Type filter
    const matchesType = !typeFilter || d.device_type === typeFilter;

    // Status filter
    const matchesStatus = !statusFilter || d.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6 text-left select-none">
      <Breadcrumb items={[{ name: "Juniper Inventory", path: "/devices" }]} />
      
      <PageHeader 
        title="Juniper Hardware Console" 
        subtitle="Review, sync, and inspect live Juniper AP32, AP36, EX2300-C, EX4100, and SRX300 physical telemetry"
      >
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            onClick={handleSyncJuniper}
            loading={syncing}
            className="h-10 px-4 text-xs font-bold flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>Sync Hardware Telemetry</span>
          </Button>
          <RefreshButton
            isRefreshing={isRefreshing}
            setIsRefreshing={setIsRefreshing}
            onRefresh={handleRefresh}
            pageName="Devices"
          />
        </div>
      </PageHeader>

      <div className={`transition-opacity duration-300 ${isRefreshing ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
      <ActionToolbar
        searchBar={
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            placeholder="Search Juniper inventory..."
          />
        }
        actions={
          <div className="flex gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold outline-none"
            >
              <option value="">All Types</option>
              <option value="Firewall">Firewall</option>
              <option value="Switch">Switch</option>
              <option value="Access Point">Access Point</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
              <option value="Warning">Warning</option>
            </select>
          </div>
        }
      />
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 transition-opacity duration-300 ${isRefreshing ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
        {/* Left Side: Inventory Catalog list (1 Col) */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider pl-1">Hardware Directory</h3>
          
          <div className="space-y-3.5">
            {filteredDevices.map((dev) => {
              const isSelected = selectedDevice && selectedDevice.id === dev.id;
              const DeviceIcon = dev.device_type === 'Firewall' ? Shield : dev.device_type === 'Switch' ? Server : Wifi;
              return (
                <div
                  key={dev.id}
                  onClick={() => { setSelectedDevice(dev); setViewMode('front'); }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer text-left relative overflow-hidden ${
                    isSelected 
                      ? 'bg-white border-blue-500 shadow-md scale-[1.01]' 
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl border ${isSelected ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                        <DeviceIcon className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-800 leading-tight">{dev.device_name}</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">{dev.model} • {dev.device_type}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-bold">
                      <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{dev.status}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-500 font-mono">
                    <div>
                      <span className="block text-[8px] uppercase tracking-wider text-slate-400">CPU</span>
                      <span className="font-bold text-slate-700">{dev.cpu}%</span>
                    </div>
                    <div>
                      <span className="block text-[8px] uppercase tracking-wider text-slate-400">Temp</span>
                      <span className="font-bold text-slate-700">{dev.temp}°C</span>
                    </div>
                    <div>
                      <span className="block text-[8px] uppercase tracking-wider text-slate-400">IP Address</span>
                      <span className="font-bold text-blue-600 truncate block">{dev.ip_address}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Detailed Device Inspector (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {selectedDevice ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
              {/* Header Title */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">{selectedDevice.model}</h2>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                      {selectedDevice.device_type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{selectedDevice.desc}</p>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="secondary" 
                    onClick={handleOpenTelemetryEdit}
                    className="h-9 px-3.5 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Edit Telemetry</span>
                  </Button>
                </div>
              </div>

              {/* Front/Rear View Toggle Box */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider font-mono">Chassis Diagram</span>
                  <div className="bg-slate-100 p-0.5 rounded-xl border border-slate-200 flex">
                    <button
                      onClick={() => setViewMode('front')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wide uppercase transition-colors cursor-pointer ${
                        viewMode === 'front' 
                          ? 'bg-blue-600 text-white font-extrabold' 
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Front Panel
                    </button>
                    <button
                      onClick={() => setViewMode('rear')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wide uppercase transition-colors cursor-pointer ${
                        viewMode === 'rear' 
                          ? 'bg-blue-600 text-white font-extrabold' 
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Rear Panel
                    </button>
                  </div>
                </div>

                {/* Device Chassis Box */}
                <div className="p-1 rounded-2xl bg-slate-50 border border-slate-200">
                  {renderDeviceChassis(selectedDevice.model, viewMode)}
                </div>
              </div>

              {/* Hardware Telemetry Parameters Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#334155]/20">
                {/* Physical metrics & Image */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider font-mono">Device Image & Stats</h4>
                  
                  {/* Large Product Image with Fallback */}
                  <div className="w-full h-52 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center p-6 relative overflow-hidden group select-none">
                    <img 
                      src={viewMode === 'rear' ? selectedDevice.img_rear : selectedDevice.img_front} 
                      alt={`${selectedDevice.model} ${viewMode === 'rear' ? 'Rear' : 'Front'} Panel`}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                      className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-md"
                    />
                    <div className="hidden flex-col items-center justify-center text-slate-400" style={{ display: 'none' }}>
                      <WifiOff className="w-8 h-8 text-slate-300 mb-2" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">No Image Available</span>
                    </div>
                    {/* Panel label badge */}
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-white/80 border border-slate-200 text-[9px] font-bold uppercase tracking-wider text-slate-500 shadow-xs">
                      {viewMode === 'rear' ? 'Rear Panel' : 'Front Panel'}
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    {/* CPU metric */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1.5">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                          <span>CPU Utilization</span>
                        </span>
                        <span className="font-mono text-slate-800">{selectedDevice.cpu}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                          style={{ width: `${selectedDevice.cpu}%` }}
                        />
                      </div>
                    </div>

                    {/* RAM metric */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1.5">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <HardDrive className="w-3.5 h-3.5 text-purple-600" />
                          <span>RAM Utilization</span>
                        </span>
                        <span className="font-mono text-slate-800">{selectedDevice.ram}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500 rounded-full transition-all duration-500" 
                          style={{ width: `${selectedDevice.ram}%` }}
                        />
                      </div>
                    </div>

                    {/* Temp metric */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1.5">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                          <span>Chassis Temperature</span>
                        </span>
                        <span className="font-mono text-slate-800">{selectedDevice.temp}°C</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            selectedDevice.temp > 50 ? 'bg-red-500' : selectedDevice.temp > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`} 
                          style={{ width: `${(selectedDevice.temp / 100) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Network / Hardware metadata */}
                <div className="space-y-4 font-mono text-xs">
                  <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider font-mono">Device Details</h4>
                  
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3 text-left">
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500 uppercase text-[9px] tracking-wider font-bold">Manufacturer</span>
                      <span className="text-slate-800 font-bold">{selectedDevice.manufacturer || 'Juniper Networks'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500 uppercase text-[9px] tracking-wider font-bold">Firmware</span>
                      <span className="text-slate-800 font-bold">{selectedDevice.firmware || 'Junos OS 21.4R3'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500 uppercase text-[9px] tracking-wider font-bold">Serial Number</span>
                      <span className="text-slate-800 font-bold">{selectedDevice.serial}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500 uppercase text-[9px] tracking-wider font-bold">Device Uptime</span>
                      <span className="text-slate-800 font-bold">{selectedDevice.uptime}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500 uppercase text-[9px] tracking-wider font-bold">Connected Clients</span>
                      <span className="text-slate-800 font-bold">{selectedDevice.clients}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500 uppercase text-[9px] tracking-wider font-bold">Throughput</span>
                      <span className="text-blue-600 font-bold">{selectedDevice.throughput}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500 uppercase text-[9px] tracking-wider font-bold">IP Address</span>
                      <span className="text-blue-600 font-bold">{selectedDevice.ip_address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 uppercase text-[9px] tracking-wider font-bold">MAC Address</span>
                      <span className="text-slate-800 font-bold">{selectedDevice.mac_address}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 h-96 rounded-3xl flex flex-col items-center justify-center text-slate-400 shadow-xs">
              <Network className="w-12 h-12 text-slate-300 mb-4" />
              <p className="text-slate-500 text-sm font-semibold">Select a Juniper device to inspect details.</p>
            </div>
          )}
        </div>
      </div>

      {/* Network Topology Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6 select-none mt-6">
        <style>{`
          @keyframes packetFlow {
            0% { left: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { left: 100%; opacity: 0; }
          }
          .animate-packet {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            width: 6px;
            height: 6px;
            background-color: #3b82f6;
            border-radius: 50%;
            animation: packetFlow 1.8s linear infinite;
          }
        `}</style>
        <div>
          <h3 className="text-lg font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <Network className="w-5 h-5 text-blue-600" />
            <span>Mist AI Live Campus Topology Map</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">Hierarchical visualization of security gateways, switches, access points, and clients</p>
        </div>

        <div className="overflow-x-auto py-4">
          <div className="min-w-[800px] flex items-center justify-between gap-4 px-4">
            
            {/* Internet */}
            <div className="flex flex-col items-center w-24">
              <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shadow-xs">
                🌐
              </div>
              <span className="text-[10px] font-bold text-slate-700 mt-2">Internet</span>
              <span className="text-[8px] text-slate-400">Gateway WAN</span>
            </div>

            {/* Connection: Internet -> SRX300 */}
            <div className="relative w-16 h-1 shrink-0 bg-slate-100 rounded">
              <div className="animate-packet" style={{ animationDelay: '0s' }} />
            </div>

            {/* Firewall SRX300 */}
            <div className="flex flex-col items-center w-28">
              <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 font-bold text-[9px] text-center px-1 shadow-xs">
                SRX300
              </div>
              <span className="text-[10px] font-bold text-slate-700 mt-2">SRX300 Gateway</span>
              <span className="text-[8px] text-red-500">Firewall Active</span>
            </div>

            {/* Connection: SRX300 -> EX4100 */}
            <div className="relative w-16 h-1 shrink-0 bg-slate-100 rounded">
              <div className="animate-packet" style={{ animationDelay: '0.36s' }} />
            </div>

            {/* Core EX4100 */}
            <div className="flex flex-col items-center w-28">
              <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 font-bold text-[9px] text-center px-1 shadow-xs">
                EX4100
              </div>
              <span className="text-[10px] font-bold text-slate-700 mt-2">EX4100 Switch</span>
              <span className="text-[8px] text-slate-400 font-bold text-purple-600">Core Layer</span>
            </div>

            {/* Connection: EX4100 -> EX2300-C */}
            <div className="relative w-16 h-1 shrink-0 bg-slate-100 rounded">
              <div className="animate-packet" style={{ animationDelay: '0.72s' }} />
            </div>

            {/* Agg EX2300-C */}
            <div className="flex flex-col items-center w-28">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-[9px] text-center px-1 shadow-xs">
                EX2300-C
              </div>
              <span className="text-[10px] font-bold text-slate-700 mt-2">EX2300-C Switch</span>
              <span className="text-[8px] text-slate-400 font-bold text-indigo-600">Distribution</span>
            </div>

            {/* Connection: EX2300-C -> APs */}
            <div className="relative w-16 h-1 shrink-0 bg-slate-100 rounded">
              <div className="animate-packet" style={{ animationDelay: '1.08s' }} />
            </div>

            {/* APs */}
            <div className="flex flex-col items-center w-28">
              <div className="flex gap-1.5">
                <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-[8px] shadow-xs">
                  AP32
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-[8px] shadow-xs">
                  AP36
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-700 mt-2">Mist APs</span>
              <span className="text-[8px] text-emerald-600">Wi-Fi 6 / 6E Active</span>
            </div>

            {/* Connection: APs -> Users */}
            <div className="relative w-16 h-1 shrink-0 bg-slate-100 rounded">
              <div className="animate-packet" style={{ animationDelay: '1.44s' }} />
            </div>

            {/* Clients */}
            <div className="flex flex-col items-center w-36 bg-slate-50 p-2.5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[9px] font-extrabold uppercase text-slate-400 mb-1.5 tracking-wider block">Connected Subnets</span>
              <div className="flex flex-wrap gap-1 justify-center max-w-[150px]">
                {['Students', 'Faculty', 'Parents', 'Guests', 'IoT Devices', 'Printers', 'CCTV'].map((client) => (
                  <span key={client} className="text-[7px] bg-white text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 font-bold">
                    {client}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Edit Telemetry Modal */}
      {isTelemetryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0f172a]/60 backdrop-blur-xs" onClick={() => setIsTelemetryModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl z-10 text-left">
            <div className="flex justify-between items-start mb-5">
              <h3 className="text-base font-bold text-brand-text flex items-center gap-2">
                <Activity className="w-5 h-5 text-brand-primary" />
                <span>Adjust Device Telemetry</span>
              </h3>
              <button onClick={() => setIsTelemetryModalOpen(false)} className="text-[#94a3b8] hover:text-[#f8fafc] transition-colors focus:outline-none">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleSaveTelemetry} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">CPU Utilization (%)</label>
                <input 
                  type="number" 
                  min="0" 
                  max="100"
                  value={telemetryForm.cpu}
                  onChange={(e) => setTelemetryForm({ ...telemetryForm, cpu: e.target.value })}
                  className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">RAM Utilization (%)</label>
                <input 
                  type="number" 
                  min="0" 
                  max="100"
                  value={telemetryForm.ram}
                  onChange={(e) => setTelemetryForm({ ...telemetryForm, ram: e.target.value })}
                  className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Chassis Temp (°C)</label>
                <input 
                  type="number" 
                  min="0" 
                  max="100"
                  value={telemetryForm.temp}
                  onChange={(e) => setTelemetryForm({ ...telemetryForm, temp: e.target.value })}
                  className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Uptime String</label>
                <input 
                  type="text" 
                  value={telemetryForm.uptime}
                  onChange={(e) => setTelemetryForm({ ...telemetryForm, uptime: e.target.value })}
                  className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Serial Number</label>
                <input 
                  type="text" 
                  value={telemetryForm.serial}
                  onChange={(e) => setTelemetryForm({ ...telemetryForm, serial: e.target.value })}
                  className="w-full h-11 px-4 bg-slate-950 border border-slate-800 rounded-xl text-brand-text text-sm outline-none focus:border-brand-primary"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <Button type="button" variant="secondary" onClick={() => setIsTelemetryModalOpen(false)} className="h-10 px-4 w-auto">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="h-10 px-4 w-auto font-bold">
                  Save Parameters
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevicesPage;
