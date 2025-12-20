import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, ArrowLeft, Loader2, Database } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useTheme } from '../context/ThemeContext';

interface ImportPageProps {
  onBack: () => void;
}

export const ImportPage: React.FC<ImportPageProps> = ({ onBack }) => {
  const { isDarkMode } = useTheme();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [log, setLog] = useState<string>('');
  const [preview, setPreview] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
      setLog('');
      parseCSV(e.target.files[0]);
    }
  };

  // Simple CSV Parser
  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      const lines = text.split('\n').filter(line => line.trim() !== '');
      if (lines.length < 2) {
          setLog("Error: CSV appears empty or missing headers.");
          return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/['"]+/g, ''));
      const previewData = lines.slice(1, 6).map(line => {
          const values = line.split(',');
          return headers.reduce((obj: any, header, index) => {
              obj[header] = values[index]?.trim().replace(/['"]+/g, '') || '';
              return obj;
          }, {});
      });

      setPreview(previewData);
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setLog('Reading file...');

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim() !== '');
      const headers = lines[0].split(',').map(h => h.trim().replace(/['"]+/g, ''));

      const rows = lines.slice(1).map(line => {
        // Regex to handle commas inside quotes if present, otherwise simple split
        const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(val => val.trim().replace(/^"|"$/g, ''));
        
        const row: any = {};
        headers.forEach((header, index) => {
           // Map CSV headers to Supabase columns (adjust keys as necessary)
           // Expected CSV headers: name, brand, category, unit, image_url
           row[header] = values[index];
        });
        
        // Default Fallbacks
        if (!row.image_url) row.image_url = 'https://placehold.co/400';
        if (!row.tags) row.tags = ['imported'];
        else if (typeof row.tags === 'string') row.tags = [row.tags];

        return row;
      });

      setLog(`Parsed ${rows.length} rows. Uploading to Supabase...`);

      try {
        const { data, error } = await supabase
          .from('products')
          .insert(rows)
          .select();

        if (error) throw error;

        setStatus('success');
        setLog(`Successfully imported ${rows.length} products!`);
      } catch (err: any) {
        setStatus('error');
        setLog(`Upload failed: ${err.message}`);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className={`min-h-screen p-4 ${isDarkMode ? 'bg-teal-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={onBack}
          className={`flex items-center text-sm font-semibold mb-6 ${isDarkMode ? 'text-teal-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <ArrowLeft size={18} className="mr-1" /> Back to Dashboard
        </button>

        <div className={`p-8 rounded-3xl shadow-xl border ${isDarkMode ? 'bg-teal-900 border-teal-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center mb-6">
            <div className={`p-3 rounded-full mr-4 ${isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>
              <Database size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Product Import</h1>
              <p className={`text-sm ${isDarkMode ? 'text-teal-300' : 'text-slate-500'}`}>Bulk upload inventory via CSV</p>
            </div>
          </div>

          {/* Instructions */}
          <div className={`mb-8 p-4 rounded-xl text-sm ${isDarkMode ? 'bg-teal-950 border border-teal-800' : 'bg-slate-50 border border-slate-100'}`}>
            <h3 className="font-bold mb-2 flex items-center"><FileText size={14} className="mr-2"/> CSV Format Required</h3>
            <p className="opacity-80 mb-2">Your CSV file must include these headers:</p>
            <code className={`block p-2 rounded text-xs font-mono ${isDarkMode ? 'bg-black/30' : 'bg-slate-200'}`}>
              name, brand, category, unit, image_url
            </code>
          </div>

          {/* Upload Area */}
          <div className="space-y-6">
            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              file ? 'border-emerald-500 bg-emerald-50/10' : (isDarkMode ? 'border-teal-700 hover:border-emerald-500' : 'border-slate-300 hover:border-emerald-500')
            }`}>
              <input 
                type="file" 
                accept=".csv"
                onChange={handleFileChange}
                className="hidden" 
                id="csv-upload"
              />
              <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center">
                <Upload size={40} className={`mb-4 ${file ? 'text-emerald-500' : 'text-slate-400'}`} />
                {file ? (
                  <span className="font-bold text-emerald-500">{file.name}</span>
                ) : (
                  <>
                    <span className="font-bold mb-1">Click to upload CSV</span>
                    <span className="text-xs opacity-60">or drag and drop</span>
                  </>
                )}
              </label>
            </div>

            {/* Preview */}
            {preview.length > 0 && (
                <div className="overflow-x-auto">
                    <table className={`w-full text-xs text-left ${isDarkMode ? 'text-teal-200' : 'text-slate-600'}`}>
                        <thead>
                            <tr className="border-b border-white/10">
                                {Object.keys(preview[0]).map(k => <th key={k} className="p-2">{k}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {preview.map((row, i) => (
                                <tr key={i} className="border-b border-white/5">
                                    {Object.values(row).map((v: any, j) => <td key={j} className="p-2 truncate max-w-[100px]">{v}</td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {file && (
              <button 
                onClick={handleUpload}
                disabled={isUploading || status === 'success'}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center transition-all ${
                  status === 'success' 
                    ? 'bg-emerald-600 text-white cursor-default'
                    : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg'
                }`}
              >
                {isUploading ? (
                  <><Loader2 size={20} className="animate-spin mr-2" /> Importing...</>
                ) : status === 'success' ? (
                  <><CheckCircle size={20} className="mr-2" /> Import Complete</>
                ) : (
                  'Run Import'
                )}
              </button>
            )}

            {/* Status Log */}
            {log && (
              <div className={`p-4 rounded-xl flex items-start text-sm ${
                status === 'error' ? 'bg-red-50 text-red-600' : 
                status === 'success' ? 'bg-emerald-50 text-emerald-700' : 
                (isDarkMode ? 'bg-teal-950 text-teal-300' : 'bg-slate-100 text-slate-600')
              }`}>
                {status === 'error' ? <AlertCircle size={16} className="mr-2 mt-0.5" /> : 
                 status === 'success' ? <CheckCircle size={16} className="mr-2 mt-0.5" /> :
                 <Loader2 size={16} className="mr-2 mt-0.5 animate-spin" />}
                {log}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};