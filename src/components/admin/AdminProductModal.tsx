import React, { useState, useEffect, useMemo } from 'react';
import { X, Save, Upload, Loader2, Image, Layers, Trash2, Calculator } from 'lucide-react';
import { Product } from '../../types';
import { productService } from '../../services/productService';
import { adminService } from '../../services/adminService';
import { auth } from '../../lib/firebase';
import { usePrice } from '../../context/PriceContext';
import imageCompression from 'browser-image-compression';
import { useDropzone } from 'react-dropzone';
import { GENDER_CATEGORIES } from './AdminProducts';

interface AdminProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  CATEGORIES: readonly string[];
  onSave: () => void;
}

const AdminProductModal: React.FC<AdminProductModalProps> = ({
  isOpen,
  onClose,
  product,
  CATEGORIES,
  onSave
}) => {
  const { rates, makingCharges: globalMaking } = usePrice();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    category: 'rings',
    material: 'gold',
    purity: '22K',
    occasion: 'daily',
    description: '',
    images: [] as string[],
    grossWeight: '',
    netWeight: '',
    makingCharge: '',
    inStock: true,
    featured: false,
    trending: false,
    batchNo: '',
    designNo: '',
    gender: 'unisex' as 'men' | 'women' | 'unisex',
    diamondDetails: [] as any[],
    variants: [] as any[]
  });
  
  const [uploadQueue, setUploadQueue] = useState<{ file: File, progress: number, url?: string, id: string }[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [multiProductMode, setMultiProductMode] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        price: product.price.toString(),
        originalPrice: product.originalPrice?.toString() || '',
        category: product.category,
        material: product.material,
        purity: product.purity || '22K',
        occasion: product.occasion,
        description: product.description,
        images: product.images || [],
        grossWeight: (product.grossWeight || '').toString(),
        netWeight: (product.netWeight || '').toString(),
        makingCharge: (product.makingCharge || product.laborCharges || '').toString(),
        inStock: product.inStock,
        featured: product.featured || false,
        trending: product.trending || false,
        batchNo: product.batchNo || '',
        designNo: product.designNo || '',
        gender: product.gender || 'unisex',
        diamondDetails: product.diamondDetails || [],
        variants: product.variants || []
      });
    } else {
      setFormData({
        name: '', price: '', originalPrice: '', category: 'rings', material: 'gold', purity: '22K', occasion: 'daily', description: '', images: [], grossWeight: '', netWeight: '', laborCharges: '', inStock: true, featured: false, trending: false,
        batchNo: '', designNo: '', gender: 'unisex', diamondDetails: [], variants: []
      });
    }
    setUploadQueue([]);
    setImagesToDelete([]);
    setMultiProductMode(false);
  }, [product, isOpen]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => processFiles(acceptedFiles),
    accept: { 'image/*': [] },
    multiple: true
  });

  const handleCompressedUpload = async (file: File) => {
    const uploadId = Math.random().toString(36).substr(2, 9);
    setUploadQueue(prev => [...prev, { file, progress: 10, id: uploadId }]);

    try {
      const options = { maxSizeMB: 0.3, maxWidthOrHeight: 1200, useWebWorker: true, initialQuality: 0.7 };
      const compressedFile = await imageCompression(file, options);
      setUploadQueue(prev => prev.map(item => item.id === uploadId ? { ...item, progress: 40 } : item));
      
      const url = await productService.uploadImage(compressedFile);
      setUploadQueue(prev => prev.map(item => item.id === uploadId ? { ...item, progress: 100, url } : item));
      return url;
    } catch (error) {
      setUploadQueue(prev => prev.filter(item => item.id !== uploadId));
      throw error;
    }
  };

  const processFiles = async (files: File[]) => {
    setUploading(true);
    try {
      const results: string[] = [];
      // Process one by one to avoid browser hang on heavy compression
      for (const file of files) {
        try {
          const url = await handleCompressedUpload(file);
          if (url) results.push(url);
        } catch (e) {
          console.error("Failed to upload", file.name, e);
        }
      }
      
      if (results.length > 0) {
        setFormData(prev => ({ ...prev, images: [...prev.images, ...results] }));
      }
      setUploadQueue([]); // Clear queue after adding to formData
    } catch (e) {
      console.error("Upload batch failed", e);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url: string) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter(u => u !== url) }));
    if (!url.includes('unsplash.com')) {
      setImagesToDelete(prev => [...prev, url]);
    }
  };

  const handleSave = async () => {
    if (!formData.name) {
      alert("Please enter a product name");
      return;
    }
    if (!formData.price && calculatedPrice <= 0) {
      alert("Please enter a price or fill in weight + karat for auto-pricing");
      return;
    }

    setLoading(true);
    const uploadedUrls = uploadQueue.filter(q => q.url).map(q => q.url!);
    // Use Set to strictly prevent duplicate URLs
    const allImages = Array.from(new Set([...formData.images, ...uploadedUrls]));

    try {
      if (multiProductMode && allImages.length > 1) {
        const productsToCreate: Product[] = allImages.map((imgUrl, idx) => ({
          id: `${formData.name.toLowerCase().replace(/\s+/g, '-')}-${idx}-${Date.now().toString().slice(-4)}`,
          name: formData.name,
          price: calculatedPrice > 0 ? calculatedPrice : Number(formData.price),
          category: formData.category as any,
          material: formData.material as any,
          purity: formData.purity,
          occasion: formData.occasion as any,
          gender: formData.gender,
          description: formData.description,
          images: [imgUrl],
          grossWeight: formData.grossWeight ? Number(formData.grossWeight) : undefined,
          netWeight: formData.netWeight ? Number(formData.netWeight) : undefined,
          makingCharge: formData.makingCharge ? Number(formData.makingCharge) : undefined,
          laborCharges: formData.makingCharge ? Number(formData.makingCharge) : undefined,
          inStock: formData.inStock,
          featured: formData.featured,
          trending: formData.trending,
          batchNo: formData.batchNo,
          designNo: formData.designNo ? `${formData.designNo}-${idx + 1}` : '',
          rating: product?.rating || 4.5,
          reviews: product?.reviews || 0
        }));
        await productService.bulkUpload(productsToCreate);

        // Delete original if it exists
        if (product?.id) {
          await productService.deleteProduct(product.id);
        }
      } else {
        const productData: Product = {
          id: product?.id || `${formData.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString().slice(-4)}`,
          name: formData.name,
          price: calculatedPrice > 0 ? calculatedPrice : Number(formData.price),
          originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
          category: formData.category as any,
          material: formData.material as any,
          purity: formData.purity,
          occasion: formData.occasion as any,
          gender: formData.gender,
          description: formData.description,
          images: allImages.length > 0 ? allImages : ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500'],
          grossWeight: formData.grossWeight ? Number(formData.grossWeight) : undefined,
          netWeight: formData.netWeight ? Number(formData.netWeight) : undefined,
          makingCharge: formData.makingCharge ? Number(formData.makingCharge) : undefined,
          laborCharges: formData.makingCharge ? Number(formData.makingCharge) : undefined,
          inStock: formData.inStock,
          featured: formData.featured,
          trending: formData.trending,
          batchNo: formData.batchNo,
          designNo: formData.designNo,
          diamondDetails: formData.diamondDetails,
          variants: formData.variants,
          rating: product?.rating || 4.5,
          reviews: product?.reviews || 0
        };
        await productService.saveProduct(productData);
      }

      for (const url of imagesToDelete) {
        await productService.deleteImage(url);
      }

      await adminService.createAuditLog({
        adminId: auth.currentUser?.uid || 'unknown',
        adminEmail: auth.currentUser?.email || 'unknown',
        action: product ? 'UPDATE_PRODUCT' : 'CREATE_PRODUCT',
        details: `${product ? 'Updated' : 'Created'} product: ${formData.name}`
      });

      onSave();
      onClose();
    } catch (error: any) {
      alert("Save failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Auto-calculate price from market rate
  const marketRate = useMemo(() => {
    const p = formData.purity || '22K';
    if (formData.material === 'gold') return rates[`gold${p}` as keyof typeof rates] || rates.gold22K;
    if (formData.material === 'silver') return rates.silver;
    if (formData.material === 'platinum') return rates.platinum;
    return 0;
  }, [formData.purity, formData.material, rates]);

  const makingPct = useMemo(() => {
    if (formData.makingCharge) return Number(formData.makingCharge);
    return (globalMaking as any)[formData.category] || 10;
  }, [formData.makingCharge, formData.category, globalMaking]);

  const calculatedPrice = useMemo(() => {
    const nw = parseFloat(formData.netWeight) || 0;
    if (nw <= 0 || marketRate <= 0) return 0;
    const metalCost = nw * marketRate;
    const makingCost = metalCost * (makingPct / 100);
    return Math.round((metalCost + makingCost) * 1.03);
  }, [formData.netWeight, marketRate, makingPct]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto pt-20 pb-20">
      <div className="bg-[#161616] border border-[#222222] w-full max-w-5xl rounded-[2.5rem] shadow-2xl relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-8 border-b border-[#222222] flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">{product ? 'Edit Product' : 'New Product'}</h2>
            <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mt-1">{product ? 'Update existing inventory' : 'Add to collection'}</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 bg-[#0D0D0D] border border-[#222222] text-gray-500 hover:text-white rounded-2xl flex items-center justify-center transition-all hover:scale-110"><X size={24} /></button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left: Images */}
            <div className="lg:col-span-5 space-y-6">
              <div {...getRootProps()} className={`aspect-square rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-500 overflow-hidden relative group ${isDragActive ? 'border-amber-500 bg-amber-500/5' : 'border-[#333333] bg-[#0D0D0D] hover:border-amber-500/50'}`}>
                <input {...getInputProps()} />
                {formData.images.length > 0 ? (
                  <img src={formData.images[0]} alt="Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="text-center p-6">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform"><Image className="text-gray-500 group-hover:text-amber-500 transition-colors" size={32} /></div>
                    <p className="text-sm font-bold text-gray-300">Drop images here</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-2">or click to browse storage</p>
                  </div>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                    <Loader2 className="animate-spin text-amber-500" size={40} />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-4 gap-3">
                {formData.images.map((url, idx) => (
                  <div key={idx} className="aspect-square rounded-xl overflow-hidden relative group border border-white/5">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => removeImage(url)} className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center"><Trash2 size={16} /></button>
                  </div>
                ))}
                {uploadQueue.filter(q => !q.url).map(q => (
                  <div key={q.id} className="aspect-square rounded-xl bg-white/5 border border-white/10 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-amber-500/20" style={{ height: `${q.progress}%`, top: 'auto', bottom: 0 }}></div>
                    <Loader2 className="animate-spin text-amber-500" size={16} />
                  </div>
                ))}
              </div>

              {formData.images.length > 1 && (
                <div className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-2xl">
                  <label className="flex items-center gap-4 cursor-pointer">
                    <div className="relative">
                      <input type="checkbox" checked={multiProductMode} onChange={e => setMultiProductMode(e.target.checked)} className="sr-only" />
                      <div className={`w-12 h-6 rounded-full transition-colors ${multiProductMode ? 'bg-amber-500' : 'bg-white/10'}`}></div>
                      <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${multiProductMode ? 'translate-x-6' : ''}`}></div>
                    </div>
                    <div>
                      <span className="text-sm font-bold text-gray-200 flex items-center gap-2"><Layers size={14} className="text-amber-500" /> Multi-Product Mode</span>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Create {formData.images.length} separate products (One for each image)</p>
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* Right: Form */}
            <div className="lg:col-span-7 space-y-5">
              {/* Row 1: Name + Design */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Product Name</label>
                  <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-5 py-3.5 bg-[#0D0D0D] border border-[#222222] rounded-2xl text-white outline-none focus:border-amber-500 transition-colors placeholder:text-gray-700" placeholder="e.g. Traditional Gold Choker" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Design #</label>
                  <input value={formData.designNo} onChange={e => setFormData({...formData, designNo: e.target.value})} className="w-full px-5 py-3.5 bg-[#0D0D0D] border border-[#222222] rounded-2xl text-white outline-none focus:border-amber-500 transition-colors font-mono" placeholder="D-0000" />
                </div>
              </div>

              {/* Row 2: Gender + Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Gender</label>
                  <div className="flex gap-2">
                    {[
                      { id: 'men', label: 'Men' },
                      { id: 'women', label: 'Women' },
                      { id: 'unisex', label: 'Unisex' }
                    ].map(g => (
                      <button key={g.id} type="button" onClick={() => setFormData({...formData, gender: g.id as any})}
                        className={`flex-1 py-3.5 rounded-xl font-bold text-[13px] tracking-wide transition-all border ${
                          formData.gender === g.id
                            ? 'bg-amber-500 text-white border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)] scale-[1.02]'
                            : 'bg-white/5 text-gray-500 border-white/10 hover:border-amber-500/30 hover:bg-white/[0.08]'
                        }`}
                      >{g.label}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Category</label>
                  <select 
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})} 
                    className="w-full px-5 py-3.5 bg-[#0D0D0D] border border-[#222222] rounded-2xl text-white outline-none focus:border-amber-500 transition-colors appearance-none capitalize"
                  >
                    {(GENDER_CATEGORIES[formData.gender] || CATEGORIES).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Purity + Material */}
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Material</label>
                  <select value={formData.material} onChange={e => setFormData({...formData, material: e.target.value as any})} className="w-full px-5 py-3.5 bg-[#0D0D0D] border border-[#222222] rounded-2xl text-white outline-none focus:border-amber-500 transition-colors appearance-none capitalize">
                    <option value="gold">Gold</option>
                    <option value="silver">Silver</option>
                    <option value="platinum">Platinum</option>
                    <option value="diamond">Diamond</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Karat / Purity</label>
                  <div className="flex gap-2">
                    {['18K','22K','24K'].map(k => (
                      <button key={k} type="button" onClick={() => setFormData({...formData, purity: k})}
                        className={`flex-1 py-3.5 rounded-xl font-bold text-[13px] tracking-wide transition-all border ${
                          formData.purity === k
                            ? 'bg-amber-500 text-white border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)] scale-[1.02]'
                            : 'bg-white/5 text-gray-500 border-white/10 hover:border-amber-500/30 hover:bg-white/[0.08]'
                        }`}
                      >{k}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 3: GWT + NWT */}
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">GWT — Gross Weight (g)</label>
                  <input type="number" step="0.001" value={formData.grossWeight} onChange={e => setFormData({...formData, grossWeight: e.target.value})} className="w-full px-5 py-3.5 bg-[#0D0D0D] border border-[#222222] rounded-2xl text-white outline-none focus:border-amber-500 transition-colors font-mono" placeholder="0.000" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">NWT — Net Weight (g)</label>
                  <input type="number" step="0.001" value={formData.netWeight} onChange={e => setFormData({...formData, netWeight: e.target.value})} className="w-full px-5 py-3.5 bg-[#0D0D0D] border border-[#222222] rounded-2xl text-white outline-none focus:border-amber-500 transition-colors font-mono" placeholder="0.000" />
                </div>
              </div>

              {/* Row 4: Market Rate (auto) + Making Charges */}
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Market Rate (₹/g) — Auto</label>
                  <div className="w-full px-5 py-3.5 bg-[#0D0D0D] border border-emerald-500/30 rounded-2xl text-emerald-400 font-mono font-bold flex items-center gap-2">
                    <span className="text-emerald-500/60">₹</span>{marketRate.toLocaleString('en-IN')}
                    <span className="text-[9px] text-gray-600 ml-auto">per gram • {formData.purity}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Making Charges (%)</label>
                  <input type="number" step="0.5" value={formData.makingCharge} onChange={e => setFormData({...formData, makingCharge: e.target.value})} className="w-full px-5 py-3.5 bg-[#0D0D0D] border border-[#222222] rounded-2xl text-white outline-none focus:border-amber-500 transition-colors font-mono" placeholder={`${makingPct}% (default)`} />
                </div>
              </div>

              {/* Calculated Final Price */}
              {calculatedPrice > 0 && (
                <div className="bg-gradient-to-r from-amber-500/10 to-emerald-500/10 border border-amber-500/20 rounded-2xl p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calculator size={18} className="text-amber-500" />
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Auto-Calculated Final Price</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {formData.netWeight}g × ₹{marketRate.toLocaleString('en-IN')} + {makingPct}% making + 3% GST
                        </p>
                      </div>
                    </div>
                    <p className="text-3xl font-black text-amber-500">₹{calculatedPrice.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              )}

              {/* Manual Price Override */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">{calculatedPrice > 0 ? 'Manual Price Override (₹) — optional' : 'Price (₹)'}</label>
                <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-5 py-3.5 bg-[#0D0D0D] border border-[#222222] rounded-2xl text-white outline-none focus:border-amber-500 transition-colors font-mono" placeholder={calculatedPrice > 0 ? `Auto: ₹${calculatedPrice}` : '0.00'} />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Description</label>
                <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-5 py-3.5 bg-[#0D0D0D] border border-[#222222] rounded-2xl text-white outline-none focus:border-amber-500 transition-colors resize-none placeholder:text-gray-700" placeholder="Tell the story of this piece..." />
              </div>

              {/* Checkboxes */}
              <div className="flex flex-wrap gap-6 pt-4 border-t border-[#222222]">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={formData.inStock} onChange={e => setFormData({...formData, inStock: e.target.checked})} className="w-5 h-5 rounded-lg border-[#333333] bg-[#0D0D0D] text-amber-500 focus:ring-offset-0 focus:ring-0" />
                  <span className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors uppercase tracking-widest">In Stock</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={formData.featured} onChange={e => setFormData({...formData, featured: e.target.checked})} className="w-5 h-5 rounded-lg border-[#333333] bg-[#0D0D0D] text-amber-500 focus:ring-offset-0 focus:ring-0" />
                  <span className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors uppercase tracking-widest">Featured</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={formData.trending} onChange={e => setFormData({...formData, trending: e.target.checked})} className="w-5 h-5 rounded-lg border-[#333333] bg-[#0D0D0D] text-amber-500 focus:ring-offset-0 focus:ring-0" />
                  <span className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors uppercase tracking-widest">Trending</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-[#222222] bg-[#0D0D0D]/50 rounded-b-[2.5rem] flex flex-col gap-4 shrink-0">
          {uploading && (
            <div className="flex items-center gap-3 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <Loader2 className="animate-spin text-amber-500" size={14} />
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Uploading media... please wait</p>
            </div>
          )}
          <div className="flex gap-4">
            <button onClick={onClose} className="flex-1 py-3.5 bg-white/5 text-gray-400 rounded-xl font-bold text-[11px] uppercase tracking-wider hover:bg-white/10 transition-all border border-white/10">Cancel</button>
            <button 
              onClick={handleSave} 
              disabled={loading || uploading} 
              className="flex-[2] py-3.5 bg-amber-600 text-white rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-amber-700 transition-all shadow-md active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              {product ? 'Update Inventory' : multiProductMode ? `Create ${formData.images.length} Products` : 'Publish Product'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProductModal;
