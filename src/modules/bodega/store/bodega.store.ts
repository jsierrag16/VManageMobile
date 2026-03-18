import { create } from "zustand";
import type { BodegaOption, BodegaContextOption } from "../types/bodega.types";

type BodegaState = {
  bodegas: BodegaOption[];
  selectedBodegaId: number | null;
  selectedBodegaLabel: string;
  initializeBodegaContext: (bodegas: BodegaOption[]) => void;
  setSelectedBodega: (option: BodegaContextOption) => void;
  clearBodegaContext: () => void;
};

export const useBodegaStore = create<BodegaState>((set) => ({
  bodegas: [],
  selectedBodegaId: null,
  selectedBodegaLabel: "Todas las bodegas",

  initializeBodegaContext: (bodegas) => {
    if (!bodegas?.length) {
      set({
        bodegas: [],
        selectedBodegaId: null,
        selectedBodegaLabel: "Todas las bodegas",
      });
      return;
    }

    if (bodegas.length === 1) {
      set({
        bodegas,
        selectedBodegaId: bodegas[0].id_bodega,
        selectedBodegaLabel: bodegas[0].nombre_bodega,
      });
      return;
    }

    set({
      bodegas,
      selectedBodegaId: null,
      selectedBodegaLabel: "Todas las bodegas",
    });
  },

  setSelectedBodega: (option) =>
    set({
      selectedBodegaId: option.id,
      selectedBodegaLabel: option.label,
    }),

  clearBodegaContext: () =>
    set({
      bodegas: [],
      selectedBodegaId: null,
      selectedBodegaLabel: "Todas las bodegas",
    }),
}));