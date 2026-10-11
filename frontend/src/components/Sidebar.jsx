import React from 'react';
import { 
  BarChart2, 
  Layers, 
  GitCommit, 
  FileCode, 
  HelpCircle,
  Database,
  Activity
} from 'lucide-react';

export const Sidebar = ({ 
  selectedTest, 
  onSelectTest, 
  onLoadPreset,
  onOpenHelpModal
}) => {
  const testTypes = [
    {
      id: 'one_sample',
      name: 'One-Sample t-Test',
      desc: 'Compare sample mean against μ₀',
      icon: GitCommit,
    },
    {
      id: 'independent',
      name: 'Independent 2-Sample',
      desc: 'Compare two distinct sample means',
      icon: Layers,
    },
    {
      id: 'paired',
      name: 'Paired Samples t-Test',
      desc: 'Compare paired observations (before/after)',
      icon: BarChart2,
    }
  ];

  return (
    <aside className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-[#DDE2E8] p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center space-x-2.5 px-1 py-1">
          <div className="w-8 h-8 rounded-md bg-[#426B8A] text-white flex items-center justify-center shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-semibold text-sm text-[#253449] leading-tight">T-Test Simulator</h1>
            <p className="text-[11px] text-[#687586]">Statistical Analytics Studio</p>
          </div>
        </div>

        {/* Test Type Selection */}
        <div>
          <h2 className="text-[11px] font-semibold text-[#687586] uppercase tracking-wider px-1 mb-2">
            Test Selection
          </h2>
          <nav className="space-y-1">
            {testTypes.map((test) => {
              const Icon = test.icon;
              const isActive = selectedTest === test.id;
              return (
                <button
                  key={test.id}
                  onClick={() => onSelectTest(test.id)}
                  className={`w-full text-left p-2.5 rounded-md transition-all flex items-start space-x-2.5 border text-xs cursor-pointer ${
                    isActive
                      ? 'bg-[#F0F4F8] border-[#426B8A] text-[#253449] font-medium'
                      : 'border-transparent text-[#687586] hover:text-[#253449] hover:bg-[#F7F8FA]'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${isActive ? 'text-[#426B8A]' : 'text-[#687586]'}`} />
                  <div>
                    <div className="font-medium text-[#253449]">{test.name}</div>
                    <div className="text-[11px] text-[#687586] mt-0.5 leading-normal">
                      {test.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Presets */}
        <div>
          <h2 className="text-[11px] font-semibold text-[#687586] uppercase tracking-wider px-1 mb-2 flex items-center justify-between">
            <span>Datasets</span>
            <Database className="w-3 h-3 text-[#687586]" />
          </h2>
          <div className="space-y-1">
            <button
              onClick={() => onLoadPreset('one_sample')}
              className="w-full text-left px-2.5 py-1.5 text-xs rounded-md bg-[#F7F8FA] hover:bg-[#EAEFF5] text-[#253449] transition border border-[#DDE2E8] flex items-center justify-between cursor-pointer"
            >
              <span>Exam Scores (μ₀ = 75)</span>
              <span className="text-[10px] text-[#687586]">1-Sample</span>
            </button>

            <button
              onClick={() => onLoadPreset('independent')}
              className="w-full text-left px-2.5 py-1.5 text-xs rounded-md bg-[#F7F8FA] hover:bg-[#EAEFF5] text-[#253449] transition border border-[#DDE2E8] flex items-center justify-between cursor-pointer"
            >
              <span>Drug Trial Trial</span>
              <span className="text-[10px] text-[#687586]">2-Sample</span>
            </button>

            <button
              onClick={() => onLoadPreset('paired')}
              className="w-full text-left px-2.5 py-1.5 text-xs rounded-md bg-[#F7F8FA] hover:bg-[#EAEFF5] text-[#253449] transition border border-[#DDE2E8] flex items-center justify-between cursor-pointer"
            >
              <span>Weight Loss Trial</span>
              <span className="text-[10px] text-[#687586]">Paired</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Utilities */}
      <div className="pt-3 border-t border-[#DDE2E8] space-y-1.5 mt-6">
        <a
          href="http://localhost:8000/api/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full px-2.5 py-1.5 text-xs rounded-md bg-[#FAFAFC] hover:bg-[#F0F4F8] text-[#253449] transition flex items-center space-x-2 border border-[#DDE2E8]"
        >
          <FileCode className="w-3.5 h-3.5 text-[#426B8A]" />
          <span>API Documentation</span>
        </a>

        <button
          onClick={onOpenHelpModal}
          className="w-full px-2.5 py-1.5 text-xs rounded-md bg-[#FAFAFC] hover:bg-[#F0F4F8] text-[#253449] transition flex items-center space-x-2 border border-[#DDE2E8] cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5 text-[#426B8A]" />
          <span>Theory & Formulas</span>
        </button>
      </div>
    </aside>
  );
};
