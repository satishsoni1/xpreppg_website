import { Combobox } from "@headlessui/react";
import { useState } from "react";

export default function CitySelect({ cities, formData, setFormData }) {
  const [query, setQuery] = useState("");

  const filteredCities =
    query === ""
      ? cities
      : cities.filter((city) =>
          city.name.toLowerCase().includes(query.toLowerCase())
        );

  return (
    <Combobox
      value={formData.city}
      onChange={(value) => setFormData({ ...formData, city: value })}
    >
      <div className="relative mt-1">
        <Combobox.Input
          placeholder="Select City"
          className="w-full border border-gray-300 rounded-lg p-3"
          displayValue={(value: string) => value}
          onChange={(event) => setQuery(event.target.value)}
        />

        <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white border shadow-lg">
          {filteredCities.length === 0 ? (
            <div className="p-3 text-gray-500 text-sm">No city found</div>
          ) : (
            filteredCities.map((city) => (
              <Combobox.Option
                key={city._id}
                value={city.name}
                className={({ active }) =>
                  `cursor-pointer select-none p-3 ${
                    active ? "bg-emerald-100" : "bg-white"
                  }`
                }
              >
                {city.name}
              </Combobox.Option>
            ))
          )}
        </Combobox.Options>
      </div>
    </Combobox>
  );
}
