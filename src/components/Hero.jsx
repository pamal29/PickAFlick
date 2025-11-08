import React from 'react';
import { Play ,Star, Plus} from 'lucide-react';

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-black">
      <div className="h-[700px] w-[100%] mx-4 relative opacity-60">
        <img
          src="../../public/hero.jpg"
          alt="Hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      
      <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6 translate-y-32">
        <p className="text-white font-bold text-[45px]">
          Spiderman Miles Morales
        </p>
        <div className='flex font-bold text-white'>
          <Star className="text-green-500 mr-4" fill="currentColor"/>
          <p className='mr-4'>2022</p>
          <p className='me-4'>2h 18min</p>
          <span className="px-3 py-1 bg-green-500 text-black text-sm font-bold rounded">HD</span>  
        </div>

        <p className="text-white text-lg">
          Story about Miles Morales
        </p>
        
        <div className="flex space-x-4">
              <button className="flex items-center space-x-2 bg-green-500 text-black px-8 py-3 rounded-full font-bold hover:bg-green-600 transition-colors">
                <Play size={20} fill="currentColor" />
                <span>Play Now</span>
              </button>
              <button className="flex items-center space-x-2 bg-gray-800 text-white px-8 py-3 rounded-full font-bold hover:bg-gray-700 transition-colors">
                <Plus size={20} />
                <span>My List</span>
              </button>
        </div>

      </div>
    </section>
  );
}
