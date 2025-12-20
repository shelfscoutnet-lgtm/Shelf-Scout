import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, ArrowLeft, Loader2, Save } from 'lucide-react';
import Papa from 'papaparse';
import { supabase } from '../lib/supabaseClient';
import { useShop } from '../context/ShopContext';
import { useProducts } from '../hooks/useProducts';
import { useTheme } from '../context/ThemeContext';

interface AdminUploadProps {
  onBack: () => void;
}

export const AdminUpload: React.FC<AdminUploadProps> = ({ onBack }) => {
  const { isDarkMode } = useTheme();
  const { stores } = useShop();
  const { products } = useProducts();
  
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [preview, setPreview] = useState<any[]>([]);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
      setLogs([]);
      setProgress(0);
      
      // Preview
      Papa.parse(e.target.files[0], {
          header: true,
          preview: 5,
          complete: (results) => {
              setPreview(results.data);
          }
      });
    }
  };

  const processUpload = async () => {
    if (!file) return;
    setIsProcessing(true);
    setLogs([]);
    setProgress(10);
    addLog("Starting upload process...");

    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
            const rows = results.data as any[];
            addLog(`Parsed ${rows.length} rows from CSV.`);
            setProgress(30);
            
            let successCount = 0;
            let errorCount = 0;
            const pricesToInsert = [];

            // Pre-fetch product mapping (Barcode -> ID)
            const productMap = new Map();
            products.forEach(p => {
                if (p.barcode) productMap.set(p.barcode.trim().toLowerCase(), p.id);
            });

            // Store Mapping (Name -> ID)
            const storeMap = new Map();
            stores.forEach(s => {
                // Map both simple name and trimmed lowercase name for robustness
                storeMap.set(s.name.trim().toLowerCase(), s.id);
            });

            addLog(`Analyzing ${rows.length} records against ${products.length} products and ${stores.length} stores...`);
            setProgress(50);

            for (const row of rows) {
                const barcodeRef = row.barcode_ref?.toString().trim().toLowerCase();
                const storeNameRef = row.store_name_ref?.toString().trim().toLowerCase();
                const price = parseFloat(row.price);

                if (!barcodeRef || !storeNameRef || isNaN(price)) {
                    errorCount++;
                    continue; // Skip invalid rows
                }

                const productId = productMap.get(barcodeRef);
                const storeId = storeMap.get(storeNameRef);

                if (productId && storeId) {
                    pricesToInsert.push({
                        product_id: productId,
                        store_id: storeId,
                        price: price
                    });
                    successCount++;
                } else {
                    if (!productId) addLog(`Skipped: Barcode '${barcodeRef}' not found in database.`);
                    if (!storeId) addLog(`Skipped: Store '${storeNameRef}' not found. Check exact spelling.`);
                    errorCount++;
                }
            }

            setProgress(70);

            if (pricesToInsert.length > 0) {
                addLog(`Inserting ${pricesToInsert.length} price records...`);
                
                // Batch insert using Supabase
                const { error } = await supabase
                    .from('prices')
                    .upsert(pricesToInsert, { onConflict: 'product_id,store_id' }); // Assuming composite key

                if (error) {
                    addLog(`DB Error: ${error.message}`);
                    setStatus('error');
                    setProgress(100);
                } else {
                    addLog("Upload successful!");
                    setStatus('success');
                    setProgress(100);
                }
            } else {
                addLog("No valid records found to insert.");
                setStatus('error');
                setProgress(100);
            }

            setIsProcessing(false);
        }
    });
  };

  return (
    <div className={`min-h-screen p-4 ${isDarkMode ? 'bg-teal-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
        <div className="max-w-3xl mx-auto">
            <button 
                onClick={onBack}
                className={`flex items-center text-sm font-semibold mb-6 ${isDarkMode ? 'text-teal-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}
            >
                <ArrowLeft size={18} className="mr-1" /> Back to Dashboard
            </button>

            <div className={`p-8 rounded-3xl shadow-xl border ${isDarkMode ? 'bg-teal-900 border-teal-800' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Admin Price Uploader</h1>
                        <p className={`text-sm ${isDarkMode ? 'text-teal-300' : 'text-slate-500'}`}>Update store prices via CSV</p>
                    </div>
                    <div className="p-3 bg-emerald-100 rounded-full text-emerald-600">
                        <Save size={24} />
                    </div>
                </div>

                 {/* Instructions */}
                <div className={`mb-8 p-4 rounded-xl text-sm ${isDarkMode ? 'bg-teal-950 border border-teal-800' : 'bg-slate-50 border border-slate-100'}`}>
                    <h3 className="font-bold mb-2 flex items-center"><FileText size={14} className="mr-2"/> Required CSV Columns</h3>
                    <code className={`block p-2 rounded text-xs font-mono mb-2 ${isDarkMode ? 'bg-black/30' : 'bg-slate-200'}`}>
                    barcode_ref, store_name_ref, price
                    </code>
                    <p className="text-xs opacity-70">Example: "123456", "HiLo Manor Park", "1500.00"</p>
                </div>

                {/* File Input */}
                <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors mb-6 ${
                    file ? 'border-emerald-500 bg-emerald-50/10' : (isDarkMode ? 'border-teal-700 hover:border-emerald-500' : 'border-slate-300 hover:border-emerald-500')
                    }`}>
                    <input 
                        type="file" 
                        accept=".csv"
                        onChange={handleFileChange}
                        className="hidden" 
                        id="price-csv"
                    />
                    <label htmlFor="price-csv" className="cursor-pointer flex flex-col items-center">
                        <Upload size={32} className={`mb-3 ${file ? 'text-emerald-500' : 'text-slate-400'}`} />
                        {file ? (
                            <span className="font-bold text-emerald-500">{file.name}</span>
                        ) : (
                            <span className="font-medium text-sm">Upload Price CSV</span>
                        )}
                    </label>
                </div>

                {/* Progress Bar */}
                {isProcessing || progress > 0 ? (
                    <div className="w-full bg-slate-200 rounded-full h-2 mb-6 overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-500 ease-out ${status === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`} 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                ) : null}

                {/* Action Button */}
                {file && (
                    <button 
                        onClick={processUpload}
                        disabled={isProcessing}
                        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center transition-all ${
                            isProcessing ? 'bg-slate-700 text-slate-300' : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg'
                        }`}
                    >
                        {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle className="mr-2" />}
                        {isProcessing ? 'Processing...' : 'Upload Prices'}
                    </button>
                )}

                {/* Logs / Status */}
                {logs.length > 0 && (
                    <div className={`mt-6 p-4 rounded-xl text-xs font-mono max-h-40 overflow-y-auto ${
                        status === 'error' ? 'bg-red-50 text-red-700' : 
                        (isDarkMode ? 'bg-black/40 text-teal-200' : 'bg-slate-100 text-slate-600')
                    }`}>
                        {logs.map((log, i) => <div key={i} className="mb-1 border-b border-black/5 pb-1 last:border-0">{log}</div>)}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};