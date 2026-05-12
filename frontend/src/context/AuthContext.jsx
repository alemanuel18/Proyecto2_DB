import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state
const getInitialState = () => {
  try {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('usuario');
    if (storedToken && storedUser) {
      return {
        usuario: JSON.parse(storedUser),
        token: storedToken,
        isAuthenticated: true,
      };
    }
  } catch (e) {
    console.error('Error loading auth state', e);
  }
  return {
    usuario: null,
    token: null,
    isAuthenticated: false,
  };
};

const initialState = getInitialState();

// Actions
export const AUTH_ACTIONS = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
};

// Reducer
export function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN:
      return {
        ...state,
        usuario: action.payload.usuario,
        token: action.payload.token,
        isAuthenticated: true,
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        usuario: null,
        token: null,
        isAuthenticated: false,
      };
    default:
      return state;
  }
}

// Context
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));
    dispatch({ type: AUTH_ACTIONS.LOGIN, payload: data });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  return (
    <AuthContext.Provider value={{ state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
