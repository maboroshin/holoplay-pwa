import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

import { getPlaylists } from "../database/utils";
import { Playlist } from "../types/interfaces/Playlist";

const PlaylistContext = createContext<Playlist[]>([]);
const SetPlaylistContext = createContext<
  React.Dispatch<React.SetStateAction<Playlist[]>>
>(() => {});

export const PlaylistProvider: FC<PropsWithChildren> = ({ children }) => {
  const [playlists, setPlaylists] = useState(getPlaylists());

  console.log(playlists);

  const value = useMemo(
    () => ({
      playlists,
      setPlaylists,
    }),
    [playlists],
  );

  return (
    <PlaylistContext.Provider value={value.playlists}>
      <SetPlaylistContext.Provider value={value.setPlaylists}>
        {children}
      </SetPlaylistContext.Provider>
    </PlaylistContext.Provider>
  );
};

export const usePlaylists = () => useContext(PlaylistContext);
export const useSetPlaylists = () => useContext(SetPlaylistContext);
