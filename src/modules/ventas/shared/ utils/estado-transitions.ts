export function getAllowedNextStates(
    moduleKey: "cotizaciones" | "ordenes_venta" | "remisiones_venta" | "pagos",
    currentEstadoId: number
  ) {
    switch (moduleKey) {
      case "cotizaciones":
        if (currentEstadoId === 1) return [2, 3, 4, 5];
        return [];
  
      case "ordenes_venta":
        if (currentEstadoId === 1) return [2, 3];
        return [];
  
      case "remisiones_venta":
        if (currentEstadoId === 5) return [6, 9];
        if (currentEstadoId === 6) return [7, 9];
        if (currentEstadoId === 7) return [8, 9];
        return [];
  
      case "pagos":
        if (currentEstadoId === 1) return [2, 4];
        if (currentEstadoId === 2) return [3, 4];
        return [];
  
      default:
        return [];
    }
  }
