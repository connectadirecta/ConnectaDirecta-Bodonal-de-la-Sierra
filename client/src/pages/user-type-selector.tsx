
import { Button } from "@/components/ui/button";
import { Users, Heart, Shield } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Footer } from "@/components/footer";
import { BODONAL_DE_LA_SIERRA_MUNICIPALITY_ID } from "@shared/constants";

export default function UserTypeSelector() {
  const [, setLocation] = useLocation();
  const [hoveredType, setHoveredType] = useState<string | null>(null);

  useEffect(() => {
    // Siempre usar el municipio de Bodonal de la Sierra
    localStorage.setItem("selectedMunicipality", BODONAL_DE_LA_SIERRA_MUNICIPALITY_ID);
  }, []);

  const { data: municipality } = useQuery({
    queryKey: ["/api/municipalities", BODONAL_DE_LA_SIERRA_MUNICIPALITY_ID],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/municipalities/${BODONAL_DE_LA_SIERRA_MUNICIPALITY_ID}`);
      return response.json();
    },
  });

  const handleSelectUserType = (type: string) => {
    switch (type) {
      case "elderly":
        setLocation("/elderly-login?step=name");
        break;
      case "family":
        setLocation("/family-login");
        break;
      case "professional":
        setLocation("/professional-login");
        break;
    }
  };

  const userTypes = [
    {
      id: "elderly",
      name: "Usuarios",
      description: "Accede a tus recordatorios, chat con asistente y más",
      icon: Users,
      color: "from-blue-400 to-blue-600",
      hoverColor: "hover:from-blue-500 hover:to-blue-700",
      shadowColor: "shadow-blue-500/50",
    },
    {
      id: "family",
      name: "Apoyo",
      description: "Monitorea y apoya a tu familiar mayor",
      icon: Heart,
      color: "from-green-400 to-green-600",
      hoverColor: "hover:from-green-500 hover:to-green-700",
      shadowColor: "shadow-green-500/50",
    },
    {
      id: "professional",
      name: "Administración",
      description: "Gestiona usuarios del programa municipal",
      icon: Shield,
      color: "from-purple-400 to-purple-600",
      hoverColor: "hover:from-purple-500 hover:to-purple-700",
      shadowColor: "shadow-purple-500/50",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-5xl w-full">
          {/* Título principal */}
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-3">
              Bienvenido a {municipality?.name || "..."}
            </h1>
            <p className="text-xl text-gray-600 font-medium">
              Conectando personas, cuidando comunidades
            </p>
          </div>

          {/* Imagen central emotiva */}
          <div className="relative mb-12 animate-fade-in delay-200 max-w-xs mx-auto">
            <div className="absolute -inset-2 bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 rounded-full blur-2xl opacity-30 animate-pulse"></div>
            <div className="relative">
              <div className="bg-white/80 backdrop-blur-sm rounded-full p-3 shadow-2xl border-4 border-white">
                <img 
                  src="/Plaza_España-Bodonal.jpg" 
                  alt="Comunidad unida" 
                  className="w-full h-auto max-h-[250px] object-cover rounded-full shadow-xl"
                />
              </div>
            </div>
          </div>

          {/* Botones circulares flotantes */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 mb-8 animate-fade-in delay-400">
            {userTypes.map((type) => {
              const Icon = type.icon;
              const isHovered = hoveredType === type.id;
              
              return (
                <div
                  key={type.id}
                  className="relative group"
                  onMouseEnter={() => setHoveredType(type.id)}
                  onMouseLeave={() => setHoveredType(null)}
                >
                  {/* Botón circular */}
                  <Button
                    onClick={() => handleSelectUserType(type.id)}
                    className={`
                      w-40 h-40 md:w-48 md:h-48 rounded-full
                      bg-gradient-to-br ${type.color} ${type.hoverColor}
                      text-white shadow-2xl ${type.shadowColor}
                      transform transition-all duration-300
                      hover:scale-110 hover:shadow-3xl
                      flex flex-col items-center justify-center gap-3
                      border-4 border-white/50 hover:border-white
                      relative overflow-hidden
                    `}
                  >
                    {/* Efecto de brillo animado */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <Icon size={48} className="relative z-10 drop-shadow-lg" />
                    <span className="text-2xl font-bold relative z-10 drop-shadow-md">
                      {type.name}
                    </span>
                  </Button>

                  {/* Descripción flotante que aparece al hacer hover */}
                  <div className={`
                    absolute -bottom-16 left-1/2 transform -translate-x-1/2
                    bg-white/95 backdrop-blur-sm rounded-xl px-6 py-3 shadow-lg
                    border border-gray-200
                    transition-all duration-300
                    ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}
                    whitespace-nowrap z-20
                  `}>
                    <p className="text-sm text-gray-700 font-medium text-center">
                      {type.description}
                    </p>
                    {/* Flecha que apunta al botón */}
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white/95 rotate-45 border-l border-t border-gray-200"></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mensaje adicional */}
          <div className="text-center mt-12 animate-fade-in delay-600">
            <p className="text-gray-600 text-lg">
              Selecciona tu perfil para comenzar
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
