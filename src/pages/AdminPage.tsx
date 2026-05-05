import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Plus, Edit, Trash2, Search, ShoppingCart, TrendingUp, DollarSign, Eye, X, Save, Upload, Image, Percent, Gem, Settings, Users, Wallet, Crown, Bell, Phone, Mail, Calendar, BadgeCheck } from 'lucide-react';
import { products as initialProducts, categories } from '../data/products';
import { Product } from '../types';
import { formatPrice } from '../utils/whatsapp';
import { usePrice } from '../context/PriceContext';

type TabType = 'dashboard' | 'products' | 'rates' | 'making' | 'orders' | 'customers';

interface StoredUser {
  id: string; name: string; email: string; phone: string;
  walletBalance: number; tier: string; points: number;
  referralCode: string; referralCount: number;
  joinedDate: string; notifications: any[];
}

const CATEGORIES = ['rings','necklaces','earrings','bangles','pendants','mangalsutra','coins'] as const;

const AdminPage: React.FC = () => {
  const { rates, setRates, makingCharges, setMakingCharges } = usePrice();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [ratesDraft, setRatesDraft] = useState({ ...rates });
  const [makingDraft, setMakingDraft] = useState({ ...makingCharges });
  const [imgPreview, setImgPreview] = useState('');
  const [formData, setFormData] = useState({
    name: '', price: '', originalPrice: '', category: 'rings', material: 'gold',
    purity: '22K', occasion: 'daily', description: '', image: '',
    netWeight: '', laborCharges: '', inStock: true, featured: false, trending: false
  });
  const [customers, setCustomers] = useState<StoredUser[]>([]);
  const [custSearch, setCustSearch] = useState('');
  const [selectedCust, setSelectedCust] = useState<StoredUser | null>(null);

  useEffect(() => {
    const allUsers: StoredUser[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key === 'arham_user') {
        try {
          const u = JSON.parse(localStorage.getItem(key) || '');
          if (u?.id && u?.name) allUsers.push(u);
        } catch {}
      }
    }
    try {
      const all = JSON.parse(localStorage.getItem('arham_all_users') || '[]');
      all.forEach((u: StoredUser) => { if (!allUsers.find(x => x.id === u.id)) allUsers.push(u); });
    } catch {}
    setCustomers(allUsers);
  }, [activeTab]);

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
    setFormData({ name:'',price:'',originalPrice:'',category:'rings',material:'gold',purity:'22K',occasion:'daily',description:'',image:'',netWeight:'',laborCharges:'',inStock:true,featured:false,trending:false });
    setImgPreview(''); setEditingProduct(null);
  };

  const openAdd = () => { resetForm(); setShowModal(true); };
  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({ name:p.name,price:p.price.toString(),originalPrice:p.originalPrice?.toString()||'',category:p.category,material:p.material,purity:p.purity||'22K',occasion:p.occasion,description:p.description,image:p.images[0],netWeight:(p.netWeight||'').toString(),laborCharges:(p.laborCharges||'').toString(),inStock:p.inStock,featured:p.featured||false,trending:p.trending||false });
    setImgPreview(p.images[0]);
    setShowModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
    if (name === 'image') setImgPreview(value);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setFormData(prev => ({ ...prev, image: url }));
      setImgPreview(url);
    };
    reader.readAsDataURL(file);
  };

  const saveProduct = () => {
    const base: Product = {
      id: editingProduct?.id || Date.now().toString(),
      name: formData.name,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
      category: formData.category as Product['category'],
      material: formData.material as Product['material'],
      purity: formData.purity as Product['purity'],
      occasion: formData.occasion as Product['occasion'],
      description: formData.description,
      images: [formData.image || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500'],
      netWeight: formData.netWeight ? Number(formData.netWeight) : undefined,
      laborCharges: formData.laborCharges ? Number(formData.laborCharges) : undefined,
      inStock: formData.inStock, featured: formData.featured, trending: formData.trending,
      rating: editingProduct?.rating || 4.5, reviews: editingProduct?.reviews || 0
    };
    setProducts(prev => editingProduct ? prev.map(p => p.id === editingProduct.id ? base : p) : [base, ...prev]);
    setShowModal(false); resetForm();
  };

  const deleteProduct = (id: string) => { if (confirm('Delete this product?')) setProducts(p => p.filter(x => x.id !== id)); };

  const tabClass = (t: TabType) => `flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${activeTab === t ? 'bg-amber-500 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-amber-50 border border-gray-200'}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center text-white font-bold">A</div>
            <div>
              <h1 className="text-base font-bold text-gray-900">ARHAM Admin</h1>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">Control Panel</p>
            </div>
          </div>
          <Link to="/" className="px-4 py-1.5 text-amber-600 border border-amber-300 rounded-lg hover:bg-amber-50 text-sm font-medium transition">View Store ↗</Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {([['dashboard','Dashboard',TrendingUp],['products','Products',Package],['rates','Metal Rates',Gem],['making','Making Charges',Percent],['customers','Customers',Users],['orders','Orders',ShoppingCart]] as const).map(([id, label, Icon]) => (
            <button key={id} onClick={() => setActiveTab(id)} className={tabClass(id)}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label:'Total Products', val: stats.total, color:'blue', Icon: Package },
                { label:'Inventory Value', val: formatPrice(stats.value), color:'green', Icon: DollarSign },
                { label:'Featured Items', val: stats.featured, color:'amber', Icon: TrendingUp },
                { label:'In Stock', val: stats.inStock, color:'purple', Icon: ShoppingCart },
              ].map(({ label, val, color, Icon }) => (
                <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center bg-${color}-100`}>
                    <Icon className={`text-${color}-600`} size={20} />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{val}</p>
                  <p className="text-sm text-gray-500">{label}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Recent Products</h3>
              <div className="space-y-3">
                {products.slice(0,5).map(p => (
                  <div key={p.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                    <img src={p.images[0]} alt={p.name} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{p.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{p.category} · {p.material}</p>
                    </div>
                    <p className="font-bold text-amber-600">{formatPrice(p.price)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTS */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap gap-3 items-center justify-between">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search products..." className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:border-amber-400" />
              </div>
              <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition font-medium text-sm">
                <Plus size={18} /> Add Product
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>{['Product','Category','Price','Making%','Status','Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map(p => (
                      <tr key={p.id} className="hover:bg-amber-50/30 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img src={p.images[0]} alt={p.name} className="w-11 h-11 rounded-xl object-cover border" />
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{p.name}</p>
                              <div className="flex gap-1 mt-0.5">
                                {p.featured && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">Featured</span>}
                                {p.trending && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">Trending</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 capitalize">{p.category}</td>
                        <td className="px-4 py-3 font-semibold text-gray-900 text-sm">{formatPrice(p.price)}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{p.laborCharges ?? makingCharges[p.category as keyof typeof makingCharges]}%</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${p.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{p.inStock ? 'In Stock' : 'Out of Stock'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <Link to={`/product/${p.id}`} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"><Eye size={16} /></Link>
                            <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"><Edit size={16} /></button>
                            <button onClick={() => deleteProduct(p.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={16} /></button>
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
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center"><Gem className="text-amber-600" size={20} /></div>
                <div><h3 className="font-bold text-gray-900">Live Metal Rates</h3><p className="text-xs text-gray-400">Rate per gram (₹) — changes apply to all products immediately</p></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {([['gold24K','Gold 24K','#FFD700'],['gold22K','Gold 22K','#FFC125'],['gold18K','Gold 18K','#DAA520'],['gold14K','Gold 14K','#B8860B'],['silver','Silver (per g)','#C0C0C0'],['platinum','Platinum (per g)','#E5E4E2']] as const).map(([key, label, color]) => (
                  <div key={key} className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600 flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full inline-block" style={{ background: color }} />
                      {label}
                    </label>
                    <div className="flex items-center border rounded-xl overflow-hidden focus-within:border-amber-400 transition">
                      <span className="px-3 py-2.5 bg-gray-50 text-gray-500 text-sm border-r">₹</span>
                      <input type="number" value={ratesDraft[key]} onChange={e => setRatesDraft(r => ({ ...r, [key]: Number(e.target.value) }))}
                        className="flex-1 px-3 py-2.5 text-sm outline-none font-medium" />
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => { setRates(ratesDraft); alert('✅ Rates updated successfully!'); }}
                className="mt-6 w-full py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition flex items-center justify-center gap-2">
                <Save size={18} /> Save Metal Rates
              </button>
            </div>
          </div>
        )}

        {/* MAKING CHARGES */}
        {activeTab === 'making' && (
          <div className="max-w-2xl space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center"><Percent className="text-purple-600" size={20} /></div>
                <div><h3 className="font-bold text-gray-900">Category Making Charges</h3><p className="text-xs text-gray-400">Default % applied to all products in each category</p></div>
              </div>
              <p className="text-xs bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-2 mb-5">💡 Tip: Setting Ring making charges to 12% will auto-apply to all Ring products (unless overridden per product).</p>
              <div className="grid grid-cols-2 gap-4">
                {CATEGORIES.map(cat => (
                  <div key={cat} className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600 capitalize">{cat}</label>
                    <div className="flex items-center border rounded-xl overflow-hidden focus-within:border-purple-400 transition">
                      <input type="number" min="0" max="50" value={makingDraft[cat]}
                        onChange={e => setMakingDraft(m => ({ ...m, [cat]: Number(e.target.value) }))}
                        className="flex-1 px-3 py-2.5 text-sm outline-none font-medium" />
                      <span className="px-3 py-2.5 bg-gray-50 text-gray-500 text-sm border-l">%</span>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => { setMakingCharges(makingDraft); alert('✅ Making charges updated!'); }}
                className="mt-6 w-full py-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition flex items-center justify-center gap-2">
                <Save size={18} /> Save Making Charges
              </button>
            </div>
          </div>
        )}

        {/* ORDERS */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <ShoppingCart className="mx-auto text-gray-200 mb-4" size={52} />
            <h3 className="font-bold text-gray-700 mb-1">No Orders Yet</h3>
            <p className="text-sm text-gray-400">Orders received via WhatsApp will appear here.</p>
          </div>
        )}

        {/* CUSTOMERS */}
        {activeTab === 'customers' && (
          <div className="space-y-5">
            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Members', val: customers.length, icon: Users, color: 'blue' },
                { label: 'Wallet Issued', val: `₹${customers.reduce((s,c) => s+(c.walletBalance||0),0).toLocaleString()}`, icon: Wallet, color: 'amber' },
                { label: 'Total Referrals', val: customers.reduce((s,c) => s+(c.referralCount||0),0), icon: BadgeCheck, color: 'green' },
                { label: 'Notifications', val: customers.reduce((s,c) => s+(c.notifications?.length||0),0), icon: Bell, color: 'purple' },
              ].map(({ label, val, icon: Icon, color }) => (
                <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center bg-${color}-100`}>
                    <Icon className={`text-${color}-600`} size={20} />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{val}</p>
                  <p className="text-sm text-gray-500">{label}</p>
                </div>
              ))}
            </div>

            {/* Search */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
              <Search className="text-gray-400 shrink-0" size={18} />
              <input
                value={custSearch}
                onChange={e => setCustSearch(e.target.value)}
                placeholder="Search by name, email or phone..."
                className="flex-1 outline-none text-sm text-gray-700"
              />
              {custSearch && <button onClick={() => setCustSearch('')} className="text-gray-300 hover:text-gray-500"><X size={16}/></button>}
            </div>

            {customers.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <Users className="mx-auto text-gray-200 mb-4" size={52} />
                <h3 className="font-bold text-gray-700 mb-1">No Registered Customers Yet</h3>
                <p className="text-sm text-gray-400">When users sign up on the store, they'll appear here.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        {['Customer','Contact','Joined','Tier','Wallet','Points','Referrals','Actions'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {customers
                        .filter(c =>
                          !custSearch ||
                          c.name?.toLowerCase().includes(custSearch.toLowerCase()) ||
                          c.email?.toLowerCase().includes(custSearch.toLowerCase()) ||
                          c.phone?.includes(custSearch)
                        )
                        .map(c => (
                          <tr key={c.id} className="hover:bg-amber-50/30 transition">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 font-bold text-sm flex items-center justify-center shrink-0">
                                  {c.name?.[0]?.toUpperCase() || '?'}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900 text-sm">{c.name}</p>
                                  <p className="text-[11px] text-gray-400 font-mono">{c.referralCode}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-sm text-gray-700">{c.phone}</p>
                              <p className="text-xs text-gray-400 truncate max-w-[140px]">{c.email}</p>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-500">
                              {c.joinedDate ? new Date(c.joinedDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'2-digit' }) : '—'}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                                c.tier === 'platinum' ? 'bg-blue-100 text-blue-700' :
                                c.tier === 'gold' ? 'bg-amber-100 text-amber-700' :
                                'bg-gray-100 text-gray-600'
                              }`}>{c.tier || 'silver'}</span>
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-amber-600">₹{(c.walletBalance||0).toLocaleString()}</td>
                            <td className="px-4 py-3 text-sm text-purple-600 font-medium">{c.points||0}</td>
                            <td className="px-4 py-3 text-sm text-green-600 font-medium">{c.referralCount||0}</td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => setSelectedCust(c)}
                                className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
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
      </div>


      {/* PRODUCT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h3 className="font-bold text-gray-900">{editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}</h3>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="p-2 hover:bg-gray-100 rounded-xl"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-5">
              {/* Image Upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Product Image</label>
                <div className="flex gap-3 items-start">
                  <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center bg-gray-50 shrink-0">
                    {imgPreview ? <img src={imgPreview} className="w-full h-full object-cover" alt="preview" /> : <Image size={28} className="text-gray-300" />}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input name="image" value={formData.image} onChange={handleChange} placeholder="Paste image URL..." className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:border-amber-400" />
                    <label className="flex items-center gap-2 px-3 py-2 bg-gray-50 border rounded-xl text-sm text-gray-600 cursor-pointer hover:bg-gray-100 transition w-fit">
                      <Upload size={15} /> Upload from device
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                    </label>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Product Name</label>
                <input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Classic Gold Ring" className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-amber-400" />
              </div>

              {/* Price row */}
              <div className="grid grid-cols-2 gap-4">
                {[['price','Selling Price (₹)'],['originalPrice','MRP / Original (₹)']].map(([n,l]) => (
                  <div key={n}>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">{l}</label>
                    <input type="number" name={n} value={(formData as any)[n]} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-amber-400" />
                  </div>
                ))}
              </div>

              {/* Weight + Making */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Net Weight (g)</label>
                  <input type="number" name="netWeight" value={formData.netWeight} onChange={handleChange} placeholder="e.g. 4.5" className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-amber-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Making Charges % <span className="text-gray-400 normal-case font-normal">(overrides category default)</span></label>
                  <div className="flex items-center border rounded-xl overflow-hidden focus-within:border-amber-400 transition">
                    <input type="number" name="laborCharges" value={formData.laborCharges} onChange={handleChange} placeholder={`Default: ${makingCharges[formData.category as keyof typeof makingCharges]}%`} className="flex-1 px-4 py-2.5 text-sm outline-none" />
                    <span className="px-3 py-2.5 bg-gray-50 text-gray-500 text-sm border-l">%</span>
                  </div>
                </div>
              </div>

              {/* Category / Material / Purity */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Category</label>
                  <select name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-amber-400 capitalize">
                    {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Material</label>
                  <select name="material" value={formData.material} onChange={handleChange} className="w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-amber-400">
                    {['gold','silver','diamond','platinum'].map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Purity</label>
                  <select name="purity" value={formData.purity} onChange={handleChange} className="w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-amber-400">
                    {['14K','18K','22K','24K'].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              {/* Occasion */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Occasion</label>
                <select name="occasion" value={formData.occasion} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-amber-400">
                  {[['daily','Daily Wear'],['bridal','Bridal'],['party','Party'],['gift','Gifting']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="Describe the product..." className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-amber-400 resize-none" />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-xl">
                {[['inStock','In Stock','green'],['featured','Featured','amber'],['trending','Trending','blue']].map(([n,l,c]) => (
                  <label key={n} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name={n} checked={(formData as any)[n]} onChange={handleChange} className={`w-4 h-4 rounded`} />
                    <span className="text-sm font-medium text-gray-700">{l}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex gap-3 justify-end rounded-b-2xl">
              <button onClick={() => { setShowModal(false); resetForm(); }} className="px-5 py-2.5 border rounded-xl text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={saveProduct} className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition text-sm">
                <Save size={16} /> {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMER DETAIL MODAL */}
      {selectedCust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedCust(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 rounded-t-2xl text-white relative">
              <button onClick={() => setSelectedCust(null)} className="absolute top-4 right-4 p-1.5 bg-white/20 rounded-lg hover:bg-white/30"><X size={16}/></button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold">{selectedCust.name[0]}</div>
                <div>
                  <h3 className="text-xl font-bold">{selectedCust.name}</h3>
                  <p className="text-amber-100 text-sm">{selectedCust.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      selectedCust.tier === 'platinum' ? 'bg-blue-100 text-blue-800' :
                      selectedCust.tier === 'gold' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700'
                    }`}>{selectedCust.tier}</span>
                    <BadgeCheck size={14} className="text-amber-200" />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[['Wallet',`₹${selectedCust.walletBalance||0}`,'amber'],['Points',(selectedCust.points||0).toString(),'purple'],['Referrals',(selectedCust.referralCount||0).toString(),'green']].map(([l,v,c])=>(
                  <div key={l} className={`bg-${c}-50 border border-${c}-100 rounded-xl p-3 text-center`}>
                    <p className={`text-lg font-bold text-${c}-700`}>{v}</p>
                    <p className={`text-xs text-${c}-500 font-medium`}>{l}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {[
                  {Icon:Phone, label:'Phone', val:selectedCust.phone},
                  {Icon:Mail, label:'Email', val:selectedCust.email},
                  {Icon:Calendar, label:'Joined', val:selectedCust.joinedDate ? new Date(selectedCust.joinedDate).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : 'N/A'},
                  {Icon:BadgeCheck, label:'Referral Code', val:selectedCust.referralCode},
                  {Icon:Bell, label:'Notifications', val:`${selectedCust.notifications?.length||0} total`}
                ].map(({Icon,label,val})=>(
                  <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Icon size={16} className="text-gray-400 shrink-0" />
                    <span className="text-xs text-gray-400 w-24 shrink-0">{label}</span>
                    <span className="text-sm font-medium text-gray-800 truncate">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
