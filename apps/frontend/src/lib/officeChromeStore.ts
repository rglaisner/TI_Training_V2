import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OfficeChromeState {
  compactUi: boolean;
  setCompactUi: (next: boolean) => void;
  toggleCompactUi: () => void;
}

export const useOfficeChromeStore = create<OfficeChromeState>()(
  persist(
    (set, get) => ({
      compactUi: false,
      setCompactUi: (next) => set({ compactUi: next }),
      toggleCompactUi: () => set({ compactUi: !get().compactUi }),
    }),
    { name: 'ti-office-chrome' },
  ),
);
