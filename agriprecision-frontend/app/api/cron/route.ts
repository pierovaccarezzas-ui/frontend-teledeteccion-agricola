import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Asegura que siempre se ejecute al ser llamado por el Cron

export async function GET(request: Request) {
  try {
    // La URL pública donde alojarás tu API de Python (ej. en Render, Railway, etc.)
    const backendUrl = process.env.PYTHON_API_URL || "http://127.0.0.1:8001";
    
    const res = await fetch(`${backendUrl}/procesar-alertas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    });

    const data = await res.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error ejecutando cron:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
