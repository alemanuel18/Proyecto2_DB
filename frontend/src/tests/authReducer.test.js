import { describe, it, expect } from 'vitest';
import { authReducer, AUTH_ACTIONS } from '../context/AuthContext';

describe('authReducer', () => {
  it('debería actualizar el estado al hacer LOGIN', () => {
    const initialState = { usuario: null, token: null, isAuthenticated: false };
    const payload = { usuario: { id: 1, nombre: 'Admin' }, token: 'abc123token' };
    
    const newState = authReducer(initialState, { type: AUTH_ACTIONS.LOGIN, payload });
    
    expect(newState.isAuthenticated).toBe(true);
    expect(newState.usuario.nombre).toBe('Admin');
    expect(newState.token).toBe('abc123token');
  });

  it('debería limpiar el estado al hacer LOGOUT', () => {
    const initialState = { usuario: { id: 1 }, token: 'abc', isAuthenticated: true };
    
    const newState = authReducer(initialState, { type: AUTH_ACTIONS.LOGOUT });
    
    expect(newState.isAuthenticated).toBe(false);
    expect(newState.usuario).toBeNull();
    expect(newState.token).toBeNull();
  });
});
