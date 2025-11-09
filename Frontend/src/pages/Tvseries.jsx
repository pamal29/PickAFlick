import { TvMinimalPlay } from "lucide-react";

export default function Tvseries(){
  return(
        <section className="min-h-screen bg-black">
          
          <div className="flex flex-row items-center">
            <TvMinimalPlay className="text-neongreen ml-4" size={40}/>
            <p className="text-white text-[40px] font-semibold ml-4">
            Tv Series 
            </p>
          </div>
          
        </section>

  );
}