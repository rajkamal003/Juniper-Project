// frontend/src/utils/appDataGenerator.js
import { 
  Terminal, Globe, MessageSquare, Cpu, GraduationCap, 
  BookOpen, HardDrive, Video, Mail, Search, Map, Tv, MessageCircle, 
  FileText, Wifi, Newspaper, FolderLock, Building, CheckSquare, 
  CreditCard, FileSpreadsheet, Bell
} from 'lucide-react';

const appConfig = {
  Student: [
    { name: "VS Code", icon: Terminal, category: "Development", color: "#6366f1" },
    { name: "Chrome", icon: Globe, category: "Search", color: "#ea4335" },
    { name: "Microsoft Teams", icon: MessageSquare, category: "Messaging", color: "#22c55e" },
    { name: "GitHub", icon: Terminal, category: "Development", color: "#6366f1" },
    { name: "ChatGPT", icon: Cpu, category: "Educational", color: "#3b82f6" },
    { name: "KL ERP", icon: GraduationCap, category: "Educational", color: "#3b82f6" },
    { name: "KL LMS", icon: BookOpen, category: "Educational", color: "#3b82f6" },
    { name: "Google Drive", icon: HardDrive, category: "Educational", color: "#3b82f6" },
    { name: "Zoom", icon: Video, category: "Video", color: "#ef4444" }
  ],
  Faculty: [
    { name: "Microsoft Teams", icon: MessageSquare, category: "Messaging", color: "#22c55e" },
    { name: "VS Code", icon: Terminal, category: "Development", color: "#6366f1" },
    { name: "Chrome", icon: Globe, category: "Search", color: "#ea4335" },
    { name: "GitHub", icon: Terminal, category: "Development", color: "#6366f1" },
    { name: "ChatGPT", icon: Cpu, category: "Educational", color: "#3b82f6" },
    { name: "Outlook", icon: Mail, category: "Email", color: "#2563eb" },
    { name: "IEEE Xplore", icon: BookOpen, category: "Research", color: "#a855f7" },
    { name: "ResearchGate", icon: Globe, category: "Research", color: "#a855f7" },
    { name: "Google Drive", icon: HardDrive, category: "Educational", color: "#3b82f6" },
    { name: "Zoom", icon: Video, category: "Video", color: "#ef4444" },
    { name: "Springer", icon: BookOpen, category: "Research", color: "#a855f7" },
    { name: "ScienceDirect", icon: BookOpen, category: "Research", color: "#a855f7" },
    { name: "KL ERP", icon: GraduationCap, category: "Educational", color: "#3b82f6" },
    { name: "KL LMS", icon: BookOpen, category: "Educational", color: "#3b82f6" }
  ],
  Parent: [
    { name: "YouTube", icon: Tv, category: "Video", color: "#ef4444" },
    { name: "Google", icon: Search, category: "Search", color: "#ea4335" },
    { name: "Google Maps", icon: Map, category: "Navigation", color: "#16a34a" },
    { name: "Way2News", icon: Newspaper, category: "News", color: "#f97316" },
    { name: "KL ERP Parent Portal", icon: GraduationCap, category: "Educational", color: "#3b82f6" },
    { name: "WhatsApp", icon: MessageCircle, category: "Messaging", color: "#22c55e" },
    { name: "Gmail", icon: Mail, category: "Email", color: "#2563eb" },
    { name: "DigiLocker", icon: FolderLock, category: "Government", color: "#1e40af" },
    { name: "UMANG", icon: Building, category: "Government", color: "#1e40af" },
    { name: "KL University Website", icon: Globe, category: "Educational", color: "#3b82f6" },
    { name: "Student Attendance Portal", icon: CheckSquare, category: "Educational", color: "#3b82f6" },
    { name: "Fee Payment Portal", icon: CreditCard, category: "Educational", color: "#3b82f6" },
    { name: "Exam Results Portal", icon: FileSpreadsheet, category: "Educational", color: "#3b82f6" },
    { name: "Campus Notifications", icon: Bell, category: "Educational", color: "#3b82f6" }
  ],
  Guest: [
    { name: "Google", icon: Search, category: "Search", color: "#ea4335" },
    { name: "Google Maps", icon: Map, category: "Navigation", color: "#16a34a" },
    { name: "YouTube", icon: Tv, category: "Video", color: "#ef4444" },
    { name: "WhatsApp", icon: MessageCircle, category: "Messaging", color: "#22c55e" },
    { name: "Gmail", icon: Mail, category: "Email", color: "#2563eb" },
    { name: "KL University Website", icon: Globe, category: "Educational", color: "#3b82f6" },
    { name: "Admission Portal", icon: GraduationCap, category: "Educational", color: "#3b82f6" },
    { name: "Visitor WiFi Portal", icon: Wifi, category: "Educational", color: "#3b82f6" }
  ]
};

export const generateAppUsage = (role) => {
  const list = appConfig[role] || [];
  
  // Create randomized values
  const results = list.map(app => {
    const percentage = Math.floor(Math.random() * 85) + 10; // 10% to 95%
    const hours = Math.floor(Math.random() * 3);
    const minutes = Math.floor(Math.random() * 59);
    const timeUsed = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    
    const isGb = Math.random() > 0.4;
    const dataUsed = isGb 
      ? `${(Math.random() * 2.5 + 0.1).toFixed(2)} GB` 
      : `${Math.floor(Math.random() * 800) + 50} MB`;

    return {
      ...app,
      percentage,
      timeUsed,
      dataUsed
    };
  });

  // Sort by percentage descending
  return results.sort((a, b) => b.percentage - a.percentage);
};
