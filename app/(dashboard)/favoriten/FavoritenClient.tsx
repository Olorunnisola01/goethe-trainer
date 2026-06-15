'use client';

import { useAuth } from '@/context/AuthContext';
import { useFavourites } from '@/hooks/useFavourites';
import { FavouritesPage } from '@/components/favourites/FavouritesPage';
import { Topbar } from '@/components/layout/Topbar';

export function FavoritenClient() {
  const { user } = useAuth();
  const { favs, remove, clear } = useFavourites(user?.uid ?? null);

  if (!user) {
    return (
      <>
        <Topbar title="Meine Favoriten" />
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
          Bitte melde dich an, um deine Favoriten zu sehen.
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar title="Meine Favoriten" />
      <FavouritesPage favs={favs} onRemove={remove} onClear={clear} />
    </>
  );
}
