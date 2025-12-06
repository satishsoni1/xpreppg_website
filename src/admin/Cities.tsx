import { useEffect, useState } from "react";
import axios from "axios";

export default function CitiesAdmin() {
  const [cities, setCities] = useState([]);
  const [search, setSearch] = useState("");

  const loadCities = async () => {
    const res = await axios.get("https://api.xpreppg.com/api/cities");
    setCities(res.data.cities);
  };

  const toggleCity = async (id:any, allowed:any) => {
    await axios.patch(`https://api.xpreppg.com/api/cities/${id}`, {
      allowed: !allowed,
    });
    loadCities();
  };

  useEffect(() => {
    loadCities();
  }, []);

  const filteredCities = cities.filter((c:any) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Manage Cities</h2>
      </div>

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search for a city..."
          className="w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Card */}
      <div className="bg-white shadow-md rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-left text-gray-600 font-medium">
                City Name
              </th>
              <th className="p-4 text-center text-gray-600 font-medium">
                Status
              </th>
              <th className="p-4 text-center text-gray-600 font-medium">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredCities.map((city:any) => (
              <tr
                key={city._id}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="p-4 font-medium text-gray-800">{city.name}</td>

                {/* Status Badge */}
                <td className="p-4 text-center">
                  <span
                    className={`px-3 py-1 text-sm rounded-full font-semibold ${
                      city.allowed
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {city.allowed ? "Enabled" : "Disabled"}
                  </span>
                </td>

                {/* iOS Style Toggle Switch */}
                <td className="p-4 text-center">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={city.allowed}
                      onChange={() => toggleCity(city._id, city.allowed)}
                    />
                    <div
                      className={`w-12 h-6 rounded-full transition ${
                        city.allowed ? "bg-green-500" : "bg-gray-400"
                      } relative`}
                    >
                      <div
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transform transition ${
                          city.allowed ? "translate-x-6" : ""
                        }`}
                      ></div>
                    </div>
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredCities.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No cities found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
