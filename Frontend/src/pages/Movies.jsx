import React from "react";
import Moviecard from "../components/Moviecard.jsx";

export default function Movies() {
  const movies = [
    {
      title: "Inception",
      image: "https://image.tmdb.org/t/p/w500/qmDpIHrmpJINaRKAfWQfftjCdyi.jpg",
      rating: 8.8,
      year: 2010,
      genre: "Sci-Fi",
    },
    {
      title: "The Dark Knight",
      image: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
      rating: 9.0,
      year: 2008,
      genre: "Action",
    },
    {
      title: "Interstellar",
      image: "https://image.tmdb.org/t/p/w500/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg",
      rating: 8.6,
      year: 2014,
      genre: "Adventure",
    },
  ];

  return (
    <section className="min-h-screen bg-black py-12 px-8">
      <h2 className="text-white text-3xl font-bold mb-8">Top Movies</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {movies.map((movie, index) => (
          <Moviecard key={index} {...movie} />
        ))}
      </div>
    </section>
  );
}
