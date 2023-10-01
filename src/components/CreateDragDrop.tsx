import { useDraggable, useDroppable } from "@dnd-kit/core";
import {
  ListItem,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  CircularProgress,
  List,
  useTheme,
} from "@mui/material";
import { useState, useEffect, ReactNode } from "react";
import { formatDuration } from "../utils/tracks";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";

interface DraggableItemProps {
  id: string;
  track: TrackMeta;
  onRemove: (id: string) => void;
  onEdit: (id: string, newTitle: string) => void;
  trackError?: boolean;
}

export const DraggableItem: React.FC<DraggableItemProps> = ({
  id,
  track,
  onRemove,
  onEdit,
  trackError,
}) => {
  const [isCloseHovered, setCloseHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(track.title);

  useEffect(() => {
    setEditedTitle(track.title);
  }, [track]);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    disabled: isCloseHovered,
  });
  const theme = useTheme();

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        cursor: "grabbing",
        display: "flex",
        alignItems: "center",
      }
    : {
        cursor: "grab",
        display: "flex",
        alignItems: "center",
      };

  return (
    <ListItem
      ref={setNodeRef}
      sx={{
        backgroundColor: trackError ? theme.palette.error.light : "inherit",
        ...style,
      }}
    >
      <Box display="flex" width="100%">
        <DragIndicatorIcon
          {...listeners}
          {...attributes}
          style={{ marginRight: "0.25em", fill: theme.palette.secondary.dark }}
        />{" "}
        {track.title ? (
          <>
            {isEditing ? (
              <>
                <TextField
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  size="small"
                  sx={{ minWidth: "75%" }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => {
                            editedTitle && onEdit(id, editedTitle);
                            setIsEditing(false);
                          }}
                        >
                          <CheckIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </>
            ) : (
              <>
                {" "}
                <Typography sx={{ fontWeight: 700 }}>{track.title}</Typography>
                &nbsp;
                <Typography variant="body1">
                  ({formatDuration(track.lengthSeconds)})
                </Typography>
              </>
            )}
          </>
        ) : (
          <>
            <CircularProgress size={20} sx={{ mr: 1 }} />
          </>
        )}
      </Box>
      {track.title && !isEditing && (
        <IconButton
          onClick={() => {
            console.log("edit clicked");
            setIsEditing(true);
          }}
        >
          <EditIcon />
        </IconButton>
      )}
      <CloseIcon
        sx={{ marginLeft: "auto", cursor: "pointer" }}
        onClick={() => onRemove(id)}
        onMouseEnter={() => setCloseHovered(true)}
        onMouseLeave={() => setCloseHovered(false)}
      />
    </ListItem>
  );
};

interface DroppableAreaProps {
  children: ReactNode;
}

export const DroppableArea: React.FC<DroppableAreaProps> = ({ children }) => {
  const theme = useTheme();
  const { isOver, setNodeRef } = useDroppable({
    id: "tracklist",
  });
  const style = {
    backgroundColor: isOver ? theme.palette.secondary.main : undefined,
  };

  return (
    <List ref={setNodeRef} sx={style}>
      {children}
    </List>
  );
};
