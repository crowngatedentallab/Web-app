import React, { useState, useEffect } from 'react';
import { sheetService } from '../services/sheetService';
import { generateLabInsights } from '../services/geminiService';
import { Order, OrderStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { EditableField } from '../components/EditableField';
import { RefreshCw, Download, Sparkles, Filter, Trash2, TrendingUp, AlertTriangle, CheckSquare } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<string>('');
  const [generatingInsights, setGeneratingInsights] = useState(false);

  useEffect(() => {
    loadOrders();
    const unsubscribe = sheetService.subscribe(loadOrders);
    return unsubscribe;
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    const data = await sheetService.getOrders();
    setOrders(data);
    setLoading(false);
  };

  const handleUpdate = async (id: string, field: keyof Order, value: string) => {
    await sheetService.updateOrder(id, { [field]: value });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this order?')) {
      await sheetService.deleteOrder(id);
    }
  };

  const fetchInsights = async () => {
    setGeneratingInsights(true);
    const result = await generateLabInsights(orders);
    setInsights(result);
    setGeneratingInsights(false);
  };

  const statusData = Object.values(OrderStatus).map(status => ({
    name: status,
    count: orders.filter(o => o.status === status).length
  }));

  // Simple stats
  const revenue = orders.length * 150; // Mock avg price
  const activeCount = orders.filter(o => o.status !== OrderStatus.DELIVERED).length;

  return (
    <div className="p-6 mt-12 min-h-screen bg-slate-50">
      
      {/* Header / Control Bar */}
      <div className="bg-white border-b border-slate-200 -mx-6 px-6 py-4 mb-8 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Operations Dashboard</h1>
          <p className="text-slate-500 text-sm">Overview of manufacturing and logistics</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={fetchInsights}
            disabled={generatingInsights}
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded shadow-sm hover:shadow-md transition-all text-sm font-medium"
          >
            <Sparkles size={16} className={generatingInsights ? 'animate-spin' : ''} />
            <span>{generatingInsights ? 'Processing...' : 'AI Insights'}</span>
          </button>
          <button className="flex items-center space-x-2 bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded hover:bg-slate-50 text-sm font-medium">
            <Download size={16} />
            <span>CSV</span>
          </button>
          <button onClick={loadOrders} className="flex items-center space-x-2 bg-brand-700 text-white px-4 py-2 rounded shadow-sm hover:bg-brand-800 text-sm font-medium">
            <RefreshCw size={16} />
            <span>Sync Master Sheet</span>
          </button>
        </div>
      </div>

      {/* AI Insights Banner */}
      {insights && (
        <div className="mb-8 bg-indigo-50 border border-indigo-100 p-6 rounded-lg relative overflow-hidden shadow-sm">
          <div className="flex gap-4">
            <div className="bg-indigo-100 p-2 rounded-lg h-fit">
                <Sparkles size={20} className="text-indigo-600" />
            </div>
            <div>
                <h3 className="font-bold text-indigo-900 mb-1">Production Intelligence</h3>
                <div className="text-indigo-800 whitespace-pre-line text-sm leading-relaxed">
                    {insights}
                </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Est. Revenue</p>
                <p className="text-2xl font-bold text-slate-800">${revenue.toLocaleString()}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-full text-green-600"><TrendingUp size={24} /></div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Active Orders</p>
                <p className="text-2xl font-bold text-slate-800">{activeCount}</p>
            </div>
            <div className="bg-brand-50 p-3 rounded-full text-brand-600"><CheckSquare size={24} /></div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Urgent Cases</p>
                <p className="text-2xl font-bold text-red-600">{orders.filter(o => o.priority === 'Urgent').length}</p>
            </div>
            <div className="bg-red-50 p-3 rounded-full text-red-600"><AlertTriangle size={24} /></div>
        </div>
      </div>

      {/* Analytics & Data Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Chart */}
        <div className="lg:col-span-3 bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-wider">Workflow Volume</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} interval={0} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '4px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#1e293b' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={'#1e3a8a'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Master Data Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <Filter size={16} />
            Master Production Schedule
          </h2>
          <span className="text-xs text-slate-500">Double-click fields to edit inline</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-semibold">Order ID</th>
                <th className="px-6 py-3 font-semibold">Patient</th>
                <th className="px-6 py-3 font-semibold">Clinic / Dr.</th>
                <th className="px-6 py-3 font-semibold">Type</th>
                <th className="px-6 py-3 font-semibold">Due Date</th>
                <th className="px-6 py-3 font-semibold">Stage</th>
                <th className="px-6 py-3 font-semibold">Notes</th>
                <th className="px-6 py-3 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order, idx) => (
                <tr key={order.id} className={`hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                  <td className="px-6 py-3 font-mono text-xs text-slate-400">{order.id}</td>
                  <td className="px-6 py-3 font-medium text-slate-900">
                    <EditableField value={order.patientName} onSave={(v) => handleUpdate(order.id, 'patientName', v)} />
                  </td>
                  <td className="px-6 py-3">
                     <EditableField value={order.doctorName} onSave={(v) => handleUpdate(order.id, 'doctorName', v)} />
                  </td>
                  <td className="px-6 py-3">
                    <EditableField value={order.typeOfWork} onSave={(v) => handleUpdate(order.id, 'typeOfWork', v)} />
                  </td>
                  <td className="px-6 py-3">
                    <EditableField type="date" value={order.dueDate} onSave={(v) => handleUpdate(order.id, 'dueDate', v)} />
                  </td>
                  <td className="px-6 py-3">
                    <EditableField 
                      type="select" 
                      value={order.status} 
                      options={Object.values(OrderStatus)}
                      onSave={(v) => handleUpdate(order.id, 'status', v)} 
                    />
                  </td>
                  <td className="px-6 py-3 max-w-xs truncate text-xs">
                    <EditableField value={order.notes || ''} onSave={(v) => handleUpdate(order.id, 'notes', v)} />
                  </td>
                  <td className="px-6 py-3 text-center">
                    <button 
                      onClick={() => handleDelete(order.id)}
                      className="text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};