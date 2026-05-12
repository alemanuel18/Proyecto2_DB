export const initialState = {
  ventas: [],
  clientes: [],
  productos: [],
  loading: true,
  modal: false,
  detModal: null,
  formError: '',
  idCliente: '',
  detalle: [{ id_Producto: '', cantidad: 1 }],
};

export const VENTAS_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  OPEN_MODAL: 'OPEN_MODAL',
  CLOSE_MODAL: 'CLOSE_MODAL',
  OPEN_DET_MODAL: 'OPEN_DET_MODAL',
  CLOSE_DET_MODAL: 'CLOSE_DET_MODAL',
  SET_ERROR: 'SET_ERROR',
  SET_CLIENTE: 'SET_CLIENTE',
  ADD_LINEA: 'ADD_LINEA',
  REMOVE_LINEA: 'REMOVE_LINEA',
  SET_LINEA_PROD: 'SET_LINEA_PROD',
  SET_LINEA_CANT: 'SET_LINEA_CANT',
  RESET_FORM: 'RESET_FORM',
};

export function ventasReducer(state, action) {
  switch (action.type) {
    case VENTAS_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case VENTAS_ACTIONS.FETCH_SUCCESS:
      return { 
        ...state, 
        ventas: action.payload.ventas, 
        clientes: action.payload.clientes, 
        productos: action.payload.productos, 
        loading: false 
      };
    case VENTAS_ACTIONS.OPEN_MODAL:
      return { ...state, modal: true, formError: '' };
    case VENTAS_ACTIONS.CLOSE_MODAL:
      return { ...state, modal: false };
    case VENTAS_ACTIONS.OPEN_DET_MODAL:
      return { ...state, detModal: action.payload };
    case VENTAS_ACTIONS.CLOSE_DET_MODAL:
      return { ...state, detModal: null };
    case VENTAS_ACTIONS.SET_ERROR:
      return { ...state, formError: action.payload };
    case VENTAS_ACTIONS.SET_CLIENTE:
      return { ...state, idCliente: action.payload };
    case VENTAS_ACTIONS.ADD_LINEA:
      return { ...state, detalle: [...state.detalle, { id_Producto: '', cantidad: 1 }] };
    case VENTAS_ACTIONS.REMOVE_LINEA:
      return { ...state, detalle: state.detalle.filter((_, i) => i !== action.payload) };
    case VENTAS_ACTIONS.SET_LINEA_PROD:
      return { 
        ...state, 
        detalle: state.detalle.map((d, i) => i === action.payload.index ? { ...d, id_Producto: action.payload.val } : d) 
      };
    case VENTAS_ACTIONS.SET_LINEA_CANT:
      return { 
        ...state, 
        detalle: state.detalle.map((d, i) => i === action.payload.index ? { ...d, cantidad: action.payload.val } : d) 
      };
    case VENTAS_ACTIONS.RESET_FORM:
      return { ...state, idCliente: '', detalle: [{ id_Producto: '', cantidad: 1 }], modal: false };
    default:
      return state;
  }
}
