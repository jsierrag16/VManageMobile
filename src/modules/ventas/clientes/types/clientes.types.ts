export type ClienteListItem = {
    id: number;
    codigo?: string | null;
    nombre: string;
    tipoDocumento?: string | null;
    numeroDocumento?: string | null;
    telefono?: string | null;
    celular?: string | null;
    correo?: string | null;
    direccion?: string | null;
    ciudad?: string | null;
    departamento?: string | null;
    estado?: string | null;
    observaciones?: string | null;
    contacto?: string | null;
    fechaCreacion?: string | null;
    fechaActualizacion?: string | null;
  };
  
  export type ClienteDetail = ClienteListItem;