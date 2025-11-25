
import { useLocation } from "wouter";
import { BODONAL_DE_LA_SIERRA_MUNICIPALITY_ID } from "@shared/constants";
import { Footer } from "@/components/footer";
import { Sparkles, Heart, Users } from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();

  const handleClick = () => {
    localStorage.setItem("selectedMunicipality", BODONAL_DE_LA_SIERRA_MUNICIPALITY_ID);
    setLocation("/select-user-type");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden cursor-pointer" onClick={handleClick}>
      {/* Left Side - Fixed Image */}
      <div className="w-full md:w-1/2 h-64 md:h-screen relative md:fixed md:left-0 md:top-0">
        <div className="absolute inset-0">
          <img 
            src="/Plaza_España-Bodonal.jpg" 
            alt="Plaza España Bodonal de la Sierra" 
            className="w-full h-full object-cover"
          />
          {/* Overlay gradient for better text readability on mobile */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60 md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-black/20"></div>
          
          {/* Image caption */}
          <div className="absolute bottom-6 left-6 right-6 z-10">
            <p className="text-white text-xl md:text-2xl font-bold drop-shadow-2xl">
              Plaza España
            </p>
            <p className="text-white/90 text-lg md:text-xl drop-shadow-xl">
              Bodonal de la Sierra
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Scrolleable Content */}
      <div className="w-full md:w-1/2 md:ml-[50%] bg-white min-h-screen">
        <div className="flex flex-col min-h-screen">
          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-center px-8 md:px-16 py-12 md:py-20">
            {/* Logo and Brand */}
            <div className="mb-12 animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <Heart className="text-purple-600 w-10 h-10 md:w-12 md:h-12 animate-pulse" />
                <Sparkles className="text-yellow-500 w-8 h-8 md:w-10 md:h-10 animate-pulse delay-200" />
                <Users className="text-indigo-600 w-10 h-10 md:w-12 md:h-12 animate-pulse delay-400" />
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-4 leading-tight">
                Connecta<br/>Directa
              </h1>
              
              <div className="w-24 h-1 bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 mb-6"></div>
              
              <p className="text-2xl md:text-3xl text-gray-700 font-medium mb-8">
                Tu plataforma de conexión y bienestar
              </p>
            </div>

            {/* Description */}
            <div className="mb-12 space-y-4 animate-fade-in delay-300">
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                Una plataforma diseñada para conectar a las personas mayores de nuestra comunidad con sus familias y servicios de apoyo.
              </p>
              
              <div className="flex items-start gap-3 py-4">
                <Heart className="text-pink-500 w-6 h-6 mt-1 flex-shrink-0" />
                <p className="text-base md:text-lg text-gray-600">
                  Mantén el contacto con tus seres queridos a través de mensajes y fotos
                </p>
              </div>
              
              <div className="flex items-start gap-3 py-4">
                <Users className="text-indigo-600 w-6 h-6 mt-1 flex-shrink-0" />
                <p className="text-base md:text-lg text-gray-600">
                  Asistencia personalizada con profesionales dedicados a tu bienestar
                </p>
              </div>
              
              <div className="flex items-start gap-3 py-4">
                <Sparkles className="text-yellow-500 w-6 h-6 mt-1 flex-shrink-0" />
                <p className="text-base md:text-lg text-gray-600">
                  Ejercicios de memoria y actividades para mantener la mente activa
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto">
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}
