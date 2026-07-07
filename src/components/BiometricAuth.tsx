import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Fingerprint, Lock, Shield, CheckCircle2, ShieldAlert, Key } from 'lucide-react';

interface BiometricAuthProps {
  onSuccess: () => void;
  isEnabled: boolean;
}

export default function BiometricAuth({ onSuccess, isEnabled }: BiometricAuthProps) {
  const [isUnlocked, setIsUnlocked] = useState(!isEnabled);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [pinInput, setPinInput] = useState('');
  const [showPinFallback, setShowPinFallback] = useState(false);
  const [pinError, setPinError] = useState(false);

  useEffect(() => {
    if (!isEnabled) {
      setIsUnlocked(true);
      onSuccess();
    }
  }, [isEnabled, onSuccess]);

  const handleSimulateScan = () => {
    setIsScanning(true);
    setScanStatus('idle');
    setPinError(false);
    
    // Simulate biometric matching delay
    setTimeout(() => {
      const isMatch = true; // High success rate simulation
      if (isMatch) {
        setScanStatus('success');
        setIsScanning(false);
        setTimeout(() => {
          setIsUnlocked(true);
          onSuccess();
        }, 1000);
      } else {
        setScanStatus('error');
        setIsScanning(false);
      }
    }, 1500);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default PIN code is '1234' for user simulation
    if (pinInput === '1234') {
      setPinError(false);
      setScanStatus('success');
      setTimeout(() => {
        setIsUnlocked(true);
        onSuccess();
      }, 800);
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  if (isUnlocked) return null;

  return (
    <AnimatePresence>
      <div 
        id="biometric-lock-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/95 backdrop-blur-md p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl bg-gray-900 border border-gray-800 p-8 text-center shadow-2xl"
        >
          {/* Accent decoration */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400" />
          
          <div className="mx-auto mt-4 mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
            <Shield className="h-7 w-7" />
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight text-white font-display">
            easy<span className="text-emerald-500 underline decoration-2 underline-offset-4 font-bold">seguro</span>
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Acesso protegido por autenticação biométrica em todos os acessos
          </p>

          <div className="my-10 flex flex-col items-center justify-center min-h-[180px]">
            {!showPinFallback ? (
              <div className="flex flex-col items-center">
                <div className="relative">
                  {/* Pulsing ring during scanning */}
                  {isScanning && (
                    <motion.div
                      animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                      className="absolute inset-0 rounded-full border border-emerald-500"
                    />
                  )}
                  
                  <button
                    onClick={handleSimulateScan}
                    disabled={isScanning || scanStatus === 'success'}
                    id="fingerprint-scan-button"
                    className={`relative z-10 flex h-24 w-24 items-center justify-center rounded-full transition-all duration-300 cursor-pointer ${
                      scanStatus === 'success' 
                        ? 'bg-emerald-500 text-slate-950' 
                        : scanStatus === 'error'
                        ? 'bg-rose-500 text-white'
                        : isScanning
                        ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700'
                    }`}
                  >
                    {scanStatus === 'success' ? (
                      <CheckCircle2 className="h-12 w-12" />
                    ) : (
                      <Fingerprint className="h-12 w-12" />
                    )}
                  </button>
                </div>

                <div className="mt-4 min-h-[24px]">
                  {isScanning && (
                    <p className="text-xs text-emerald-400 font-mono animate-pulse">Lendo biometria...</p>
                  )}
                  {scanStatus === 'success' && (
                    <p className="text-xs text-emerald-400 font-mono font-bold uppercase tracking-wider">Acesso Autorizado!</p>
                  )}
                  {scanStatus === 'idle' && !isScanning && (
                    <p className="text-xs text-gray-500 font-mono">Toque no ícone para simular biometria</p>
                  )}
                </div>
              </div>
            ) : (
              <motion.form 
                onSubmit={handlePinSubmit}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[280px]"
              >
                <div className="flex justify-center space-x-2 mb-4">
                  {[0, 1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className={`h-4.5 w-4.5 rounded-full border border-gray-700 transition-all ${
                        pinInput.length > index ? 'bg-emerald-400 border-emerald-400 scale-110' : 'bg-gray-800'
                      }`}
                    />
                  ))}
                </div>

                <input
                  type="password"
                  maxLength={4}
                  value={pinInput}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setPinInput(val);
                    if (pinError) setPinError(false);
                  }}
                  placeholder="Insira o PIN"
                  className="w-full text-center tracking-widest text-2xl font-mono bg-gray-800 text-white border border-gray-700 rounded-2xl py-3 focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
                
                {pinError && (
                  <p className="text-xs text-rose-400 mt-2 flex items-center justify-center gap-1">
                    <ShieldAlert className="h-3.5 w-3.5" /> PIN incorreto (Tente "1234")
                  </p>
                )}
                
                <button
                  type="submit"
                  id="pin-unlock-button"
                  className="w-full mt-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-sm font-bold transition cursor-pointer"
                >
                  Confirmar PIN
                </button>
              </motion.form>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                setShowPinFallback(!showPinFallback);
                setPinInput('');
                setPinError(false);
              }}
              className="text-xs text-gray-400 hover:text-white transition flex items-center justify-center gap-1.5"
            >
              <Key className="h-3.5 w-3.5" />
              {showPinFallback ? 'Usar Biometria' : 'Acessar com PIN de backup (Padrão: 1234)'}
            </button>
          </div>

          <div className="mt-8 text-[11px] text-gray-600 font-mono">
            Ambiente Seguro easy • Todos os dados criptografados localmente
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
