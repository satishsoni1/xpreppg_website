import { useState } from "react";
import { X } from "lucide-react";

export default function CityBottomSheet({
  cities,
  value,
  onSelect,
  open,
  setOpen
}: any) {
  const [query, setQuery] = useState("");

  // ✅ Prevent map() error — ensure cities is ALWAYS an array
  const safeCities = Array.isArray(cities) ? cities : [];

  // ✅ Safe filtering (avoids crash if name is missing)
  const filteredCities =
    query.trim() === ""
      ? safeCities
      : safeCities.filter((c: any) =>
          (c?.name || "")
            .toLowerCase()
            .includes(query.toLowerCase())
        );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Background overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => setOpen(false)}
      />

      {/* Bottom sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-5 max-h-[80vh] overflow-hidden shadow-xl animate-slideUp">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Select City</h2>
          <button onClick={() => setOpen(false)}>
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Search Box */}
        <input
          type="text"
          placeholder="Search city..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full border border-gray-300 rounded-xl p-3 mb-4"
        />

        {/* City List */}
        <div className="overflow-y-auto max-h-[60vh] space-y-1">
          {filteredCities.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No city found</p>
          ) : (
            filteredCities.map((city: any) => (
              <div
                key={city._id || city.name}
                onClick={() => {
                  onSelect(city.name);
                  setOpen(false);
                }}
                className="p-3 text-lg border-b active:bg-gray-100 cursor-pointer"
              >
                {city.name}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
