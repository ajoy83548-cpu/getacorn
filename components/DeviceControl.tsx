import React, { useState } from 'react';
import { Device } from '../types';
import { processDeviceCommand } from '../services/geminiService';

const DeviceControl: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([
    { id: '1', name: 'Living Room Light', type: 'light', status: 'off', location: 'Living Room', value: 0 },
    { id: '2', name: 'Main Laptop', type: 'computer', status: 'on', location: 'Office' },
    { id: '3', name: 'Front Door', type: 'lock', status: 'locked', location: 'Entrance' },
    { id: '4', name: 'Thermostat', type: 'thermostat', status: 'on', value: 72, location: 'Hallway' }
  ]);
  const [command, setCommand] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const updateDevice = (id: string, updates: Partial<Device>) => {
    setDevices(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const handleCommand = async () => {
    if (!command.trim()) return;
    setIsProcessing(true);
    setAiResponse('');
    
    try {
      const response = await processDeviceCommand(command, devices, updateDevice);
      setAiResponse(response);
    } catch (error) {
      setAiResponse("Failed to process command.");
    } finally {
      setIsProcessing(false);
      setCommand('');
    }
  };

  const renderDeviceIcon = (device: Device) => {
    switch(device.type) {
        case 'light': return (
            <svg className={`w-8 h-8 ${device.status === 'on' ? 'text-yellow-400' : 'text-slate-600'}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>
        );
        case 'computer': return (
            <svg className={`w-8 h-8 ${device.status === 'on' ? 'text-blue-400' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
        );
        case 'lock': return (
            device.status === 'locked' 
            ? <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            : <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
        );
        case 'thermostat': return (
            <div className="w-8 h-8 rounded-full border-2 border-orange-500 flex items-center justify-center text-xs font-bold text-orange-400">
                {device.value}°
            </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
      <div className="p-4 bg-slate-800 border-b border-slate-700">
        <h2 className="text-xl font-bold text-orange-400 flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
          Device Control Hub
        </h2>
      </div>

      <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
        {/* Grid of Devices */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {devices.map(device => (
                <div key={device.id} className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col items-center gap-3 shadow-lg transition-transform hover:-translate-y-1">
                    {renderDeviceIcon(device)}
                    <div className="text-center">
                        <h3 className="font-bold text-white">{device.name}</h3>
                        <p className="text-sm text-slate-400">{device.location}</p>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full uppercase tracking-wider font-bold ${
                        device.status === 'on' || device.status === 'unlocked' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'
                    }`}>
                        {device.status}
                    </div>
                </div>
            ))}
        </div>

        {/* Command Interface */}
        <div className="mt-auto bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Command Center</h3>
            {aiResponse && (
                <div className="mb-4 p-3 bg-slate-900 border border-slate-600 rounded-lg text-emerald-400 text-sm font-mono">
                    {">"} {aiResponse}
                </div>
            )}
            <div className="flex gap-2">
                <input 
                    type="text" 
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCommand()}
                    placeholder="Type a command (e.g., 'Turn on the living room light' or 'Set thermostat to 75')"
                    className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                />
                <button 
                    onClick={handleCommand}
                    disabled={isProcessing || !command.trim()}
                    className="bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-bold"
                >
                    {isProcessing ? 'Executing...' : 'Execute'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceControl;