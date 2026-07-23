// frontend/src/pages/VisitorRequestsPage.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, Plus, RefreshCw, X, AlertTriangle, Key } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { RefreshButton } from '../components/ui/RefreshButton';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { SearchBar } from '../components/ui/SearchBar';
import { ActionToolbar } from '../components/ui/ActionToolbar';
import { DataTable } from '../components/ui/DataTable';
import { EmptyState } from '../components/feedback/EmptyState';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import api from '../services/api';
import { toast } from 'sonner';

export const VisitorRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [createdPass, setCreatedPass] = useState(null);

  // Form parameters
  const [form, setForm] = useState({
    visitor_name: '',
    phone_number: '',
    email: '',
    purpose: '',
    host_faculty: '',
    visit_date: '',
    expected_arrival: '09:00',
    expected_departure: '17:00'
  });

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/parent/visitor-requests');
      if (response.data?.success) {
        setRequests(response.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load visitation history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "SecureCampus AI | Visitor Requests";
    fetchRequests();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await api.post('/api/parent/visitor-requests', {
        ...form,
        visitor_type: "Parent"
      });
      if (response.data?.success) {
        toast.success("Visitor request submitted for security clearance review.");
        setIsModalOpen(false);
        setForm({
          visitor_name: '',
          phone_number: '',
          email: '',
          purpose: '',
          host_faculty: '',
          visit_date: '',
          expected_arrival: '09:00',
          expected_departure: '17:00'
        });
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Could not register visitor permit request.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRequests = requests.filter(req => {
    const term = search.toLowerCase();
    return (
      req.visitor_name.toLowerCase().includes(term) ||
      req.purpose.toLowerCase().includes(term) ||
      (req.host_faculty && req.host_faculty.toLowerCase().includes(term))
    );
  });

  const headers = ["ID", "Visit Date", "Visitor Name", "Purpose description", "Mapped Host Faculty", "Clearance Status"];

  const renderRow = (req) => {
    const statusColors = {
      Pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      Approved: "bg-emerald-500/10 text-brand-success border-emerald-500/20",
      Rejected: "bg-red-500/10 text-red-400 border-red-500/20",
      Expired: "bg-slate-500/10 text-brand-secondary border-slate-500/20"
    };

    return (
      <tr key={req.id} className="hover:bg-slate-800/10 transition-colors text-xs text-brand-text">
        <td className="py-3 px-6 font-mono font-bold text-brand-secondary">#{req.id}</td>
        <td className="py-3 px-6 font-mono font-medium">{req.visit_date}</td>
        <td className="py-3 px-6 font-semibold">{req.visitor_name}</td>
        <td className="py-3 px-6 truncate max-w-xs">{req.purpose}</td>
        <td className="py-3 px-6 font-medium text-brand-secondary">{req.host_faculty || '—'}</td>
        <td className="py-3 px-6">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[req.status] || ''}`}>
            {req.status}
          </span>
        </td>
      </tr>
    );
  };

  const customEmptyState = (
    <EmptyState
      icon={Calendar}
      title="No visitor clearance permits found"
      description="Click the button above to request a new visitation permit clearance."
    />
  );

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ name: "Visitor Requests", path: "/visitor-requests" }]} />

      <PageHeader
        title="Visitation Permits & Clearances"
        subtitle="Manage and request temp physical entries and scheduled visitation permits"
      >
        <div className="flex gap-2">
          <RefreshButton
            isRefreshing={isRefreshing}
            setIsRefreshing={setIsRefreshing}
            onRefresh={fetchRequests}
            pageName="Visitor Requests"
          />
          <Button
            variant="primary"
            onClick={() => setIsModalOpen(true)}
            className="h-10 px-4 text-xs font-bold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Visitation Permit</span>
          </Button>
        </div>
      </PageHeader>

      <div className={`space-y-6 transition-opacity duration-300 ${isRefreshing ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
      <ActionToolbar
        searchBar={
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            placeholder="Search visitor logs..."
          />
        }
      />

      <DataTable
        headers={headers}
        rows={filteredRequests}
        renderRow={renderRow}
        loading={loading}
        emptyState={customEmptyState}
      />

      {/* Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-[#334155] rounded-2xl p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-brand-secondary hover:text-brand-text hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-left">
              <h3 className="text-sm font-extrabold text-brand-text">Request Visitation Permit</h3>
              <p className="text-[11px] text-brand-secondary mt-1">Submit scheduled visitation dates for security screening check-ins.</p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Visitor Full Name"
                  name="visitor_name"
                  value={form.visitor_name}
                  onChange={handleInputChange}
                  placeholder="Visitor Name"
                  required
                />
                <Input
                  label="Visitor Email Address"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleInputChange}
                  placeholder="name@example.com"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Visitor Phone Number"
                  name="phone_number"
                  value={form.phone_number}
                  onChange={handleInputChange}
                  placeholder="e.g. +919999999999"
                  required
                />
                <Input
                  label="Host Faculty Name"
                  name="host_faculty"
                  value={form.host_faculty}
                  onChange={handleInputChange}
                  placeholder="e.g. Dr. Sharma (Optional)"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <Input
                    label="Visit Date"
                    name="visit_date"
                    type="date"
                    value={form.visit_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="sm:col-span-1">
                  <Input
                    label="Arrival (HH:MM)"
                    name="expected_arrival"
                    value={form.expected_arrival}
                    onChange={handleInputChange}
                    placeholder="09:00"
                    required
                  />
                </div>
                <div className="sm:col-span-1">
                  <Input
                    label="Departure (HH:MM)"
                    name="expected_departure"
                    value={form.expected_departure}
                    onChange={handleInputChange}
                    placeholder="17:00"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">Purpose of Visit</label>
                <textarea
                  name="purpose"
                  rows="3"
                  value={form.purpose}
                  onChange={handleInputChange}
                  placeholder="Detailed purpose description (minimum 5 chars)..."
                  className="w-full bg-slate-950/60 border border-[#334155]/60 hover:border-[#334155] focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs text-brand-text placeholder-slate-600 focus:outline-none transition-colors"
                  required
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={submitting}
                >
                  Submit Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default VisitorRequestsPage;
