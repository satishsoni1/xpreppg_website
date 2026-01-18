import { useState, useEffect } from "react";
import { AdminAPI } from "@/services/adminApi";
import { MapPin, Plus, Power, Building2, Loader2 } from "lucide-react";

export default function AdminCenters() {
  const [activeTab, setActiveTab] = useState("cities"); // 'cities' or 'centers'
  const [loading, setLoading] = useState(false);
  
  // Data State
  const [cities, setCities] = useState<any[]>([]);
  const [centers, setCenters] = useState<any[]>([]);
  
  // Forms
  const [cityForm, setCityForm] = useState("");
  const [centerForm, setCenterForm] = useState({ city: "", center_name: "", address: "", capacity: 100 });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "cities") {
        const res = await AdminAPI.getCities();
        if (res.status) setCities(res.cities);
      } else {
        const res = await AdminAPI.getCenters();
        if (res.status) setCenters(res.centers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleAddCity = async () => {
    if (!cityForm.trim()) return;
    const res = await AdminAPI.addCity(cityForm);
    if (res.status) {
      setCityForm("");
      fetchData();
      alert("City Added!");
    } else {
      alert(res.message);
    }
  };

  const handleToggleCity = async (id: number, currentStatus: boolean) => {
    const res = await AdminAPI.toggleCity(id, !currentStatus);
    if (res.status) {
      // Optimistic UI Update
      setCities(cities.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c));
    }
  };

  const handleAddCenter = async () => {
    const res = await AdminAPI.addCenter(centerForm);
    if (res.status) {
      setCenterForm({ city: "", center_name: "", address: "", capacity: 100 });
      fetchData();
      alert("Center Added!");
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Location Management</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-200">
        <button 
           onClick={() => setActiveTab("cities")}
           className={`pb-2 px-4 font-semibold flex items-center gap-2 transition-colors ${
             activeTab === "cities" ? "text-primary border-b-2 border-emerald-600" : "text-gray-500 hover:text-gray-800"
           }`}
        >
           <Building2 size={18} /> Manage Cities
        </button>
        <button 
           onClick={() => setActiveTab("centers")}
           className={`pb-2 px-4 font-semibold flex items-center gap-2 transition-colors ${
             activeTab === "centers" ? "text-primary border-b-2 border-emerald-600" : "text-gray-500 hover:text-gray-800"
           }`}
        >
           <MapPin size={18} /> Manage Centers
        </button>
      </div>

      {loading && <div className="text-center py-10"><Loader2 className="animate-spin inline text-primary" /> Loading...</div>}

      {/* --- CITIES TAB --- */}
      {!loading && activeTab === "cities" && (
        <div className="space-y-6">
           {/* Add City Form */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex gap-4 items-center">
              <input 
                value={cityForm}
                onChange={(e) => setCityForm(e.target.value)}
                placeholder="Enter City Name (e.g. Mumbai)" 
                className="flex-1 border p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
              />
              <button 
                onClick={handleAddCity}
                className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-emerald-700 transition flex items-center gap-2"
              >
                <Plus size={18} /> Add City
              </button>
           </div>

           {/* Cities List */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {cities.map((city) => (
                <div key={city.id} className={`p-4 rounded-xl border flex justify-between items-center shadow-sm transition ${city.is_active ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-75'}`}>
                   <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${city.is_active ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-400'}`}>
                         <Building2 size={20} />
                      </div>
                      <div>
                        <h3 className={`font-bold ${city.is_active ? 'text-gray-800' : 'text-gray-500'}`}>{city.name}</h3>
                        <p className="text-xs text-gray-400">{city.is_active ? 'Active' : 'Disabled'}</p>
                      </div>
                   </div>
                   
                   <button 
                     onClick={() => handleToggleCity(city.id, city.is_active)}
                     title={city.is_active ? "Disable City" : "Enable City"}
                     className={`p-2 rounded-lg transition ${city.is_active ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-200'}`}
                   >
                     <Power size={20} />
                   </button>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* --- CENTERS TAB --- */}
      {!loading && activeTab === "centers" && (
        <div className="space-y-6">
           {/* Add Center Form */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                 placeholder="City Name" 
                 className="border p-3 rounded-lg" 
                 value={centerForm.city}
                 onChange={e => setCenterForm({...centerForm, city: e.target.value})} 
              />
              <input 
                 placeholder="Center Name (e.g. Ion Digital Zone)" 
                 className="border p-3 rounded-lg" 
                 value={centerForm.center_name}
                 onChange={e => setCenterForm({...centerForm, center_name: e.target.value})} 
              />
              <input 
                 placeholder="Full Address" 
                 className="border p-3 rounded-lg md:col-span-2" 
                 value={centerForm.address}
                 onChange={e => setCenterForm({...centerForm, address: e.target.value})} 
              />
              <button 
                 onClick={handleAddCenter} 
                 className="bg-emerald-600 text-white py-3 rounded-lg font-bold md:col-span-2 hover:bg-emerald-700 transition"
              >
                 Add Examination Center
              </button>
           </div>

           {/* Centers List */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {centers.map(c => (
               <div key={c.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4 hover:shadow-md transition">
                  <div className="bg-orange-100 p-3 rounded-full text-orange-600 mt-1">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{c.center_name}</h3>
                    <p className="text-sm font-semibold text-primary mb-1">{c.city}</p>
                    <p className="text-sm text-gray-500 leading-relaxed">{c.address}</p>
                    <p className="text-xs text-gray-400 mt-2 font-medium">Capacity: {c.capacity} candidates</p>
                  </div>
               </div>
             ))}
           </div>
        </div>
      )}

    </div>
  );
}