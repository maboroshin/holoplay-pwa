import {
  ActionIcon,
  ActionIconProps,
  Menu,
  useMantineTheme,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconHeart, IconHeartFilled } from "@tabler/icons-react";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import { db } from "../database";
import { getFavoritePlaylist } from "../database/utils";
import { useFavorite, useSetFavorite } from "../providers/Favorite";
import { usePlayerVideo } from "../providers/Player";
import {
  Card,
  CardChannel,
  CardPlaylist,
  CardVideo,
} from "../types/interfaces/Card";
import { Channel } from "../types/interfaces/Channel";
import { Playlist } from "../types/interfaces/Playlist";
import { Video } from "../types/interfaces/Video";
import {
  formatedCardChannel,
  formatedCardPlaylist,
  formatedCardVideo,
} from "../utils/formatData";

type ButtonFavoriteCard = Card | Video | Playlist | Channel;
type FavoriteChannel = CardChannel | Channel;
type FavoritePlaylist = CardPlaylist | Playlist;
type FavoriteVideo = CardVideo | Video;

interface ButtonFavoriteProps extends ActionIconProps {
  card?: ButtonFavoriteCard;
  iconSize?: number;
  buttonSize?: number;
  render?: "menu";
}

export const getCardId = (item: ButtonFavoriteCard) => {
  if ((item as FavoritePlaylist)?.playlistId) {
    return (item as FavoritePlaylist).playlistId;
  }
  if (
    (item as FavoriteChannel)?.authorId &&
    (item as FavoriteChannel).type === "channel"
  ) {
    return (item as FavoriteChannel).authorId;
  }
  return (item as FavoriteVideo)?.videoId;
};

export const getCardTitle = (item: ButtonFavoriteCard) => {
  switch (item.type) {
    case "channel":
      return item.author;
    default:
      return item.title;
  }
};

export const ButtonFavorite: React.FC<ButtonFavoriteProps> = memo(
  ({
    card: parentCard,
    iconSize = 18,
    variant = "default",
    buttonSize = 36,
    render = null,
  }) => {
    const favorite = useFavorite();
    const setFavorite = useSetFavorite();
    const { video: currentVideo } = usePlayerVideo();
    const { t } = useTranslation();
    const theme = useMantineTheme();

    const card = parentCard ?? (currentVideo as Video);

    if (!card) {
      return null;
    }

    const isFavorite = favorite.videos.find(
      (favVideo) => getCardId(favVideo) === getCardId(card),
    );

    const updateAndCommit = async (updatedFavoritePlaylist: Playlist) => {
      await db.update(
        "playlists",
        { title: "Favorites" },
        () => updatedFavoritePlaylist,
      );
      db.commit();
      setFavorite(getFavoritePlaylist());
    };

    const handleAdd = () => {
      const formatedCard = (() => {
        switch (card.type) {
          case "channel":
            return formatedCardChannel(card as FavoriteChannel);
          case "playlist":
            return formatedCardPlaylist(card as FavoritePlaylist);
          default:
            return formatedCardVideo(card);
        }
      })();

      updateAndCommit({
        ...favorite,
        videos: [formatedCard, ...favorite.videos],
      });

      notifications.show({
        title: getCardTitle(card),
        message: t("favorite.add.success.message"),
      });
    };

    const handleDelete = () => {
      updateAndCommit({
        ...favorite,
        videos: favorite.videos.filter(
          (favVideo) => getCardId(favVideo) !== getCardId(card),
        ),
      });

      notifications.show({
        title: getCardTitle(card),
        message: t("favorite.remove.success.message"),
      });
    };

    const onClick = () => {
      if (isFavorite) {
        return handleDelete();
      }
      return handleAdd();
    };

    if (render === "menu") {
      return (
        <Menu.Item
          onClick={onClick}
          leftSection={
            isFavorite ? (
              <IconHeartFilled style={{ color: theme.colors.pink[8] }} />
            ) : (
              <IconHeart />
            )
          }
        >
          Favorite
        </Menu.Item>
      );
    }

    return (
      <ActionIcon
        variant={isFavorite ? "filled" : variant}
        color={isFavorite ? "pink" : "gray"}
        radius="md"
        size={buttonSize}
        onClick={onClick}
      >
        <IconHeart color="pink" size={iconSize} stroke={1.5} />
      </ActionIcon>
    );
  },
);
