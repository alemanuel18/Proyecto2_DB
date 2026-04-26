import { useState, useCallback } from 'react';

/**
 * useToast — hook para manejar una cola de notificaciones.
 *
 * Uso:
 *   const { toasts, removeToast, notify } = useToast();
 *
 *   notify('Cliente creado');               // éxito por defecto
 *   notify('Error al guardar', 'error');    // error
 *   notify('Listo', 'success', 4000);       // duración custom
 *
 *   <ToastContainer toasts={toasts} removeToast={removeToast} />
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const notify = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  return { toasts, removeToast, notify };
}