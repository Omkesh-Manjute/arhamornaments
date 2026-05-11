import React, { useState, useEffect } from 'react';
import { Upload, Plus, Folder, FolderSync, Loader2 } from 'lucide-react';
import Papa from 'papaparse';
import { productService } from '../../services/productService';
import { adminService } from '../../services/adminService';
import { auth } from '../../lib/firebase';
import { Product } from '../../types';
import imageCompression from 'browser-image-compression';

interface AdminBulkSyncProps {
  onRefresh?: () => void;
}

const AdminBulkSync: React.FC<AdminBulkSyncProps> = ({ onRefresh }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [bulkInput, setBulkInput] = useState('');
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkProcessingProgress, setBulkProcessingProgress] = useState(0);
  const [syncCategory, setSyncCategory] = useState<string>('rings');
  const [syncGranular, setSyncGranular] = useState(false);
  const [folderImportData, setFolderImportData] = useState<{ name: string, files: File[] }[]>([]);
  const [showFolderPreview, setShowFolderPreview] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      const all = await productService.getAllProducts();
      setProducts(all);
    };
    loadProducts();
  }, []);

  const handleCompressedUpload = async (file: File) => {
    try {
      const options = {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1920,
        useWebWorker: true
      };
      const compressedFile = await imageCompression(file, options);
      return await productService.uploadImage(compressedFile);
    } catch (error) {
      console.error("Compression/Upload error:", error);
      throw error;
    }
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rawData = results.data as any[];
        const productsToUpload = rawData.map(row => ({
          name: row.name || row.Name,
          price: Number(row.price || row.Price || 0),
          category: (row.category || row.Category || 'rings').toLowerCase(),
          material: (row.material || row.Material || 'gold').toLowerCase(),
          description: row.description || row.Description || '',
          images: (row.images || row.Images || row.image || '').split(',').map((s: string) => s.trim()).filter(Boolean),
          inStock: true,
          rating: 4.5,
          reviews: 0
        }));

        const duplicates = productsToUpload.filter(newP =>
          products.some(existing => existing.name.toLowerCase() === newP.name.toLowerCase())
        );

        if (duplicates.length > 0) {
          if (!confirm(`${duplicates.length} products already exist by name. Overwrite them?`)) {
            setLoading(false);
            return;
          }
        }

        setBulkStatus(`Processing ${productsToUpload.length} products...`);

        try {
          const chunkSize = 10;
          for (let i = 0; i < productsToUpload.length; i += chunkSize) {
            const chunk = productsToUpload.slice(i, i + chunkSize);
            await productService.bulkUpload(chunk as any);
            setBulkProcessingProgress(Math.round(((i + chunk.length) / productsToUpload.length) * 100));
          }

          if (onRefresh) onRefresh();
          setBulkStatus(`✅ Successfully imported ${productsToUpload.length} products from CSV!`);
          setBulkProcessingProgress(0);
        } catch (err) {
          setBulkStatus('❌ CSV Import Failed');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleFolderUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const groups: { [key: string]: File[] } = {};
    files.forEach(file => {
      const path = (file as any).webkitRelativePath || '';
      const parts = path.split('/');
      if (parts.length >= 2) {
        const folderName = parts[1];
        if (!groups[folderName]) groups[folderName] = [];
        if (file.type.startsWith('image/')) {
          groups[folderName].push(file);
        }
      }
    });

    const formattedGroups = Object.entries(groups)
      .filter(([_, groupFiles]) => groupFiles.length > 0)
      .map(([name, files]) => ({ name, files }));

    if (formattedGroups.length === 0) {
      alert("No valid product folders detected.");
      return;
    }

    setFolderImportData(formattedGroups);
    setShowFolderPreview(true);
  };

  const processFolderImport = async () => {
    if (!confirm(`Import ${folderImportData.length} products?`)) return;

    setShowFolderPreview(false);
    setLoading(true);
    setBulkStatus(`Starting import...`);
    setBulkProcessingProgress(1);

    try {
      let count = 0;
      for (const group of folderImportData) {
        const productCode = group.name;
        const existing = products.find(p => p.designNo === productCode || p.name === productCode);

        const imageUrls: string[] = [];
        for (const file of group.files) {
          const url = await handleCompressedUpload(file);
          if (url) imageUrls.push(url);
        }

        const productData: Product = {
          id: existing?.id || Date.now().toString() + Math.random().toString(36).substr(2, 5),
          name: existing?.name || productCode,
          designNo: existing?.designNo || productCode,
          price: existing?.price || 0,
          category: (existing?.category || 'rings') as any,
          material: (existing?.material || 'gold') as any,
          description: existing?.description || `Imported product: ${productCode}`,
          images: imageUrls.length > 0 ? imageUrls : (existing?.images || []),
          inStock: true,
          occasion: existing?.occasion || 'daily',
          rating: existing?.rating || 4.5,
          reviews: existing?.reviews || 0
        };

        await productService.saveProduct(productData);
        count++;
        setBulkProcessingProgress(Math.round((count / folderImportData.length) * 100));
      }

      if (onRefresh) onRefresh();
      setBulkStatus(`✅ Successfully processed ${count} products!`);
    } catch (error) {
      setBulkStatus('❌ Error during folder import');
    } finally {
      setLoading(false);
      setBulkProcessingProgress(0);
      setFolderImportData([]);
    }
  };

  const handleSyncWithStorage = async () => {
    let mode = syncGranular;
    if (!mode) {
      const choice = window.confirm("How should we sync these images?\n\nOK = Group all images in a folder as ONE product\nCancel = Create a SEPARATE product for each image");
      mode = !choice;
    }

    setLoading(true);
    setBulkStatus(`Scanning Storage...`);
    try {
      const addedCount = await productService.syncStorageWithFirestore(mode, syncCategory);
      await adminService.createAuditLog({
        adminId: auth.currentUser?.uid || 'unknown',
        adminEmail: auth.currentUser?.email || 'unknown',
        action: 'STORAGE_SYNC',
        details: `Synchronized Storage with Firestore. Found and added ${addedCount} new products.`
      });
      if (onRefresh) onRefresh();
      setBulkStatus(`✅ Sync Complete! Added ${addedCount} new products.`);
    } catch (error: any) {
      setBulkStatus("❌ Sync Failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkInput.trim()) return;
    setLoading(true);
    setBulkStatus('Processing...');
    try {
      const data = JSON.parse(bulkInput);
      const productsToUpload = Array.isArray(data) ? data : [data];
      const cleaned = productsToUpload.map(p => ({
        ...p,
        id: p.id || Date.now().toString() + Math.random().toString(36).substr(2, 5),
        price: Number(p.price) || 0,
        category: p.category || 'rings',
        material: p.material || 'gold',
        images: Array.isArray(p.images) ? p.images : [p.image || ''],
        inStock: p.inStock ?? true,
        rating: p.rating || 4.5,
        reviews: p.reviews || 0
      }));

      await productService.bulkUpload(cleaned);
      if (onRefresh) onRefresh();
      setBulkInput('');
      setBulkStatus('✅ Successfully uploaded ' + cleaned.length + ' products!');
    } catch (e) {
      setBulkStatus('❌ Error: Invalid JSON format');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-4">
      {showFolderPreview && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#161616] border border-[#222222] rounded-3xl p-8 max-w-2xl w-full">
            <h3 className="text-xl font-bold text-white mb-2">Folder Import Preview</h3>
            <p className="text-gray-400 text-sm mb-6">Detected {folderImportData.length} potential products from your folder selection.</p>
            <div className="max-h-80 overflow-y-auto mb-8 pr-2 space-y-2">
              {folderImportData.map((group, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <Folder className="text-amber-500" size={16} />
                    <span className="text-sm font-bold text-gray-200">{group.name}</span>
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase">{group.files.length} Images</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowFolderPreview(false)} className="flex-1 py-3 bg-[#0D0D0D] text-white rounded-xl font-bold border border-[#222222]">Cancel</button>
              <button onClick={processFolderImport} className="flex-2 py-3 bg-amber-500 text-white rounded-xl font-bold shadow-lg shadow-amber-500/20">Start Import Now</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#161616] rounded-2xl border border-[#222222] p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#3B82F6]/10 rounded-2xl flex items-center justify-center text-[#3B82F6]">
              {loading ? <Loader2 className="animate-spin" size={24} /> : <Upload size={24} />}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Advanced Data Sync</h3>
              <p className="text-sm text-gray-400">Import products via CSV or JSON array.</p>
            </div>
          </div>

          <div className="flex gap-2">
            <label className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl text-xs font-bold hover:bg-blue-500/20 transition-colors cursor-pointer flex items-center gap-2">
              <Plus size={14} /> Import CSV
              <input type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
            </label>
            <label className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-xs font-bold hover:bg-amber-500/20 transition-colors cursor-pointer flex items-center gap-2">
              <Folder size={14} /> Import Folders
              <input
                type="file"
                {...({ webkitdirectory: "", directory: "" } as any)}
                multiple
                className="hidden"
                onChange={handleFolderUpload}
              />
            </label>
            <button 
              onClick={handleSyncWithStorage} 
              disabled={loading}
              className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl text-xs font-bold hover:bg-purple-500/20 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <FolderSync size={14} /> Sync from Storage
            </button>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-gray-500 uppercase">As Category:</span>
              <select
                value={syncCategory}
                onChange={(e) => setSyncCategory(e.target.value)}
                className="bg-[#0D0D0D] border border-[#222222] text-xs text-amber-500 font-bold px-2 py-1 rounded-lg outline-none focus:border-amber-500"
              >
                {['rings', 'necklaces', 'earrings', 'coins', 'bangles', 'pendants', 'mangalsutra'].map(c => (
                  <option key={c} value={c}>{c.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={syncGranular}
                  onChange={(e) => setSyncGranular(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-10 h-5 rounded-full transition-colors ${syncGranular ? 'bg-amber-500' : 'bg-white/10'}`}></div>
                <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform ${syncGranular ? 'translate-x-5' : ''}`}></div>
              </div>
              <span className="text-[10px] font-bold text-gray-500 uppercase">One image = One product</span>
            </label>
          </div>
        </div>

        <div className="space-y-4">
          {bulkProcessingProgress > 0 && (
            <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <span>Processing...</span>
                <span>{bulkProcessingProgress}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#3B82F6] transition-all duration-300" style={{ width: `${bulkProcessingProgress}%` }}></div>
              </div>
            </div>
          )}

          <textarea
            value={bulkInput}
            onChange={e => setBulkInput(e.target.value)}
            placeholder='[{"name": "Ring 1", "price": 5000, "category": "rings", "images": ["https://link-to-your-image.com/img.jpg"]}]'
            className="w-full h-80 px-4 py-3 border border-[#222222] rounded-2xl font-mono text-sm focus:outline-none focus:border-[#3B82F6] resize-none bg-[#0D0D0D] text-gray-300 placeholder-gray-600"
          />

          {bulkStatus && (
            <div className={`p-4 rounded-xl text-sm font-medium border ${bulkStatus.includes('✅') ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
              {bulkStatus}
            </div>
          )}

          <div className="flex justify-between items-center">
            <p className="text-[11px] text-gray-500 italic">Supports direct JSON pasting or CSV file selection.</p>
            <button
              onClick={handleBulkUpload}
              disabled={!bulkInput.trim() || loading}
              className="px-8 py-3 bg-[#3B82F6] text-white rounded-xl font-bold shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:bg-blue-600 transition disabled:opacity-50 disabled:shadow-none"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Process JSON Sync'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBulkSync;
