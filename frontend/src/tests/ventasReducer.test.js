import { describe, it, expect } from 'vitest';
import { ventasReducer, VENTAS_ACTIONS, initialState } from '../reducers/ventasReducer';

describe('ventasReducer', () => {
  it('debería agregar una nueva línea al detalle de la venta', () => {
    const startState = {
      ...initialState,
      detalle: [{ id_Producto: '1', cantidad: 2 }]
    };
    
    const newState = ventasReducer(startState, { type: VENTAS_ACTIONS.ADD_LINEA });
    
    expect(newState.detalle).toHaveLength(2);
    expect(newState.detalle[1]).toEqual({ id_Producto: '', cantidad: 1 });
  });

  it('debería actualizar la cantidad de una línea específica', () => {
    const startState = {
      ...initialState,
      detalle: [{ id_Producto: '1', cantidad: 2 }]
    };

    const newState = ventasReducer(startState, { 
      type: VENTAS_ACTIONS.SET_LINEA_CANT, 
      payload: { index: 0, val: 5 } 
    });

    expect(newState.detalle[0].cantidad).toBe(5);
  });
});
