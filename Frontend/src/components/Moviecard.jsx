import React from "react";

export default function Moviecard({ title, image, rating, year, genre }) {
  return (
    <div className="bg-black rounded-2xl overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300 w-64">
      <img
        src={image}
        alt={title}
        className="w-full h-80 object-cover"
      />

      <div className="p-4">
        <h3 className="text-white text-lg font-semibold truncate">{title}</h3>
        <p className="text-gray-400 text-sm">{genre} • {year}</p>

        <div className="flex items-center mt-2">
          <span className="text-[#39FF14] font-semibold">{rating}</span>
          <span className="text-gray-400 text-sm ml-1">/10</span>
        </div>
      </div>
    </div>
  );
}
