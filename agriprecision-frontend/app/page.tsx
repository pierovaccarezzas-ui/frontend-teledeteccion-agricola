"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Inicializa Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Dashboard() {
  const [cuarteles, setCuarteles] = useState<any[]>([]);
  const [selectedCuartel, setSelectedCuartel] = useState<any>(null);
  const [mapaTipo, setMapaTipo] = useState<string>("ndvi_abs");
  const [imagenActiva, setImagenActiva] = useState<any>(null);
  const [htmlContent, setHtmlContent] = useState<string>("");

  useEffect(() => {
    async function fetchData() {
      // 1. Obtener todos los cuarteles
      const { data: cuartelesData, error: errC } = await supabase
        .from("cuarteles")
        .select("*");

      if (cuartelesData && cuartelesData.length > 0) {
        setCuarteles(cuartelesData);
        setSelectedCuartel(cuartelesData[0]);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchImagen() {
      if (!selectedCuartel) return;

      // 2. Obtener la imagen más reciente para el cuartel seleccionado
      const { data: imagenesData, error: errI } = await supabase
        .from("imagenes_procesadas")
        .select("*, resultados_indices(*)")
        .eq("cuarteles_id", selectedCuartel.id)
        .order("fecha_imagen", { ascending: false })
        .limit(1);

      if (imagenesData && imagenesData.length > 0) {
        setImagenActiva(imagenesData[0]);
      } else {
        setImagenActiva(null);
      }
    }
    fetchImagen();
  }, [selectedCuartel]);

  // Derivar mapa URL según selección
  const urlsMapas = imagenActiva?.url_mapa_calor || {};
  const currentMapUrl = urlsMapas[mapaTipo] || null;

  // Cargar el HTML crudo del mapa
  useEffect(() => {
    async function loadMapHtml() {
      if (currentMapUrl) {
        try {
          const res = await fetch(currentMapUrl);
          const text = await res.text();
          setHtmlContent(text);
        } catch (e) {
          console.error("Error loading map HTML", e);
          setHtmlContent("");
        }
      } else {
        setHtmlContent("");
      }
    }
    loadMapHtml();
  }, [currentMapUrl]);

  // Calcular totales (de los índices)
  const ndviResult = imagenActiva?.resultados_indices?.find((r: any) => r.nombre_indice === "NDVI");

  return (
    <>
      {/* SideNavBar */}
      <nav className="fixed h-full w-[260px] left-0 top-0 flex flex-col py-6 px-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-50">
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
            <img alt="Logo" className="mix-blend-multiply opacity-90" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQRx8jv5LOf3VVG_PWdmaiwHWMiJy6wAkVg74SPOc9FdIBDHd7HmTEA9c_4-EKGitJTNhRx0iulCFlqpegVXKRxdpzyL0BtgnQEVNHpzVgtyiGDrJ8nfVHfTbbQxVNWesIXuNlQK99WQG7YLGbHsxIx5TlFBFJhTCKLfl-p0W0icH1PJT2LJF2XVPqvDO9BK5xlv5ie4zmivtwSrVV1zzZX0ZOzGXab-uMN_KyHi9c6eKny08ZmDGL5sBb8Smd6N9rLiFfF5AfY9g4" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight truncate">AgriPrecision</h1>
            <p className="text-slate-500 dark:text-slate-400 font-inter text-sm font-medium truncate">Farm Manager</p>
          </div>
        </div>

        <div className="px-6 mb-6">
          <button className="w-full bg-primary text-white py-2 px-4 rounded-lg font-inter text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">add</span> Add Field
          </button>
        </div>

        <ul className="flex-1 px-3 space-y-1">
          {cuarteles.map(c => (
            <li key={c.id}>
              <button
                onClick={() => setSelectedCuartel(c)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-r-lg transition-colors border-l-4 ${selectedCuartel?.id === c.id ? 'text-primary border-primary bg-primary/10' : 'text-slate-600 border-transparent hover:bg-slate-50'}`}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: selectedCuartel?.id === c.id ? "'FILL' 1" : "'FILL' 0" }}>map</span>
                {c.nombre_cuartel || `Cuartel ${c.id}`}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* TopNavBar */}
      <header className="fixed top-0 flex justify-between items-center h-16 px-6 ml-[260px] w-[calc(100%-260px)] border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-40">
        <div className="flex items-center focus-within:ring-2 focus-within:ring-primary rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 w-72">
          <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 mr-2 text-[20px]">search</span>
          <input className="bg-transparent border-none outline-none text-slate-900 dark:text-slate-50 font-inter text-sm w-full focus:ring-0 p-0 placeholder-slate-400" placeholder="Search fields, sensors..." type="text" />
        </div>
        <div className="text-slate-900 dark:text-white font-bold absolute left-1/2 -translate-x-1/2">
          Dashboard
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-500">Último análisis: {imagenActiva?.fecha_imagen || 'N/A'}</span>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="ml-[260px] mt-16 h-[calc(100vh-64px)] relative bg-surface-container-lowest overflow-hidden">
        {/* Renderizado del Mapa Folium */}
        {htmlContent ? (
          <iframe
            srcDoc={htmlContent}
            className="absolute inset-0 w-full h-full border-none z-0"
            title="Mapa de Calor"
            sandbox="allow-scripts allow-same-origin allow-popups"
          ></iframe>
        ) : (
          <img
            alt="Satellite Map"
            className="absolute inset-0 w-full h-full object-cover z-0"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxrOyD20Kwp_V21ywjhR4VfehIe13EMkMi9-TGIZph_ROcpGvw5iFQPCI_m2oJ5IlaTRqWAdeWajgCbqL3846wcu2jEOtBQ92jXEXzL-cJHO1vA5apaRnTHQtkyoh0x8o_Ba5t3FVgzP-JXfZLdJRCBUg-eSYgG3as8ZagG0i2HKO-11T0BYesdVc8eJ7gUK1Lu0oz_emNKYLXak4vGAbsU9bDk3hjquxvGJHO28zbftrTOX--MkfDnsvQ_cNlxsuq97XHMRbigtgI"
          />
        )}

        {/* UI Overlays */}
        <div className="absolute inset-0 p-[24px] pointer-events-none z-10 flex flex-col justify-between">

          <div className="flex justify-between items-start">
            <div className="pointer-events-auto bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl p-5 shadow-lg w-[280px]">
              <div className="flex items-center justify-between mb-3">
                <span className="font-label-caps text-[12px] font-bold text-slate-600 uppercase tracking-wider">Field Health</span>
                <span className={`material-symbols-outlined text-[20px] ${imagenActiva?.estado_alerta === 'ROJO' ? 'text-red-500' : imagenActiva?.estado_alerta === 'AMARILLO' ? 'text-yellow-500' : 'text-green-500'}`}>psychiatry</span>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-[28px] font-bold text-slate-900">{ndviResult ? ndviResult.valor_actual : '--'}</span>
                <span className="text-sm text-slate-500 font-medium">NDVI</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className={`h-full rounded-full ${imagenActiva?.estado_alerta === 'ROJO' ? 'bg-red-500' : imagenActiva?.estado_alerta === 'AMARILLO' ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${(ndviResult?.valor_actual || 0) * 100}%` }}></div>
              </div>
              <p className="text-sm text-slate-500 mt-3">{imagenActiva?.estado_alerta === 'ROJO' ? 'Alerta detectada.' : 'Crecimiento óptimo.'}</p>
            </div>

            <div className="pointer-events-auto bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl p-4 shadow-lg flex items-center gap-4 min-w-[180px]">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-blue-500 shrink-0">
                <span className="material-symbols-outlined text-[24px]">water_drop</span>
              </div>
              <div>
                <span className="text-[12px] font-bold text-slate-500 uppercase block mb-0.5">Lluvia GPM</span>
                <span className="text-[24px] font-bold text-slate-900 block">{imagenActiva ? imagenActiva.lluvia_mm : '--'} mm</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-end">
            <div className="pointer-events-auto bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl p-5 shadow-lg w-[320px]">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[20px] font-medium text-slate-900">Pixel Analysis</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <span className="block text-[12px] font-bold text-slate-500 uppercase mb-1">Total Pixels</span>
                  <span className="text-[16px] text-slate-900 font-semibold">{imagenActiva?.cantidad_pixeles || '--'}</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <span className="block text-[12px] font-bold text-slate-500 uppercase mb-1">En Estrés</span>
                  <span className="text-[16px] text-red-600 font-semibold">{ndviResult?.pixeles_en_estres || '--'}</span>
                </div>
              </div>
            </div>

            {/* Selector de Mapas */}
            <div className="pointer-events-auto flex flex-col gap-2 bg-white/90 backdrop-blur-md border border-slate-200 p-2 rounded-xl shadow-lg">
              <span className="text-[12px] font-bold text-slate-500 uppercase text-center mb-1">Capa Visual</span>
              <button onClick={() => setMapaTipo("ndvi_abs")} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${mapaTipo === 'ndvi_abs' ? 'bg-primary text-white' : 'hover:bg-slate-100'}`}>NDVI Absoluto</button>
              <button onClick={() => setMapaTipo("ndvi_delta")} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${mapaTipo === 'ndvi_delta' ? 'bg-primary text-white' : 'hover:bg-slate-100'}`}>Variación NDVI</button>
              <button onClick={() => setMapaTipo("ndmi_abs")} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${mapaTipo === 'ndmi_abs' ? 'bg-blue-600 text-white' : 'hover:bg-slate-100'}`}>NDMI Absoluto</button>
              <button onClick={() => setMapaTipo("ndmi_delta")} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${mapaTipo === 'ndmi_delta' ? 'bg-blue-600 text-white' : 'hover:bg-slate-100'}`}>Variación NDMI</button>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
