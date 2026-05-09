import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Plus, Edit, Trash2, Search, ShoppingCart, TrendingUp, DollarSign, Eye, X, Save, Upload, Image, Percent, Gem, Settings, Users, Wallet, Crown, Bell, Phone, Mail, Calendar, BadgeCheck, Loader2, Gift, LogOut, MapPin, History, Send, Shield, Info, Folder, FolderSync, CheckCircle, AlertCircle } from 'lucide-react';
import { categories } from '../data/products';
import { Product, User } from '../types';
import { formatPrice } from '../utils/whatsapp';
import { usePrice } from '../context/PriceContext';
import { productService } from '../services/productService';
import { userService } from '../services/userService';
import { configService } from '../services/configService';
import { adminService } from '../services/adminService';
import { bannerService } from '../services/bannerService';
import { couponService } from '../services/couponService';
import { notificationService } from '../services/notificationService';
import { AuditLog } from '../types';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { Banner as BannerType, Coupon } from '../types';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import Papa from 'papaparse';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';


type TabType = 'dashboard' | 'products' | 'bulk' | 'banners' | 'coupons' | 'rates' | 'promotions' | 'customers' | 'orders' | 'notifications' | 'logs';



const CATEGORIES = ['rings', 'necklaces', 'earrings', 'bangles', 'pendants', 'mangalsutra', 'coins'] as const;

