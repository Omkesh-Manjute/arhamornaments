import React, { useState, useEffect } from 'react';
import { 
  HardDrive, 
  ChevronLeft, 
  Folder, 
  Package, 
  RefreshCw, 
  Plus, 
  X, 
  Upload, 
  Loader2, 
  Info 
} from 'lucide-react';
import { productService } from '../../services/productService';

interface AdminMediaManagerProps {
  onSelectImages?: (urls: string[]) => void; // Optional if we want to use it as a picker
}

const AdminMediaManager: React.FC<AdminMediaManagerProps> = ({ onSelectImages }) => {
  const [currentPath, setCurrentPath] = useState('products');
  const [mediaItems, setMediaItems] = useState<{ folders: any[], files: any[] }>({ folders: [], files: [] });
  const [loading, setLoading] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showFolderInput, setShowFolderInput] = useState(false);
  const [mediaCache, setMediaCache] = useState<Record<string, { folders: any[], files: any[] }>>({});

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async (path: string = currentPath) => {
    if (mediaCache[path]) {
      setMediaItems(mediaCache[path]);
      setCurrentPath(path);
    } else {
      setLoading(true);
    }

    try {
      const data = await productService.listStorageItems(path);
      setMediaItems(data);
      setMediaCache(prev => ({ ...prev, [path]: data }));
      setCurrentPath(path);
    } catch (error) {
      console.error("Failed to fetch media:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setLoading(true);
    try {
      for (const file of Array.from(files)) {
        await productService.uploadToPath(currentPath, file);
      }
      await fetchMedia(currentPath);
      alert("Uploaded successfully!");
    } catch (error) {
      alert("Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    const path = `${currentPath}/${newFolderName.trim()}`;
    setLoading(true);
    try {
      await productService.createFolder(path);
      await fetchMedia(currentPath);
      setNewFolderName('');
      setShowFolderInput(false);
    } catch (error) {
      alert("Folder creation failed.");
    } finally {
      setLoading(false);
    }
  };

  const navigateToFolder = (folderName: string) => {
    const newPath = `${currentPath}/${folderName}`;
    fetchMedia(newPath);
  };

  const navigateBack = () => {
    const parts = currentPath.split('/');
    if (parts.length > 1) {
      parts.pop();
      fetchMedia(parts.join('/'));
    }
  };

  const handleCreateProductFromFolder = async () => {
    if (!confirm(`Create a separate product for EACH image in this folder?`)) return;
    
    setLoading(true);
    try {
      const folderName = currentPath.split('/').pop() || 'new-product';
      const results = await productService.syncStorageToFirestore(currentPath, folderName);
      alert(`Success! Created ${results.created} products.`);
    } catch (error) {
      alert("Sync failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGroupSync = async () => {
    if (!confirm(`Group and sync all images in this folder as ONE product?`)) return;
    setLoading(true);
    try {
      const folderName = currentPath.split('/').pop() || 'new-product';
      const imageUrls = mediaItems.files.map(f => f.url);
      await productService.saveProduct({
        id: folderName,
        name: folderName,
        price: 0,
        category: 'necklaces', 
        material: 'gold',
        description: `Synced from folder: ${currentPath}`,
        images: imageUrls,
        inStock: true,
        occasion: 'daily',
        rating: 4.5,
        reviews: 0
      } as any);
      alert("Synced successfully!");
    } catch (e) { 
      alert("Sync failed."); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={navigateBack}
            disabled={currentPath === 'products'}
            className="p-2 hover:bg-[#222222] rounded-xl text-gray-400 disabled:opacity-20 transition"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h3 className="text-2xl font-bold text-white">Media Manager</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
              <Folder size={12} className="text-amber-500" />
              <span>{currentPath}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentPath !== 'products' && (
            <>
              <button
                onClick={handleCreateProductFromFolder}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition shadow-[0_0_15px_rgba(59,130,246,0.3)]"
              >
                <Package size={16} /> Create Products
              </button>
              <button
                onClick={handleGroupSync}
                className="flex items-center gap-2 px-4 py-2.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl hover:bg-green-500 hover:text-white transition text-sm font-bold"
              >
                <RefreshCw size={16} /> Group Sync
              </button>
            </>
          )}

          <div className="relative">
            {showFolderInput ? (
              <div className="flex items-center gap-2 bg-[#0D0D0D] border border-[#333333] rounded-xl px-3 py-1.5 animate-in fade-in slide-in-from-right-4">
                <input
                  autoFocus
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreateFolder()}
                  placeholder="Folder name..."
                  className="bg-transparent outline-none text-sm text-white w-32"
                />
                <button onClick={handleCreateFolder} className="text-amber-500 hover:text-amber-400 font-bold text-xs uppercase">Add</button>
                <button onClick={() => setShowFolderInput(false)} className="text-gray-500 hover:text-white"><X size={14} /></button>
              </div>
            ) : (
              <button
                onClick={() => setShowFolderInput(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#1C1C1C] border border-[#222222] text-gray-300 rounded-xl text-sm font-bold hover:border-amber-500/50 transition"
              >
                <Plus size={16} className="text-amber-500" /> New Folder
              </button>
            )}
          </div>

          <label className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 transition cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <Upload size={16} /> Upload Image
            <input type="file" multiple accept="image/*" className="hidden" onChange={handleMediaUpload} />
          </label>
        </div>
      </div>

      <div className="bg-[#161616] rounded-[2.5rem] p-8 border border-[#222222] shadow-sm min-h-[500px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[400px] gap-4">
            <Loader2 className="animate-spin text-amber-500" size={40} />
            <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">Scanning Storage...</p>
          </div>
        ) : (
          <>
            {(mediaItems.folders.length === 0 && mediaItems.files.length === 0) ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-gray-700 mb-4 border border-white/5">
                  <HardDrive size={40} />
                </div>
                <h4 className="text-gray-400 font-bold">This folder is empty</h4>
                <p className="text-gray-600 text-xs mt-1">Upload images or create subfolders to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {mediaItems.folders.map(folder => (
                  <div
                    key={folder.fullPath}
                    onClick={() => navigateToFolder(folder.name)}
                    className="group cursor-pointer space-y-3"
                  >
                    <div className="aspect-square bg-[#0D0D0D] border border-[#222222] rounded-3xl flex items-center justify-center text-amber-500 group-hover:border-amber-500/50 group-hover:bg-amber-500/5 transition-all duration-300">
                      <Folder size={48} fill="currentColor" fillOpacity={0.1} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-300 truncate px-2">{folder.name}</p>
                      <p className="text-[10px] text-gray-600 uppercase font-bold tracking-tighter">Folder</p>
                    </div>
                  </div>
                ))}

                {mediaItems.files.map(file => (
                  <div
                    key={file.fullPath}
                    className="group space-y-3"
                  >
                    <div className="aspect-square bg-[#0D0D0D] border border-[#222222] rounded-3xl overflow-hidden relative group-hover:border-amber-500/50 transition-all duration-300 shadow-lg shadow-black/20">
                      <img src={file.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt={file.name} />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                        <button
                          onClick={() => {
                            if (onSelectImages) {
                              onSelectImages([file.url]);
                            } else {
                              navigator.clipboard.writeText(file.url);
                              alert('Link copied to clipboard!');
                            }
                          }}
                          className="w-full py-2 bg-white text-black rounded-xl text-[10px] font-black uppercase hover:bg-amber-500 hover:text-white transition shadow-lg"
                        >
                          {onSelectImages ? 'Select' : 'Copy Link'}
                        </button>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-300 truncate px-2">{file.name}</p>
                      <p className="text-[10px] text-gray-600 uppercase font-bold tracking-tighter">Image</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex items-center gap-3 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
        <Info size={16} className="text-amber-500 shrink-0" />
        <p className="text-xs text-gray-400">
          <span className="text-amber-500 font-bold">Pro Tip:</span> In Firebase Storage, folders are created automatically when you upload a file to a new path. Creating a folder here sets the path for your next upload.
        </p>
      </div>
    </div>
  );
};

export default AdminMediaManager;
