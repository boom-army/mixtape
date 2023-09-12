import React, { createContext, useContext } from "react";
import { Snackbar } from "@mui/material";

type SnackBarContextActions = {
  enqueueSnackbar: (text: string) => void;
};

const SnackBarContext = createContext({} as SnackBarContextActions);

interface SnackBarContextProviderProps {
  children: React.ReactNode;
}

const SnackbarProvider: React.FC<SnackBarContextProviderProps> = ({ children }) => {
  const [open, setOpen] = React.useState<boolean>(false);
  const [message, setMessage] = React.useState<string>("");

  const enqueueSnackbar = (text: string) => {
    setMessage(text);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <SnackBarContext.Provider value={{ enqueueSnackbar }}>
      <Snackbar
        open={open}
        autoHideDuration={4000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={handleClose}
        message={message}
      />
      {children}
    </SnackBarContext.Provider>
  );
};

const useSnackbar = (): SnackBarContextActions => {
  const context = useContext(SnackBarContext);

  if (!context) {
    throw new Error("useSnackbar must be used within the SnackbarProvider");
  }

  return context;
};

export { SnackbarProvider, useSnackbar };