const AdminPage: React.FC = () => {
  const { rates, setRates, makingCharges, setMakingCharges } = usePrice();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [ratesDraft, setRatesDraft] = useState({ ...rates });
  const [makingDraft, setMakingDraft] = useState({ ...makingCharges });
  const [imgPreview, setImgPreview] = useState('');
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '', price: '', originalPrice: '', category: 'rings', material: 'gold',
    purity: '22K', occasion: 'daily', description: '', image: '', images: [] as string[],
    netWeight: '', laborCharges: '', inStock: true, featured: false, trending: false,
    diamondDetails: [] as any[],
    variants: [] as any[]
  });
  const [uploading, setUploading] = useState(false);
  const [bulkInput, setBulkInput] = useState('');
  const [syncGranular, setSyncGranular] = useState(false);
  const [syncCategory, setSyncCategory] = useState<string>('rings');
  const [bulkStatus, setBulkStatus] = useState('');


  const [customers, setCustomers] = useState<User[]>([]);
  const [custSearch, setCustSearch] = useState('');
  const [selectedCust, setSelectedCust] = useState<User | null>(null);

  // New States
  const [banners, setBanners] = useState<BannerType[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [adminPass, setAdminPass] = useState('');

  // Notification Tool State
  const [notifForm, setNotifForm] = useState({
    title: '',
    message: '',
    type: 'system' as 'system' | 'offer' | 'order',
    target: 'all' as 'all' | 'specific',
    specificPhone: ''
  });
  const [sendingNotif, setSendingNotif] = useState(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Notification States
  const [notifTarget, setNotifTarget] = useState<'all' | string>('all');
  const [notifContent, setNotifContent] = useState({ title: '', message: '' });

  // New Admin Features States
  const [uploadQueue, setUploadQueue] = useState<{ file: File, progress: number, url?: string, id: string }[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [bulkProcessingProgress, setBulkProcessingProgress] = useState(0);
  const [duplicateConflict, setDuplicateConflict] = useState<Product[]>([]);
  const [folderImportData, setFolderImportData] = useState<{name: string, files: File[]}[]>([]);
  const [showFolderPreview, setShowFolderPreview] = useState(false);

  const [promoSettings, setPromoSettings] = useState({
    newUserBonus: 100,
    referrerCredit: 100,
    spinSegments: [
      { id: 1, label: '₹500 Cash', weight: 'High Risk', value: 500, type: 'cash' },
      { id: 2, label: 'Gold Coin', weight: 'Very Low', value: 0, type: 'item' },
      { id: 3, label: '₹250 Cash', weight: 'Medium', value: 250, type: 'cash' },
      { id: 4, label: 'Diamond Pendant', weight: 'Extremely Low', value: 0, type: 'item' }
    ]
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'promotions'));
        if (docSnap.exists()) {
          setPromoSettings(prev => ({ ...prev, ...docSnap.data() }));
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      }
    };
    fetchSettings();
  }, []);

  const handleSavePromotions = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, 'settings', 'promotions'), promoSettings);
      await adminService.createAuditLog({
        adminId: auth.currentUser?.uid || 'unknown',
        adminEmail: auth.currentUser?.email || 'unknown',
        action: 'UPDATE_PROMOTIONS',
        details: 'Changed referral bonuses and spin probabilities.'
      });
      alert('Promotion settings saved successfully!');
    } catch (err: any) {
      alert('Error saving settings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => processFiles(acceptedFiles),
    accept: { 'image/*': [] },
    multiple: true
  });

  // Load Data


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && user.email === 'admin@arham.com') {
        loadAdminData();
        setIsAuthorized(true);
        localStorage.setItem('admin_auth', 'true');
      } else {
        if (user) console.warn("Logged in as non-admin:", user.email || user.phoneNumber);
        localStorage.removeItem('admin_auth');
        setIsAuthorized(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const logs = await adminService.getAuditLogs();
      setAuditLogs(logs);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchLogs();
    }
  }, [activeTab]);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingNotif(true);
    try {
      let uids: string[] = [];
      if (notifForm.target === 'specific') {
        const targetUser = customers.find(c => c.phone === notifForm.specificPhone);
        if (!targetUser) throw new Error("Customer with this phone number not found.");
        uids = [targetUser.id];
      }
      const sentCount = await adminService.sendMassNotification(
        notifForm.target,
        {
          title: notifForm.title,
          message: notifForm.message,
          type: notifForm.type
        },
        uids.length > 0 ? uids : undefined
      );

      await adminService.createAuditLog({
        adminId: auth.currentUser?.uid || 'unknown',
        adminEmail: auth.currentUser?.email || 'unknown',
        action: 'SEND_NOTIFICATION',
        details: `Sent ${notifForm.type} notification to ${notifForm.target === 'all' ? 'all users' : notifForm.specificPhone}. (${sentCount} users)`
      });

      alert(`Notification sent successfully to ${sentCount} users!`);
      setNotifForm({ title: '', message: '', type: 'system', target: 'all', specificPhone: '' });
    } catch (error: any) {
      console.error("NOTIFICATION ERROR:", error);
      alert(`Error Code: ${error.code || 'unknown'}\nMessage: ${error.message}\nYour UID: ${auth.currentUser?.uid}`);
    } finally {
      setSendingNotif(false);
    }
  };

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [allProducts, allUsers, allBanners, allCoupons] = await Promise.all([
        productService.getAllProducts(),
        userService.getAllUsers(),
        bannerService.getAllBanners(),
        couponService.getAllCoupons()
      ]);
      setProducts(allProducts);
      setCustomers(allUsers);
      setBanners(allBanners);
      setCoupons(allCoupons);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (adminPass === 'arham786') {
      try {
        // Sign out any existing user first to be sure
        await auth.signOut();
        const userCred = await signInWithEmailAndPassword(auth, 'admin@arham.com', 'arham786');
        if (userCred.user.email === 'admin@arham.com') {
          localStorage.setItem('admin_auth', 'true');
          setIsAuthorized(true);
        } else {
          alert('Unauthorized account');
        }
      } catch (err: any) {
        console.error("Login Error:", err);
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          try {
            const newAdmin = await createUserWithEmailAndPassword(auth, 'admin@arham.com', 'arham786');
            // Ensure admin document exists with role
            await userService.updateUserProfile(newAdmin.user.uid, {
              email: 'admin@arham.com',
              role: 'admin',
              joinedDate: new Date().toISOString()
            });
            localStorage.setItem('admin_auth', 'true');
            setIsAuthorized(true);
          } catch (createErr) {
            alert('Firebase Error. Please enable Email/Password Authentication and Firestore in the Firebase Console.');
          }
        } else {
          alert('Login failed: ' + err.message);
        }
      } finally {
        setLoading(false);
      }
    } else {
      alert('Incorrect password');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    localStorage.removeItem('admin_auth');
    setIsAuthorized(false);
  };

  const sendNotification = async () => {
    if (!notifContent.title || !notifContent.message) return;
    setLoading(true);
    try {
      if (notifTarget === 'all') {
        await notificationService.sendBulkNotification(notifContent.title, notifContent.message);
      } else {
        await notificationService.sendPrivateNotification(notifTarget, notifContent.title, notifContent.message);
      }
      alert('Notification sent successfully!');
      setNotifContent({ title: '', message: '' });
    } catch (e) {
      alert('Failed to send notification');
    } finally {
      setLoading(false);
    }
  };


  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: products.length,
    value: products.reduce((s, p) => s + p.price, 0),
    featured: products.filter(p => p.featured).length,
    inStock: products.filter(p => p.inStock).length
  };

  const resetForm = () => {
    setFormData({
      name: '', price: '', originalPrice: '', category: 'rings', material: 'gold', purity: '22K', occasion: 'daily', description: '', image: '', images: [], netWeight: '', laborCharges: '', inStock: true, featured: false, trending: false,
      diamondDetails: [],
      variants: []
    });
    setImgPreview(''); setEditingProduct(null);
    setUploadQueue([]);
    setImagesToDelete([]);
  };


  const openAdd = () => { resetForm(); setShowModal(true); };
  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      price: p.price.toString(),
      originalPrice: p.originalPrice?.toString() || '',
      category: p.category,
      material: p.material,
      purity: p.purity || '22K',
      occasion: p.occasion,
      description: p.description,
      image: p.images ? p.images[0] : (p as any).image || '',
      netWeight: (p.netWeight || '').toString(),

      laborCharges: (p.laborCharges || '').toString(),
      inStock: p.inStock,
      featured: p.featured || false,
      trending: p.trending || false,
      diamondDetails: p.diamondDetails || [],
      variants: p.variants || [],
      images: p.images || []
    });
    setImgPreview(p.images ? p.images[0] : (p as any).image || '');
    setShowModal(true);

  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
    if (name === 'image') setImgPreview(value);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await productService.uploadImage(file);
      setFormData(prev => ({ ...prev, image: url }));
      setImgPreview(url);
    } catch (error) {
      alert("Image upload failed.");
    } finally {
      setUploading(false);
    }
  };


  const handleCompressedUpload = async (file: File) => {
    const uploadId = Math.random().toString(36).substr(2, 9);
    setUploadQueue(prev => [...prev, { file, progress: 10, id: uploadId }]);

    try {
      // 1. Auto Image Compression
      const options = {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1920,
        useWebWorker: true
      };

      const compressedFile = await imageCompression(file, options);
      setUploadQueue(prev => prev.map(item => item.id === uploadId ? { ...item, progress: 40 } : item));

      // 2. Upload to Firebase
      const url = await productService.uploadImage(compressedFile);

      setUploadQueue(prev => prev.map(item => item.id === uploadId ? { ...item, progress: 100, url } : item));

      // Update form data image (for single image case or first image)
      if (!formData.image) {
        setFormData(prev => ({ ...prev, image: url }));
        setImgPreview(url);
      }

      return url;
    } catch (error) {
      console.error("Compression/Upload error:", error);
      setUploadQueue(prev => prev.filter(item => item.id !== uploadId));
      throw error;
    }
  };

  const processFiles = async (files: File[]) => {
    setUploading(true);
    const urls = [];
    for (const file of files) {
      try {
        const url = await handleCompressedUpload(file);
        urls.push(url);
      } catch (e) {
        alert(`Failed to upload ${file.name}`);
      }
    }
    setUploading(false);
    return urls;
  };

  const removeImage = (url: string) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter(u => u !== url) }));
    // Track for permanent deletion from storage upon saving
    if (!url.includes('unsplash.com')) {
      setImagesToDelete(prev => [...prev, url]);
    }
  };

  const saveProduct = async () => {
    if (!formData.name || !formData.price) {
      alert("Please enter product name and price");
      return;
    }

    setLoading(true);

    // Collect all uploaded images from queue + existing images
    const uploadedUrls = uploadQueue.filter(q => q.url).map(q => q.url!);
    const allImages = [...formData.images, ...uploadedUrls];

    // Deterministic ID based on name for new products to prevent duplicates
    const slugify = (text: string) => text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    const productId = editingProduct?.id || `${slugify(formData.name)}-${Date.now().toString().slice(-4)}`;

    // Check for duplicate name if it's a NEW product
    if (!editingProduct) {
      const isDuplicate = products.some(p => p.name.toLowerCase().trim() === formData.name.toLowerCase().trim());
      if (isDuplicate) {
        const confirmOverwrite = window.confirm(`A product named "${formData.name}" already exists. Do you want to create another one anyway?`);
        if (!confirmOverwrite) {
          setLoading(false);
          return;
        }
      }
    }

    const productData: Product = {
      id: productId,
      name: formData.name,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
      category: formData.category as Product['category'],
      material: formData.material as Product['material'],
      purity: formData.purity,
      occasion: formData.occasion as Product['occasion'],
      description: formData.description,
      images: allImages.length > 0 ? allImages : ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500'],
      netWeight: formData.netWeight ? Number(formData.netWeight) : undefined,
      laborCharges: formData.laborCharges ? Number(formData.laborCharges) : undefined,
      inStock: formData.inStock,
      featured: formData.featured,
      trending: formData.trending,
      diamondDetails: formData.diamondDetails,
      variants: formData.variants,
      rating: editingProduct?.rating || 4.5,
      reviews: editingProduct?.reviews || 0
    };

    try {
      await productService.saveProduct(productData);

      // Cleanup deleted images from storage
      for (const url of imagesToDelete) {
        await productService.deleteImage(url);
      }

      await adminService.createAuditLog({
        adminId: auth.currentUser?.uid || 'unknown',
        adminEmail: auth.currentUser?.email || 'unknown',
        action: editingProduct ? 'UPDATE_PRODUCT' : 'CREATE_PRODUCT',
        details: `${editingProduct ? 'Updated' : 'Created'} product: ${formData.name} (ID: ${productId})`
      });

      const allProducts = await productService.getAllProducts();
      setProducts(allProducts);
      setShowModal(false);
      resetForm();
      setUploadQueue([]); // Clear queue after save
      setImagesToDelete([]);
    } catch (error: any) {
      console.error("Save Error:", error);
      alert("Failed to save product: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handleFolderUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const groups: { [key: string]: File[] } = {};
    files.forEach(file => {
      const path = (file as any).webkitRelativePath || '';
      const parts = path.split('/');
      if (parts.length >= 2) {
        // Folder structure: Root/ProductName/image.jpg
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
      alert("No valid product folders detected. Please ensure you select a folder containing subfolders with images.");
      return;
    }

    setFolderImportData(formattedGroups);
    setShowFolderPreview(true);
  };

  const processFolderImport = async () => {
    const confirmed = confirm(`Are you sure you want to import ${folderImportData.length} products? Existing products with matching codes will be updated.`);
    if (!confirmed) return;

    setShowFolderPreview(false);
    setLoading(true);
    setBulkStatus(`Starting import of ${folderImportData.length} products...`);
    setBulkProcessingProgress(1);

    try {
      let count = 0;
      for (const group of folderImportData) {
        const productCode = group.name;
        const existing = products.find(p => p.designNo === productCode || p.name === productCode);
        
        setBulkStatus(`Uploading images for: ${productCode} (${count + 1}/${folderImportData.length})`);
        
        const imageUrls: string[] = [];
        for (const file of group.files) {
          try {
            const url = await handleCompressedUpload(file);
            if (url) imageUrls.push(url);
          } catch (err) {
            console.error(`Failed to upload image for ${productCode}:`, err);
          }
        }

        if (imageUrls.length === 0 && !existing) {
          console.warn(`Skipping ${productCode} - no images and no existing record.`);
          continue;
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
        
        await adminService.createAuditLog({
          adminId: auth.currentUser?.uid || 'unknown',
          adminEmail: auth.currentUser?.email || 'unknown',
          action: existing ? 'UPDATE_PRODUCT_FOLDER' : 'IMPORT_PRODUCT_FOLDER',
          details: `${existing ? 'Updated' : 'Imported'} product ${productCode} from folder import.`
        });

        count++;
        setBulkProcessingProgress(Math.round((count / folderImportData.length) * 100));
      }

      const all = await productService.getAllProducts();
      setProducts(all);
      setBulkStatus(`✅ Successfully processed ${count} products!`);
      setTimeout(() => setBulkStatus(''), 10000);
    } catch (error) {
      console.error("Folder Import Error:", error);
      setBulkStatus('❌ Error during folder import');
    } finally {
      setLoading(false);
      setBulkProcessingProgress(0);
      setFolderImportData([]);
    }
  };

  const handleSyncWithStorage = async () => {
    setLoading(true);
    setBulkStatus(`Scanning Storage... Category: ${syncCategory} | Mode: ${syncGranular ? 'Individual Images' : 'Folders'}`);
    try {
      const addedCount = await productService.syncStorageWithFirestore(syncGranular, syncCategory);
      await adminService.createAuditLog({
        adminId: auth.currentUser?.uid || 'unknown',
        adminEmail: auth.currentUser?.email || 'unknown',
        action: 'STORAGE_SYNC',
        details: `Synchronized Storage with Firestore. Found and added ${addedCount} new products.`
      });
      const all = await productService.getAllProducts();
      setProducts(all);
      setBulkStatus(`✅ Sync Complete! Added ${addedCount} new products.`);
      setTimeout(() => setBulkStatus(''), 5000);
    } catch (error: any) {
      console.error("Sync Error:", error);
      setBulkStatus("❌ Sync Failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllProducts = async () => {
    if (!window.confirm("⚠️ DANGER: This will delete ALL product records from the database. This action cannot be undone. Are you absolutely sure?")) {
      return;
    }

    setLoading(true);
    try {
      await productService.deleteAllProducts();
      await adminService.createAuditLog({
        adminId: auth.currentUser?.uid || 'unknown',
        adminEmail: auth.currentUser?.email || 'unknown',
        action: 'DELETE_ALL_PRODUCTS',
        details: 'Admin deleted all products from the system.'
      });
      const all = await productService.getAllProducts();
      setProducts(all);
      alert("All products have been successfully deleted.");
    } catch (error: any) {
      console.error("Delete All Error:", error);
      alert("Failed to delete all products: " + error.message);
    } finally {
      setLoading(false);
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

        // Transform CSV to Product format
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

        // Duplicate Detection
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
          // Process in chunks for progress bar
          const chunkSize = 10;
          for (let i = 0; i < productsToUpload.length; i += chunkSize) {
            const chunk = productsToUpload.slice(i, i + chunkSize);
            await productService.bulkUpload(chunk as any);
            setBulkProcessingProgress(Math.round(((i + chunk.length) / productsToUpload.length) * 100));
          }

          const all = await productService.getAllProducts();
          setProducts(all);
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

  const handleBulkUpload = async () => {
    if (!bulkInput.trim()) return;
    setLoading(true);
    setBulkStatus('Processing...');
    try {
      const data = JSON.parse(bulkInput);
      const productsToUpload = Array.isArray(data) ? data : [data];

      // Clean data - ensure IDs and required fields
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
      const all = await productService.getAllProducts();
      setProducts(all);
      setBulkInput('');
      setBulkStatus('✅ Successfully uploaded ' + cleaned.length + ' products!');
      setTimeout(() => setBulkStatus(''), 5000);
    } catch (e) {
      setBulkStatus('❌ Error: Invalid JSON format');
    } finally {
      setLoading(false);
    }
  };


  const deleteProduct = async (id: string) => {
    if (confirm('Permanently delete this product and all its images?')) {
      try {
        const productToDelete = products.find(p => p.id === id);

        // 1. Delete Firestore record
        await productService.deleteProduct(id);

        // 2. Clean up all associated images from storage
        if (productToDelete?.images) {
          for (const url of productToDelete.images) {
            await productService.deleteImage(url);
          }
        }

        await adminService.createAuditLog({
          adminId: auth.currentUser?.uid || 'unknown',
          adminEmail: auth.currentUser?.email || 'unknown',
          action: 'DELETE_PRODUCT',
          details: `Deleted product: ${productToDelete?.name} (ID: ${id})`
        });

        setProducts(p => p.filter(x => x.id !== id));
      } catch (error) {
        console.error("Delete Error:", error);
        alert("Failed to delete product.");
      }
    }
  };

  const handleUpdateRates = async () => {
    try {
      await configService.updateRates(ratesDraft);
      setRates(ratesDraft);

      await adminService.createAuditLog({
        adminId: auth.currentUser?.uid || 'unknown',
        adminEmail: auth.currentUser?.email || 'unknown',
        action: 'UPDATE_RATES',
        details: `Updated gold/silver rates to: Gold: ₹${ratesDraft.gold}, Silver: ₹${ratesDraft.silver}`
      });

      alert('✅ Rates updated successfully in Firestore!');
    } catch (error) {
      alert("Failed to update rates.");
    }
  };

  const handleAddBanner = async () => {
    const title = window.prompt("Enter Banner Title (e.g. Diwali Sale):");
    if (!title) return;
    const subtitle = window.prompt("Enter Subtitle:");
    const image = window.prompt("Enter Image URL (or leave blank for placeholder):") || "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800";

    setLoading(true);
    try {
      await bannerService.saveBanner({
        id: Date.now().toString(),
        title,
        subtitle: subtitle || "",
        image,
        link: "/products",
        isActive: true,
        order: banners.length + 1
      });
      const allBanners = await bannerService.getAllBanners();
      setBanners(allBanners);
    } catch (e) {
      alert("Failed to save banner");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!window.confirm("Delete this banner?")) return;
    try {
      await bannerService.deleteBanner(id);
      setBanners(b => b.filter(x => x.id !== id));
    } catch (e) { }
  };

  const handleAddCoupon = async () => {
    const code = window.prompt("Enter Coupon Code (e.g. WELCOME10):");
    if (!code) return;
    const val = window.prompt("Enter Discount Value (in Rupees, e.g. 500):");
    if (!val) return;

    setLoading(true);
    try {
      await couponService.saveCoupon({
        id: Date.now().toString(),
        code: code.toUpperCase(),
        discountType: 'fixed',
        discountValue: Number(val),
        minOrderAmount: 0,
        expiryDate: '2027-12-31',
        isActive: true,
        usageCount: 0
      });
      const allCoupons = await couponService.getAllCoupons();
      setCoupons(allCoupons);
    } catch (e) {
      alert("Failed to create coupon");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      await couponService.deleteCoupon(id);
      setCoupons(c => c.filter(x => x.id !== id));
    } catch (e) { }
  };

  const tabClass = (t: TabType) => `flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${activeTab === t ? 'bg-amber-500 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-amber-50 border border-gray-200'}`;

  if (!isAuthorized) {

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 max-w-md w-full border border-gray-100 space-y-8">
          <div className="text-center space-y-3">
            <div className="w-20 h-20 bg-amber-500 rounded-3xl mx-auto flex items-center justify-center text-white text-4xl shadow-xl shadow-amber-500/30">A</div>
            <h2 className="text-3xl font-heading font-bold text-charcoal">Admin Portal</h2>
            <p className="text-gray-400 text-sm">Enter password to access control panel</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all text-center text-2xl tracking-[0.5em]"
              value={adminPass}
              onChange={e => setAdminPass(e.target.value)}
            />
            <button className="w-full py-4 bg-amber-500 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg active:scale-[0.98]">
              Login to Admin
            </button>
          </form>
          <div className="text-center">
            <Link to="/" className="text-xs font-bold text-gray-400 hover:text-amber-600 transition-colors">← Back to Store</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0D0D0D] text-gray-100 font-sans overflow-hidden">

      {/* Sidebar */}
      <aside className="w-[260px] bg-[#161616] border-r border-[#222222] flex flex-col hidden md:flex flex-shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-[#222222]">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(245,158,11,0.3)]">A</div>
          <span className="ml-3 font-extrabold text-white tracking-wide uppercase">Arham Admin</span>
        </div>

        <div className="px-6 mt-6 mb-2">
          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.2em] font-bold">Main Navigation</span>
        </div>

        <div className="flex flex-col gap-1 px-4 overflow-y-auto pb-4 flex-1">
          {[
            ['dashboard', 'Dashboard', TrendingUp],
            ['products', 'Products', Package],
            ['banners', 'Campaigns', Image],
            ['promotions', 'Membership', Crown],
            ['rates', 'Market Rates', Gem],
            ['customers', 'Clients', Users],
            ['orders', 'Invoices', ShoppingCart],
            ['bulk', 'Data Sync', Upload],
            ['notifications', 'Notifications', Bell],
            ['logs', 'Audit Logs', History]
          ].map(([id, label, Icon]: any) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-300 group ${isActive ? 'bg-white/5 text-[#F1F5F9]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <Icon size={16} className={`${isActive ? 'text-[#3B82F6]' : 'text-gray-500 group-hover:text-gray-300'} transition-colors`} />
                <span className="font-medium">{label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-[#222222]">
          <button onClick={() => { localStorage.removeItem('admin_auth'); setIsAuthorized(false); }} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0D0D0D]">

        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-[#222222] bg-[#161616]/50 backdrop-blur-md sticky top-0 z-40 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 text-gray-400 hover:text-white"><Settings size={20} /></button>
            <h2 className="text-[18px] font-extrabold text-white capitalize">{activeTab} Overview</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-3 px-4 py-1.5 bg-[#1C1C1C] border border-[#222222] rounded-xl">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <div className="text-right">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Active Admin</p>
                <p className="text-xs text-white font-mono">{auth.currentUser?.email}</p>
              </div>
            </div>

            <Link to="/" className="px-4 py-2 bg-[#1C1C1C] border border-[#222222] text-gray-300 hover:text-white rounded-lg text-xs font-bold transition-colors hidden sm:block">Storefront</Link>

            <button onClick={handleLogout} className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2">
              <LogOut size={14} /> Logout
            </button>
          </div>
        </header>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <Loader2 className="animate-spin text-[#3B82F6]" size={48} />
              <p className="text-gray-500 font-mono uppercase tracking-widest text-xs font-bold">Syncing Records...</p>
            </div>
          ) : (
            <>
              {/* DASHBOARD */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">

                  {/* Summary Metrics Strip */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                      { label: 'TOTAL PRODUCTS', val: stats.total, color: 'text-[#3B82F6]', bg: 'bg-[#3B82F6]/10', Icon: Package },
                      { label: 'INVENTORY VALUE', val: `₹${stats.value.toLocaleString('en-IN')}`, color: 'text-[#34D399]', bg: 'bg-[#34D399]/10', Icon: DollarSign },
                      { label: 'FEATURED ITEMS', val: stats.featured, color: 'text-[#FBBF24]', bg: 'bg-[#FBBF24]/10', Icon: TrendingUp },
                      { label: 'IN STOCK ITEMS', val: stats.inStock, color: 'text-[#FB7185]', bg: 'bg-[#FB7185]/10', Icon: ShoppingCart },
                    ].map(({ label, val, color, bg, Icon }) => (
                      <div key={label} className="bg-[#161616] border border-[#222222] rounded-xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-[#3B82F6]/50 transition-colors duration-300">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--mouse-x,_50%)_var(--mouse-y,_50%),_rgba(59,130,246,0.08)_0%,_transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${bg} mb-4`}>
                          <Icon size={20} className={color} />
                        </div>
                        <div>
                          <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{label}</p>
                          <p className="text-2xl font-mono text-gray-100 mt-1">{val}</p>
                        </div>
                      </div>
                    ))}
                    <div className="bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-xl p-4 flex flex-col justify-between shadow-[0_0_30px_rgba(59,130,246,0.3)] border border-blue-400/20">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-white/20 mb-4 backdrop-blur-md">
                        <Upload size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] font-mono text-blue-100 uppercase tracking-widest">Global Action</p>
                        <p className="text-lg font-bold text-white mt-1 cursor-pointer hover:underline" onClick={sendNotification}>Send Broadcast</p>
                      </div>
                    </div>
                  </div>

                  {/* Bulk Actions Bar */}
                  <div className="flex items-center justify-between bg-[#3B82F6]/10 border border-[#3B82F6] px-5 py-3 rounded-xl">
                    <span className="text-[11px] font-bold text-[#3B82F6] font-mono uppercase">System Healthy • Sync Active</span>
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 bg-[#161616] border border-[#222222] hover:border-[#3B82F6] text-white text-[11px] font-bold rounded-lg transition-colors">Export CSV</button>
                      <button className="px-3 py-1.5 bg-[#161616] border border-[#222222] hover:border-[#3B82F6] text-white text-[11px] font-bold rounded-lg transition-colors">Print Report</button>
                    </div>
                  </div>

                  {/* Data Table Section */}
                  <div className="bg-[#161616] rounded-[16px] border border-[#222222] overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#222222] bg-white/[0.02]">
                      <div className="col-span-4 text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-gray-500">Product Name</div>
                      <div className="col-span-2 text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-gray-500">Category</div>
                      <div className="col-span-3 text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-gray-500 text-right">Price</div>
                      <div className="col-span-3 text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-gray-500 text-center">Status</div>
                    </div>
                    <div className="divide-y divide-[#222222]">
                      {products.slice(0, 10).map(p => (
                        <div key={p.id} className="grid grid-cols-12 gap-4 px-6 items-center h-[56px] hover:bg-white/[0.02] transition-colors cursor-pointer group relative">
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--mouse-x,_50%)_var(--mouse-y,_50%),_rgba(59,130,246,0.08)_0%,_transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                          <div className="col-span-4 flex items-center gap-3 min-w-0">
                            <img src={p.images ? p.images[0] : (p as any).image} className="w-8 h-8 rounded-lg object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="" />
                            <span className="text-sm font-medium text-gray-200 truncate">{p.name}</span>
                          </div>
                          <div className="col-span-2 text-xs text-gray-400 capitalize">{p.category}</div>
                          <div className="col-span-3 text-sm font-mono text-right text-gray-300">₹{Number(p.price).toLocaleString('en-IN')}</div>
                          <div className="col-span-3 flex justify-center">
                            {p.inStock ? (
                              <span className="inline-flex items-center gap-2 h-6 px-3 rounded-full text-[10px] font-bold text-[#34D399] bg-[#34D399]/10">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse"></span>
                                IN STOCK
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-2 h-6 px-3 rounded-full text-[10px] font-bold text-[#FB7185] bg-[#FB7185]/10">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#FB7185]"></span>
                                OUT OF STOCK
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* BANNERS */}
              {activeTab === 'banners' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">Homepage Banners</h3>
                    <button onClick={handleAddBanner} className="px-4 py-2 bg-[#3B82F6] text-white rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:bg-blue-600 transition flex items-center gap-2">
                      <Plus size={16} /> Add Banner
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {banners.map(b => (
                      <div key={b.id} className="bg-[#161616] rounded-3xl overflow-hidden border border-[#222222] shadow-sm group">
                        <div className="aspect-video relative">
                          <img src={b.image} className="w-full h-full object-cover" alt="" />
                          <div className="absolute top-3 right-3 flex gap-1">
                            <button className="p-2 bg-black/60 backdrop-blur-md rounded-xl text-gray-300 hover:text-blue-400 shadow-sm transition"><Edit size={14} /></button>
                            <button onClick={() => handleDeleteBanner(b.id)} className="p-2 bg-black/60 backdrop-blur-md rounded-xl text-gray-300 hover:text-red-400 shadow-sm transition"><Trash2 size={14} /></button>
                          </div>
                        </div>
                        <div className="p-5 space-y-2">
                          <h4 className="font-bold text-white">{b.title}</h4>
                          <p className="text-xs text-gray-400">{b.subtitle}</p>
                          <div className="flex items-center justify-between pt-2">
                            <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${b.isActive ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-white/5 text-gray-400 border-white/10'}`}>
                              {b.isActive ? 'Active' : 'Draft'}
                            </span>
                            <span className="text-xs text-gray-500 font-mono">Order: {b.order}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {banners.length === 0 && (
                      <div className="col-span-full py-20 text-center bg-[#161616] rounded-3xl border border-dashed border-[#333333]">
                        <Image size={48} className="mx-auto text-[#333333] mb-3" />
                        <p className="text-gray-500 font-medium">No banners found. Start by adding one!</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* BULK */}
              {activeTab === 'bulk' && (
                <div className="max-w-4xl space-y-4">
                  <div className="bg-[#161616] rounded-2xl border border-[#222222] p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#3B82F6]/10 rounded-2xl flex items-center justify-center text-[#3B82F6]">
                          <Upload size={24} />
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
                        <button onClick={handleSyncWithStorage} className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl text-xs font-bold hover:bg-purple-500/20 transition-colors flex items-center gap-2">
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
                        <button className="px-4 py-2 bg-white/5 border border-white/10 text-gray-300 rounded-xl text-xs font-bold hover:bg-white/10 transition-colors">Download Template</button>
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

                      <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-xl mb-4">
                        <p className="text-sm text-blue-400 font-medium">📸 <b>Smart Media Sync:</b></p>
                        <p className="text-xs text-blue-300 mt-1">For CSV uploads, ensure image URLs are comma-separated in the "images" column. Duplicate products are automatically detected by name.</p>
                      </div>

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
                          disabled={!bulkInput.trim()}
                          className="px-8 py-3 bg-[#3B82F6] text-white rounded-xl font-bold shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:bg-blue-600 transition disabled:opacity-50 disabled:shadow-none"
                        >
                          Process JSON Sync
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}


              {/* COUPONS */}
              {activeTab === 'coupons' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">Discount Coupons</h3>
                    <button onClick={handleAddCoupon} className="px-5 py-2 bg-[#10B981] text-white rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-2 hover:bg-green-500 transition">
                      <Plus size={16} /> Create Coupon
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {coupons.map(c => (
                      <div key={c.id} className="bg-[#161616] rounded-3xl p-6 border border-[#222222] shadow-sm flex items-center justify-between group hover:border-[#333333] transition">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-[#10B981]/10 rounded-2xl flex items-center justify-center text-[#10B981] border border-[#10B981]/20">
                            <Percent size={24} />
                          </div>
                          <div>
                            <p className="text-lg font-black text-white tracking-wider">{c.code}</p>
                            <p className="text-xs text-gray-400 font-medium">
                              {c.discountType === 'percentage' ? `${c.discountValue}% Off` : `₹${c.discountValue} Off`}
                              · Min: ₹{c.minOrderAmount}
                            </p>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <div className="flex gap-2 justify-end">
                            <button className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-blue-400 transition"><Edit size={16} /></button>
                            <button onClick={() => handleDeleteCoupon(c.id)} className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-red-400 transition"><Trash2 size={16} /></button>
                          </div>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${c.isActive ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-white/5 text-gray-400 border-white/10'}`}>
                            {c.isActive ? 'Live' : 'Paused'}
                          </span>
                        </div>
                      </div>
                    ))}
                    {coupons.length === 0 && (
                      <div className="col-span-full py-20 text-center bg-[#161616] rounded-3xl border border-dashed border-[#333333]">
                        <Percent size={48} className="mx-auto text-[#333333] mb-3" />
                        <p className="text-gray-500 font-medium">No active coupons. Create one to drive sales!</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PROMOTIONS */}
              {activeTab === 'promotions' && (
                <div className="max-w-2xl space-y-6">
                  <div className="bg-[#161616] rounded-[2.5rem] p-8 border border-[#222222] shadow-sm space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-500/20">
                        <Crown size={28} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">Growth Engine</h3>
                        <p className="text-sm text-gray-400">Configure referral and spin rewards</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h4 className="font-bold text-white text-sm flex items-center gap-2">
                          <Users size={16} className="text-[#3B82F6]" /> Referral Bonuses
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">New User Bonus</label>
                            <div className="flex items-center border border-[#222222] rounded-2xl px-4 py-3 bg-[#0D0D0D] focus-within:border-[#3B82F6] transition">
                              <span className="text-gray-500 mr-2">₹</span>
                              <input
                                type="number"
                                value={promoSettings.newUserBonus}
                                onChange={e => setPromoSettings({ ...promoSettings, newUserBonus: parseInt(e.target.value) })}
                                className="bg-transparent text-white w-full outline-none font-bold"
                              />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Referrer Credit</label>
                            <div className="flex items-center border border-[#222222] rounded-2xl px-4 py-3 bg-[#0D0D0D] focus-within:border-[#3B82F6] transition">
                              <span className="text-gray-500 mr-2">₹</span>
                              <input
                                type="number"
                                value={promoSettings.referrerCredit}
                                onChange={e => setPromoSettings({ ...promoSettings, referrerCredit: parseInt(e.target.value) })}
                                className="bg-transparent text-white w-full outline-none font-bold"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="pt-6 border-t border-[#222222]">
                          <div className="flex items-center justify-between mb-4">
                            <div className="space-y-1">
                              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                                <Gift size={16} className="text-purple-500" /> Spin Segment Probability
                              </h4>
                              <p className="text-xs text-gray-500">Adjust the weight for higher/lower chances of winning specific rewards.</p>
                            </div>
                            <button
                              onClick={() => {
                                const newId = Math.max(...(promoSettings.spinSegments?.map(s => s.id) || [0])) + 1;
                                const newSegments = [...(promoSettings.spinSegments || []), { id: newId, label: 'New Reward', value: 0, weight: 'Medium', type: 'cash' }];
                                setPromoSettings({ ...promoSettings, spinSegments: newSegments });
                              }}
                              className="px-4 py-2 bg-purple-500/10 text-purple-500 rounded-xl text-xs font-bold hover:bg-purple-500/20 transition flex items-center gap-2"
                            >
                              + Add Segment
                            </button>
                          </div>
                          <div className="space-y-3">
                            {promoSettings.spinSegments?.map((s, idx) => (
                              <div key={s.id} className="flex items-center justify-between p-4 bg-[#0D0D0D] border border-[#222222] rounded-2xl hover:border-[#333333] transition gap-4">
                                <div className="flex flex-col gap-3 flex-1">
                                  <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                      <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest block mb-1">Display Label</span>
                                      <input
                                        className="font-bold text-sm text-white bg-white/5 border border-white/10 rounded-xl px-3 py-2 w-full outline-none focus:border-amber-500/50 transition"
                                        value={s.label}
                                        onChange={e => {
                                          const newSegments = [...(promoSettings.spinSegments || [])];
                                          newSegments[idx].label = e.target.value;
                                          setPromoSettings({ ...promoSettings, spinSegments: newSegments });
                                        }}
                                      />
                                    </div>
                                    <div className="w-32">
                                      <span className="text-[9px] text-amber-500 uppercase font-black tracking-widest block mb-1">Actual Amount (₹)</span>
                                      <input
                                        type="number"
                                        className="font-bold text-lg text-amber-500 bg-amber-500/5 border border-amber-500/20 rounded-xl px-3 py-2 w-full outline-none focus:border-amber-500 transition"
                                        value={s.value}
                                        onChange={e => {
                                          const newSegments = [...(promoSettings.spinSegments || [])];
                                          newSegments[idx].value = parseInt(e.target.value) || 0;
                                          setPromoSettings({ ...promoSettings, spinSegments: newSegments });
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex flex-col items-end">
                                    <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest block mb-1">Win Chance</span>
                                    <select
                                      value={s.weight}
                                      onChange={e => {
                                        const newSegments = [...(promoSettings.spinSegments || [])];
                                        newSegments[idx].weight = e.target.value;
                                        setPromoSettings({ ...promoSettings, spinSegments: newSegments });
                                      }}
                                      className="bg-[#1C1C1C] text-gray-300 border border-[#333333] rounded-lg px-2 py-1.5 text-xs font-bold outline-none focus:border-[#3B82F6]"
                                    >
                                      <option>Extremely Low</option>
                                      <option>Very Low</option>
                                      <option>Medium</option>
                                      <option>High Risk</option>
                                    </select>
                                  </div>
                                  <button
                                    onClick={() => {
                                      const newSegments = (promoSettings.spinSegments || []).filter((_, i) => i !== idx);
                                      setPromoSettings({ ...promoSettings, spinSegments: newSegments });
                                    }}
                                    className="mt-4 p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={handleSavePromotions}
                          disabled={loading}
                          className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-2xl font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] disabled:opacity-50"
                        >
                          {loading ? 'Saving...' : 'Save Promotion Settings'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* NOTIFICATIONS TOOL */}
              {activeTab === 'notifications' && (
                <div className="max-w-3xl space-y-6">
                  <div className="bg-[#161616] rounded-[2.5rem] p-8 border border-[#222222] shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20">
                        <Bell className="text-amber-500" size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Push Notifications</h3>
                        <p className="text-sm text-gray-500">Send updates, offers, or alerts to your users</p>
                      </div>
                    </div>

                    <form onSubmit={handleSendNotification} className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Target Audience</label>
                          <select
                            value={notifForm.target}
                            onChange={e => setNotifForm({ ...notifForm, target: e.target.value as any })}
                            className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#222222] rounded-xl text-white outline-none focus:border-amber-500"
                          >
                            <option value="all">All Registered Users</option>
                            <option value="specific">Specific Customer (by phone)</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Notification Type</label>
                          <select
                            value={notifForm.type}
                            onChange={e => setNotifForm({ ...notifForm, type: e.target.value as any })}
                            className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#222222] rounded-xl text-white outline-none focus:border-amber-500"
                          >
                            <option value="system">System Update</option>
                            <option value="offer">Special Offer / Reward</option>
                            <option value="order">Order Update</option>
                          </select>
                        </div>
                      </div>

                      {notifForm.target === 'specific' && (
                        <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Customer Phone Number</label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <input
                              type="tel"
                              required
                              placeholder="e.g. 8329776361"
                              value={notifForm.specificPhone}
                              onChange={e => setNotifForm({ ...notifForm, specificPhone: e.target.value })}
                              className="w-full pl-12 pr-4 py-3 bg-[#0D0D0D] border border-[#222222] rounded-xl text-white outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Notification Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Mega Sale Starts Now! 🎉"
                          value={notifForm.title}
                          onChange={e => setNotifForm({ ...notifForm, title: e.target.value })}
                          className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#222222] rounded-xl text-white outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Message Body</label>
                        <textarea
                          required
                          rows={4}
                          placeholder="Write your message here..."
                          value={notifForm.message}
                          onChange={e => setNotifForm({ ...notifForm, message: e.target.value })}
                          className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#222222] rounded-xl text-white outline-none focus:border-amber-500 resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={sendingNotif}
                        className="w-full py-4 bg-amber-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-amber-600 transition disabled:opacity-50"
                      >
                        {sendingNotif ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                        {sendingNotif ? 'Sending Notifications...' : 'Send Notification'}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* AUDIT LOGS */}
              {activeTab === 'logs' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-white">Audit Logs</h3>
                      <p className="text-sm text-gray-500">Security history and admin activity tracking</p>
                    </div>
                    <button
                      onClick={fetchLogs}
                      className="p-2 hover:bg-[#222222] rounded-lg text-gray-400 transition"
                      title="Refresh logs"
                    >
                      <Loader2 className={`${logsLoading ? 'animate-spin' : ''}`} size={20} />
                    </button>
                  </div>

                  <div className="bg-[#161616] rounded-2xl border border-[#222222] overflow-hidden shadow-xl">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-[#0D0D0D] border-b border-[#222222]">
                          <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Timestamp</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Admin</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Action</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#222222]">
                        {auditLogs.length > 0 ? auditLogs.map(log => (
                          <tr key={log.id} className="hover:bg-white/[0.02] transition">
                            <td className="px-6 py-4">
                              <p className="text-xs text-gray-400 font-medium">
                                {new Date(log.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                              </p>
                              <p className="text-[10px] text-gray-600">
                                {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Shield size={14} className="text-amber-500" />
                                <p className="text-xs font-bold text-gray-300">{log.adminEmail.split('@')[0]}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${log.action.includes('DELETE') ? 'bg-red-500/10 text-red-500' :
                                log.action.includes('CREATE') ? 'bg-green-500/10 text-green-500' :
                                  'bg-blue-500/10 text-blue-500'
                                }`}>
                                {log.action.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-xs text-gray-400 max-w-md line-clamp-2">{log.details}</p>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={4} className="px-6 py-24 text-center">
                              {logsLoading ? (
                                <Loader2 className="animate-spin mx-auto text-gray-500" size={32} />
                              ) : (
                                <>
                                  <History className="mx-auto text-gray-700 mb-4" size={48} />
                                  <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">No logs found</p>
                                </>
                              )}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* PRODUCTS */}
              {activeTab === 'products' && (
                <div className="space-y-4">
                  <div className="bg-[#161616] rounded-2xl border border-[#222222] p-4 flex flex-wrap gap-3 items-center justify-between shadow-sm">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search products..." className="w-full pl-10 pr-4 py-2 border border-[#222222] bg-[#0D0D0D] text-gray-300 rounded-xl text-sm focus:outline-none focus:border-amber-500 placeholder-gray-600" />
                    </div>
                    <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition shadow-[0_0_15px_rgba(245,158,11,0.3)] font-medium text-sm">
                      <Plus size={18} /> Add Product
                    </button>
                    {products.length > 0 && (
                      <button 
                        onClick={handleDeleteAllProducts} 
                        className="flex items-center gap-2 px-5 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition font-medium text-sm"
                      >
                        <Trash2 size={18} /> Clear All
                      </button>
                    )}
                  </div>
                  <div className="bg-[#161616] rounded-2xl border border-[#222222] shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-white/[0.02] border-b border-[#222222]">
                          <tr>{['Product', 'Category', 'Price', 'Weight', 'Making%', 'Status', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-[10px] font-mono font-bold text-gray-500 uppercase tracking-wider">{h}</th>)}</tr>
                        </thead>
                        <tbody className="divide-y divide-[#222222]">
                          {filtered.map(p => (
                            <tr key={p.id} className="hover:bg-white/[0.02] transition">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <img src={p.images ? p.images[0] : (p as any).image} alt={p.name} className="w-11 h-11 rounded-xl object-cover border border-[#333333] opacity-90" />
                                  <div>
                                    <p className="font-medium text-gray-200 text-sm line-clamp-1">{p.name}</p>
                                    <div className="flex gap-1 mt-0.5">
                                      <span className="text-[9px] text-gray-500 font-mono">#{p.designNo || 'N/A'}</span>
                                      {p.featured && <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded font-medium border border-amber-500/20">Featured</span>}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-400 capitalize">{p.category}</td>
                              <td className="px-4 py-3 font-mono text-gray-300 text-sm">₹{p.price.toLocaleString('en-IN')}</td>
                              <td className="px-4 py-3 text-sm text-amber-500 font-mono">{p.netWeight || 0}g</td>
                              <td className="px-4 py-3 text-sm text-gray-500">{p.laborCharges ?? makingCharges[p.category as keyof typeof makingCharges]}%</td>
                              <td className="px-4 py-3">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${p.inStock ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>{p.inStock ? 'In Stock' : 'Out of Stock'}</span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex gap-1">
                                  <Link to={`/product/${p.id}`} className="p-1.5 text-gray-500 hover:text-blue-400 hover:bg-white/5 rounded-lg transition"><Eye size={16} /></Link>
                                  <button onClick={() => openEdit(p)} className="p-1.5 text-gray-500 hover:text-amber-400 hover:bg-white/5 rounded-lg transition"><Edit size={16} /></button>
                                  <button onClick={() => deleteProduct(p.id)} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition"><Trash2 size={16} /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* METAL RATES */}
              {activeTab === 'rates' && (
                <div className="max-w-2xl space-y-4">
                  <div className="bg-[#161616] rounded-2xl border border-[#222222] p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20"><Gem className="text-amber-500" size={20} /></div>
                      <div><h3 className="font-bold text-white">Live Metal Rates</h3><p className="text-xs text-gray-400">Rate per gram (₹) — changes apply to all products immediately</p></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {([['gold24K', 'Gold 24K', '#FFD700'], ['gold22K', 'Gold 22K', '#FFC125'], ['gold18K', 'Gold 18K', '#DAA520'], ['gold14K', 'Gold 14K', '#B8860B'], ['silver', 'Silver (per g)', '#C0C0C0'], ['platinum', 'Platinum (per g)', '#E5E4E2']] as const).map(([key, label, color]) => (
                        <div key={key} className="space-y-1.5">
                          <label className="text-xs font-semibold text-gray-400 flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full inline-block" style={{ background: color }} />
                            {label}
                          </label>
                          <div className="flex items-center border border-[#222222] rounded-xl overflow-hidden focus-within:border-amber-500 transition bg-[#0D0D0D]">
                            <span className="px-3 py-2.5 bg-[#1C1C1C] text-gray-400 text-sm border-r border-[#222222]">₹</span>
                            <input type="number" value={ratesDraft[key]} onChange={e => setRatesDraft(r => ({ ...r, [key]: Number(e.target.value) }))}
                              className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none font-medium text-white" />
                          </div>
                        </div>
                      ))}
                    </div>
                    <button onClick={handleUpdateRates}
                      className="mt-6 w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-bold hover:opacity-90 transition flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                      <Save size={18} /> Save Metal Rates
                    </button>
                  </div>
                </div>
              )}

              {/* ORDERS */}
              {activeTab === 'orders' && (
                <div className="bg-[#161616] rounded-2xl border border-[#222222] shadow-sm p-12 text-center">
                  <ShoppingCart className="mx-auto text-[#333333] mb-4" size={52} />
                  <h3 className="font-bold text-white mb-1">No Orders Yet</h3>
                  <p className="text-sm text-gray-500">Orders received via WhatsApp will appear here.</p>
                </div>
              )}

              {/* CUSTOMERS */}
              {activeTab === 'customers' && (
                <div className="space-y-5">
                  {/* Stats row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Total Members', val: customers.length, icon: Users, color: 'blue' },
                      { label: 'Wallet Issued', val: `₹${customers.reduce((s, c) => s + (c.walletBalance || 0), 0).toLocaleString()}`, icon: Wallet, color: 'amber' },
                      { label: 'Total Referrals', val: customers.reduce((s, c) => s + (c.referralCount || 0), 0), icon: BadgeCheck, color: 'green' },
                      { label: 'Notifications', val: customers.reduce((s, c) => s + (c.notifications?.length || 0), 0), icon: Bell, color: 'purple' },
                    ].map(({ label, val, icon: Icon, color }) => (
                      <div key={label} className="bg-[#161616] rounded-2xl p-5 shadow-sm border border-[#222222]">
                        <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center bg-${color}-500/10 border border-${color}-500/20`}>
                          <Icon className={`text-${color}-500`} size={20} />
                        </div>
                        <p className="text-2xl font-bold text-white">{val}</p>
                        <p className="text-sm text-gray-500">{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Search */}
                  <div className="bg-[#161616] rounded-2xl border border-[#222222] p-4 flex items-center gap-3">
                    <Search className="text-gray-500 shrink-0" size={18} />
                    <input
                      value={custSearch}
                      onChange={e => setCustSearch(e.target.value)}
                      placeholder="Search by name, email or phone..."
                      className="flex-1 bg-transparent outline-none text-sm text-gray-300 placeholder-gray-600"
                    />
                    {custSearch && <button onClick={() => setCustSearch('')} className="text-gray-500 hover:text-white"><X size={16} /></button>}
                  </div>

                  {customers.length === 0 ? (
                    <div className="bg-[#161616] rounded-2xl border border-[#222222] p-12 text-center">
                      <Users className="mx-auto text-[#333333] mb-4" size={52} />
                      <h3 className="font-bold text-white mb-1">No Registered Customers Yet</h3>
                      <p className="text-sm text-gray-500">When users sign up on the store, they'll appear here.</p>
                    </div>
                  ) : (
                    <div className="bg-[#161616] rounded-2xl border border-[#222222] shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-white/[0.02] border-b border-[#222222]">
                            <tr>
                              {['Customer', 'Contact', 'Joined', 'Tier', 'Wallet', 'Points', 'Referrals', 'Actions'].map(h => (
                                <th key={h} className="px-4 py-3 text-left text-[10px] font-mono font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#222222]">
                            {customers
                              .filter(c =>
                                !custSearch ||
                                c.name?.toLowerCase().includes(custSearch.toLowerCase()) ||
                                c.email?.toLowerCase().includes(custSearch.toLowerCase()) ||
                                c.phone?.includes(custSearch)
                              )
                              .map(c => (
                                <tr key={c.id} className="hover:bg-white/[0.02] transition">
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold text-sm flex items-center justify-center shrink-0">
                                        {c.name?.[0]?.toUpperCase() || '?'}
                                      </div>
                                      <div>
                                        <p className="font-bold text-white text-sm">{c.name}</p>
                                        <p className="text-[11px] text-gray-500 font-mono">{c.referralCode}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <p className="text-sm text-gray-300">{c.phone}</p>
                                    <p className="text-xs text-gray-500 truncate max-w-[140px]">{c.email}</p>
                                  </td>
                                  <td className="px-4 py-3 text-xs text-gray-400">
                                    {c.joinedDate ? new Date(c.joinedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${c.tier === 'platinum' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                      c.tier === 'gold' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                        'bg-white/5 text-gray-400 border-white/10'
                                      }`}>{c.tier || 'silver'}</span>
                                  </td>
                                  <td className="px-4 py-3 text-sm font-bold text-amber-500">₹{(c.walletBalance || 0).toLocaleString()}</td>
                                  <td className="px-4 py-3 text-sm text-purple-400 font-bold">{c.points || 0}</td>
                                  <td className="px-4 py-3 text-sm text-green-400 font-bold">{c.referralCount || 0}</td>
                                  <td className="px-4 py-3">
                                    <button
                                      onClick={() => setSelectedCust(c)}
                                      className="p-1.5 text-gray-500 hover:text-amber-400 hover:bg-white/5 rounded-lg transition"
                                      title="View details"
                                    >
                                      <Eye size={16} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>


        {/* PRODUCT MODAL */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#161616] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto border border-[#333333]">
              <div className="sticky top-0 bg-[#161616] border-b border-[#222222] px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                <h3 className="font-bold text-white">{editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}</h3>
                <button onClick={() => { setShowModal(false); resetForm(); }} className="p-2 hover:bg-white/5 text-gray-400 rounded-xl transition"><X size={18} /></button>
              </div>
              <div className="p-6 space-y-5">
                {/* Advanced Image Upload Zone */}
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Gallery & Media</label>

                  <div {...getRootProps()} className={`border-2 border-dashed rounded-3xl p-8 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer ${isDragActive ? 'border-[#3B82F6] bg-[#3B82F6]/5' : 'border-[#333333] hover:border-[#444444] bg-[#0D0D0D]'}`}>
                    <input {...getInputProps()} />
                    <div className="w-14 h-14 bg-[#3B82F6]/10 rounded-2xl flex items-center justify-center text-[#3B82F6]">
                      <Image size={28} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-200">Drag & drop product images</p>
                      <p className="text-xs text-gray-500 mt-1">Supports JPEG, PNG and WebP (Auto-compressed)</p>
                    </div>
                  </div>

                  {/* Upload Progress & Previews */}
                  {(uploadQueue.length > 0 || formData.images.length > 0) && (
                    <div className="grid grid-cols-4 gap-3">
                      {/* Existing Images */}
                      {formData.images.map((url, i) => (
                        <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-[#333333] group relative">
                          <img src={url} className="w-full h-full object-cover" alt="" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button onClick={() => removeImage(url)} className="p-1.5 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition"><Trash2 size={12} /></button>
                          </div>
                        </div>
                      ))}

                      {/* Uploading/New Images */}
                      {uploadQueue.map((item) => (
                        <div key={item.id} className="aspect-square rounded-2xl overflow-hidden border border-[#333333] relative bg-[#0D0D0D]">
                          {item.url ? (
                            <img src={item.url} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-2">
                              <Loader2 className="animate-spin text-[#3B82F6] mb-2" size={16} />
                              <div className="w-full bg-[#1C1C1C] h-1 rounded-full overflow-hidden">
                                <div className="bg-[#3B82F6] h-full transition-all duration-300" style={{ width: `${item.progress}%` }}></div>
                              </div>
                            </div>
                          )}
                          {item.url && (
                            <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-0.5">
                              <BadgeCheck size={10} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Product Name</label>
                  <input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Classic Gold Ring" className="w-full px-4 py-2.5 border border-[#222222] bg-[#0D0D0D] text-white rounded-xl text-sm focus:outline-none focus:border-amber-500 placeholder-gray-600" />
                </div>

                {/* Price row */}
                <div className="grid grid-cols-2 gap-4">
                  {[['price', 'Selling Price (₹)'], ['originalPrice', 'MRP / Original (₹)']].map(([n, l]) => (
                    <div key={n}>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{l}</label>
                      <input type="number" name={n} value={(formData as any)[n]} onChange={handleChange} className="w-full px-4 py-2.5 border border-[#222222] bg-[#0D0D0D] text-white rounded-xl text-sm focus:outline-none focus:border-amber-500" />
                    </div>
                  ))}
                </div>

                {/* Weight + Making */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Net Weight (g)</label>
                    <input type="number" name="netWeight" value={formData.netWeight} onChange={handleChange} placeholder="e.g. 4.5" className="w-full px-4 py-2.5 border border-[#222222] bg-[#0D0D0D] text-white rounded-xl text-sm focus:outline-none focus:border-amber-500 placeholder-gray-600" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Making Charges %</label>
                    <div className="flex items-center border border-[#222222] rounded-xl overflow-hidden focus-within:border-amber-500 transition bg-[#0D0D0D]">
                      <input type="number" name="laborCharges" value={formData.laborCharges} onChange={handleChange} placeholder="Default from category" className="flex-1 px-4 py-2.5 text-sm bg-transparent outline-none text-white placeholder-gray-600" />
                      <span className="px-3 py-2.5 bg-[#1C1C1C] text-gray-500 text-sm border-l border-[#222222]">%</span>
                    </div>
                  </div>
                </div>

                {/* Diamond Attributes Section */}
                {formData.material === 'diamond' && (
                  <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/20 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-blue-400 flex items-center gap-2">
                        <Gem size={16} /> Diamond Attributes
                      </h4>
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, diamondDetails: [...prev.diamondDetails, { type: 'Side', weight: 0, clarity: 'VS', color: 'G', count: 1 }] }))}
                        className="text-xs font-bold text-blue-500 hover:text-blue-400"
                      >
                        + Add Diamond Row
                      </button>
                    </div>
                    {formData.diamondDetails.map((d, idx) => (
                      <div key={idx} className="grid grid-cols-5 gap-2 items-end">
                        <div>
                          <label className="block text-[10px] text-gray-500 uppercase mb-1">Type</label>
                          <input value={d.type} onChange={e => {
                            const newD = [...formData.diamondDetails];
                            newD[idx].type = e.target.value;
                            setFormData({ ...formData, diamondDetails: newD });
                          }} className="w-full px-2 py-1.5 border border-[#333333] bg-[#0D0D0D] text-white rounded-lg text-xs" />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-500 uppercase mb-1">Ct</label>
                          <input type="number" value={d.weight} onChange={e => {
                            const newD = [...formData.diamondDetails];
                            newD[idx].weight = Number(e.target.value);
                            setFormData({ ...formData, diamondDetails: newD });
                          }} className="w-full px-2 py-1.5 border border-[#333333] bg-[#0D0D0D] text-white rounded-lg text-xs" />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-500 uppercase mb-1">Clarity</label>
                          <select value={d.clarity} onChange={e => {
                            const newD = [...formData.diamondDetails];
                            newD[idx].clarity = e.target.value;
                            setFormData({ ...formData, diamondDetails: newD });
                          }} className="w-full px-2 py-1.5 border border-[#333333] bg-[#0D0D0D] text-white rounded-lg text-xs">
                            {['SI', 'VS', 'VVS', 'IF'].map(c => <option key={c}>{c}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-500 uppercase mb-1">Color</label>
                          <input value={d.color} onChange={e => {
                            const newD = [...formData.diamondDetails];
                            newD[idx].color = e.target.value;
                            setFormData({ ...formData, diamondDetails: newD });
                          }} className="w-full px-2 py-1.5 border border-[#333333] bg-[#0D0D0D] text-white rounded-lg text-xs" />
                        </div>
                        <button onClick={() => {
                          const newD = formData.diamondDetails.filter((_, i) => i !== idx);
                          setFormData({ ...formData, diamondDetails: newD });
                        }} className="p-1.5 text-red-500 hover:text-red-400">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Variants Section */}
                <div className="p-4 bg-[#0D0D0D] rounded-2xl border border-[#222222] space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                      <Settings size={16} /> Variants (Size/Purity)
                    </h4>
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, variants: [...prev.variants, { id: Date.now().toString(), name: '', price: 0, inStock: true }] }))}
                      className="text-xs font-bold text-amber-500 hover:text-amber-400"
                    >
                      + Add Variant
                    </button>
                  </div>
                  {formData.variants.map((v, idx) => (
                    <div key={idx} className="grid grid-cols-4 gap-2 items-end">
                      <div className="col-span-2">
                        <label className="block text-[10px] text-gray-500 uppercase mb-1">Variant Name</label>
                        <input value={v.name} placeholder="e.g. Size 12 / 18K" onChange={e => {
                          const newV = [...formData.variants];
                          newV[idx].name = e.target.value;
                          setFormData({ ...formData, variants: newV });
                        }} className="w-full px-3 py-1.5 border border-[#333333] bg-[#161616] text-white rounded-lg text-xs placeholder-gray-600" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 uppercase mb-1">Price (₹)</label>
                        <input type="number" value={v.price} onChange={e => {
                          const newV = [...formData.variants];
                          newV[idx].price = Number(e.target.value);
                          setFormData({ ...formData, variants: newV });
                        }} className="w-full px-3 py-1.5 border border-[#333333] bg-[#161616] text-white rounded-lg text-xs" />
                      </div>
                      <button onClick={() => {
                        const newV = formData.variants.filter((_, i) => i !== idx);
                        setFormData({ ...formData, variants: newV });
                      }} className="p-1.5 text-red-500 hover:text-red-400 w-fit">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Category / Material / Purity */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Category</label>
                    <select name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2.5 border border-[#222222] bg-[#0D0D0D] text-white rounded-xl text-sm focus:outline-none focus:border-amber-500 capitalize">
                      {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Material</label>
                    <select name="material" value={formData.material} onChange={handleChange} className="w-full px-3 py-2.5 border border-[#222222] bg-[#0D0D0D] text-white rounded-xl text-sm focus:outline-none focus:border-amber-500">
                      {['gold', 'silver', 'diamond', 'platinum'].map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Purity</label>
                    <select name="purity" value={formData.purity} onChange={handleChange} className="w-full px-3 py-2.5 border border-[#222222] bg-[#0D0D0D] text-white rounded-xl text-sm focus:outline-none focus:border-amber-500">
                      {['14K', '18K', '22K', '24K', '925', 'Platinum'].map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                </div>

                {/* Occasion */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Occasion</label>
                  <select name="occasion" value={formData.occasion} onChange={handleChange} className="w-full px-4 py-2.5 border border-[#222222] bg-[#0D0D0D] text-white rounded-xl text-sm focus:outline-none focus:border-amber-500">
                    {[['daily', 'Daily Wear'], ['bridal', 'Bridal'], ['party', 'Party'], ['gift', 'Gifting']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="Describe the product..." className="w-full px-4 py-2.5 border border-[#222222] bg-[#0D0D0D] text-white rounded-xl text-sm focus:outline-none focus:border-amber-500 resize-none placeholder-gray-600" />
                </div>

                {/* Toggles */}
                <div className="flex flex-wrap gap-4 p-4 bg-[#0D0D0D] border border-[#222222] rounded-xl">
                  {[['inStock', 'In Stock', 'green'], ['featured', 'Featured', 'amber'], ['trending', 'Trending', 'blue']].map(([n, l, c]) => (
                    <label key={n} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" name={n} checked={(formData as any)[n]} onChange={handleChange} className={`w-4 h-4 rounded border-[#333333] bg-[#161616]`} />
                      <span className="text-sm font-medium text-gray-300">{l}</span>
                    </label>
                  ))}
                </div>

              </div>

              <div className="sticky bottom-0 bg-[#161616] border-t border-[#222222] px-6 py-4 flex gap-3 justify-end rounded-b-2xl">
                <button onClick={() => { setShowModal(false); resetForm(); }} className="px-5 py-2.5 border border-[#333333] text-gray-300 rounded-xl text-sm font-bold hover:bg-[#222222] transition" disabled={loading}>Cancel</button>
                <button
                  onClick={saveProduct}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition text-sm shadow-[0_0_15px_rgba(245,158,11,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <><Loader2 className="animate-spin" size={16} /> Processing...</>
                  ) : (
                    <><Save size={16} /> {editingProduct ? 'Update Product' : 'Add Product'}</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CUSTOMER DETAIL MODAL */}
        {selectedCust && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedCust(null)}>
            <div className="bg-[#161616] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-[#333333]" onClick={e => e.stopPropagation()}>
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 rounded-t-2xl text-white relative">
                <button onClick={() => setSelectedCust(null)} className="absolute top-4 right-4 p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition"><X size={16} /></button>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold">{selectedCust.name?.[0]}</div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedCust.name}</h3>
                    <p className="text-amber-100 text-sm">{selectedCust.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${selectedCust.tier === 'platinum' ? 'bg-blue-500/30 text-white' :
                        selectedCust.tier === 'gold' ? 'bg-amber-400/30 text-white' : 'bg-black/20 text-white'
                        }`}>{selectedCust.tier}</span>
                      <BadgeCheck size={14} className="text-amber-200" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {[['Wallet', `₹${selectedCust.walletBalance || 0}`, 'amber'], ['Points', (selectedCust.points || 0).toString(), 'purple'], ['Referrals', (selectedCust.referralCount || 0).toString(), 'green']].map(([l, v, c]) => (
                    <div key={l} className={`bg-${c}-500/10 border border-${c}-500/20 rounded-xl p-3 text-center`}>
                      <p className={`text-lg font-bold text-${c}-400`}>{v}</p>
                      <p className={`text-xs text-${c}-500/80 font-bold uppercase tracking-wider mt-1`}>{l}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  {[
                    { Icon: Phone, label: 'Phone', val: selectedCust.phone },
                    { Icon: Mail, label: 'Email', val: selectedCust.email },
                    { Icon: Calendar, label: 'Joined', val: selectedCust.joinedDate ? new Date(selectedCust.joinedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A' },
                    { Icon: BadgeCheck, label: 'Referral Code', val: selectedCust.referralCode },
                    { Icon: Bell, label: 'Notifications', val: `${selectedCust.notifications?.length || 0} total` },
                    {
                      Icon: MapPin, label: 'Address', val: selectedCust.streetAddress
                        ? `${selectedCust.streetAddress}${selectedCust.city ? `, ${selectedCust.city}` : ''}${selectedCust.pincode ? ` - ${selectedCust.pincode}` : ''}`
                        : selectedCust.address || 'No address provided'
                    }
                  ].map(({ Icon, label, val }) => (
                    <div key={label} className="flex items-start gap-3 p-3 bg-[#0D0D0D] border border-[#222222] rounded-xl">
                      <Icon size={16} className="text-gray-500 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">{label}</span>
                        <span className="text-sm font-bold text-gray-300 break-words line-clamp-3">{val}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Referrals Tracking Section */}
                <div className="pt-4 border-t border-[#222222] space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                      <Users size={16} className="text-green-500" /> Referred Members
                    </h4>
                    <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full font-bold">
                      {customers.filter(c => c.referredBy === selectedCust.referralCode || c.referredBy === selectedCust.id).length} REFERRED
                    </span>
                  </div>

                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                    {customers.filter(c => c.referredBy === selectedCust.referralCode || c.referredBy === selectedCust.id).length > 0 ? (
                      customers
                        .filter(c => c.referredBy === selectedCust.referralCode || c.referredBy === selectedCust.id)
                        .map(ref => (
                          <div key={ref.id} className="flex items-center justify-between p-3 bg-[#0D0D0D] border border-[#222222] rounded-xl hover:border-[#333333] transition">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-gray-400">
                                {ref.name?.[0]}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-gray-200">{ref.name}</p>
                                <p className="text-[10px] text-gray-500 font-mono">{ref.phone}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-bold text-amber-500">₹{(ref.walletBalance || 0).toLocaleString()}</p>
                              <p className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter">Balance</p>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="py-8 text-center bg-[#0D0D0D] border border-[#222222] border-dashed rounded-xl">
                        <p className="text-xs text-gray-600 font-medium italic">No members referred yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* FOLDER IMPORT PREVIEW MODAL */}
        {showFolderPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#161616] rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col border border-[#333333]">
              <div className="sticky top-0 bg-[#161616] border-b border-[#222222] px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                    <FolderSync size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Folder Import Preview</h3>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Detected {folderImportData.length} Products</p>
                  </div>
                </div>
                <button onClick={() => setShowFolderPreview(false)} className="p-2 hover:bg-white/5 text-gray-400 rounded-xl transition"><X size={18} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 gap-3">
                  {folderImportData.map((group, idx) => {
                    const isExisting = products.some(p => p.designNo === group.name || p.name === group.name);
                    return (
                      <div key={idx} className="bg-[#0D0D0D] border border-[#222222] rounded-xl p-4 flex items-center justify-between group hover:border-[#333333] transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center relative">
                            <Image size={20} className="text-gray-600" />
                            <span className="absolute -top-2 -right-2 bg-[#3B82F6] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{group.files.length}</span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-200">{group.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {isExisting ? (
                                <span className="flex items-center gap-1 text-[10px] text-amber-400 font-bold uppercase"><AlertCircle size={10} /> Update Existing</span>
                              ) : (
                                <span className="flex items-center gap-1 text-[10px] text-green-400 font-bold uppercase"><CheckCircle size={10} /> New Product</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Ready for upload</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-6 bg-[#0D0D0D] border-t border-[#222222] rounded-b-2xl flex items-center justify-between">
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  <Info size={14} />
                  Images will be auto-compressed and uploaded to Storage.
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowFolderPreview(false)} className="px-6 py-2.5 text-gray-400 font-bold hover:bg-white/5 rounded-xl transition">Cancel</button>
                  <button onClick={processFolderImport} className="px-8 py-2.5 bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition flex items-center gap-2">
                    <FolderSync size={18} /> Start Bulk Import
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPage;

