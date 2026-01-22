'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/AppHeader';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [hue, setHue] = useState(0);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth');
    }
  }, [status, router]);

  useEffect(() => {
    setMounted(true);
    
    const savedHue = localStorage.getItem('emaily-hue');
    const savedContrast = localStorage.getItem('emaily-contrast');
    const savedSaturation = localStorage.getItem('emaily-saturation');
    
    if (savedHue) setHue(parseInt(savedHue));
    if (savedContrast) setContrast(parseInt(savedContrast));
    if (savedSaturation) setSaturation(parseInt(savedSaturation));
    
    if (savedHue) document.documentElement.style.setProperty('--hue-rotation', `${savedHue}deg`);
    if (savedContrast) document.documentElement.style.setProperty('--contrast-value', `${savedContrast}%`);
    if (savedSaturation) document.documentElement.style.setProperty('--saturation-value', `${savedSaturation}%`);
  }, []);

  if (!mounted || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  const handleHueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHue = parseInt(e.target.value);
    setHue(newHue);
    document.documentElement.style.setProperty('--hue-rotation', `${newHue}deg`);
    localStorage.setItem('emaily-hue', newHue.toString());
  };
  
  const handleContrastChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newContrast = parseInt(e.target.value);
    setContrast(newContrast);
    document.documentElement.style.setProperty('--contrast-value', `${newContrast}%`);
    localStorage.setItem('emaily-contrast', newContrast.toString());
  };
  
  const handleSaturationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSaturation = parseInt(e.target.value);
    setSaturation(newSaturation);
    document.documentElement.style.setProperty('--saturation-value', `${newSaturation}%`);
    localStorage.setItem('emaily-saturation', newSaturation.toString());
  };

  const handleReset = () => {
    setHue(0);
    setContrast(100);
    setSaturation(100);
    document.documentElement.style.setProperty('--hue-rotation', '0deg');
    document.documentElement.style.setProperty('--contrast-value', '100%');
    document.documentElement.style.setProperty('--saturation-value', '100%');
    localStorage.removeItem('emaily-hue');
    localStorage.removeItem('emaily-contrast');
    localStorage.removeItem('emaily-saturation');
  };

  return (
    <div className="min-h-screen bg-white">
      <AppHeader 
        title="Settings" 
        subtitle="Customize your visual preferences"
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-black mb-6">Visual Customization</h2>
          
          {/* Hue Control */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-semibold text-black">Color Hue</p>
                <p className="text-sm text-gray-500">Adjust the color tone of the interface</p>
              </div>
              <span className="text-sm font-medium text-gray-700 min-w-[50px] text-right">{hue}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={hue}
              onChange={handleHueChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
            />
            <div className="mt-3 p-4 rounded-lg border border-gray-200 bg-gray-50">
              <div 
                className="w-full h-8 rounded-md bg-gradient-to-r from-black via-gray-600 to-black"
                style={{ filter: `hue-rotate(${hue}deg)` }}
              ></div>
            </div>
          </div>

          {/* Contrast Control */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-semibold text-black">Contrast</p>
                <p className="text-sm text-gray-500">Adjust the contrast of elements</p>
              </div>
              <span className="text-sm font-medium text-gray-700 min-w-[50px] text-right">{contrast}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="150"
              value={contrast}
              onChange={handleContrastChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
            />
            <div className="mt-3 p-4 rounded-lg border border-gray-200 bg-gray-50">
              <div className="flex gap-2">
                <div 
                  className="flex-1 h-8 rounded-md bg-black"
                  style={{ filter: `contrast(${contrast}%)` }}
                ></div>
                <div 
                  className="flex-1 h-8 rounded-md bg-gray-600"
                  style={{ filter: `contrast(${contrast}%)` }}
                ></div>
                <div 
                  className="flex-1 h-8 rounded-md bg-gray-400"
                  style={{ filter: `contrast(${contrast}%)` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Saturation Control */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-semibold text-black">Saturation</p>
                <p className="text-sm text-gray-500">Adjust the color intensity</p>
              </div>
              <span className="text-sm font-medium text-gray-700 min-w-[50px] text-right">{saturation}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              value={saturation}
              onChange={handleSaturationChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
            />
            <div className="mt-3 p-4 rounded-lg border border-gray-200 bg-gray-50">
              <div 
                className="w-full h-8 rounded-md bg-gradient-to-r from-gray-800 via-gray-500 to-gray-300"
                style={{ filter: `saturate(${saturation}%)` }}
              ></div>
            </div>
          </div>

          {/* Reset Button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleReset}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Reset to Defaults
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Note:</strong> These visual settings are saved locally in your browser and will persist across sessions.
          </p>
        </div>
      </main>
    </div>
  );
}
