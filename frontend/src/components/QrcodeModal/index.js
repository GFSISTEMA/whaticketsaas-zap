import React, { useEffect, useState, useContext } from "react";
import QRCode from "qrcode.react";
import toastError from "../../errors/toastError";
import { MoreVert, Settings } from "@material-ui/icons";

import { Dialog, DialogContent, Paper, Typography, useTheme, CircularProgress } from "@material-ui/core";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import { SocketContext } from "../../context/Socket/SocketContext";

const QrcodeModal = ({ open, onClose, whatsAppId }) => {
  const [qrCode, setQrCode] = useState("");
  const theme = useTheme();

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    const fetchSession = async () => {
      if (!whatsAppId) return;

      try {
        const { data } = await api.get(`/whatsapp/${whatsAppId}`);
        setQrCode(data.qrcode);
      } catch (err) {
        toastError(err);
      }
    };
    fetchSession();
  }, [whatsAppId]);

  useEffect(() => {
    if (!whatsAppId) return;
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    socket.on(`company-${companyId}-whatsappSession`, (data) => {
      if (data.action === "update" && data.session.id === whatsAppId) {
        setQrCode(data.session.qrcode);
      }

      if (data.action === "update" && data.session.qrcode === "") {
        onClose();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [whatsAppId, onClose, socketManager]);

  const styles = {
    paper: {
      display: "flex",
      alignItems: "center"
    },
    instructions: {
      marginRight: "20px"
    },
    title: {
      fontFamily: "Montserrat",
      fontWeight: "bold",
      fontSize: "20px"
    },
    qrcodeContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: 256,
      minWidth: 256
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" scroll="paper">
      <DialogContent>
      <Paper elevation={0} style={styles.paper}>
          <div style={styles.instructions}>
            <Typography variant="h2" component="h2" color="textPrimary" gutterBottom style={styles.title}>
              {i18n.t("connections.toolTips.qrcode.title")}
            </Typography>
            <Typography variant="body1" color="textPrimary" gutterBottom>
            {i18n.t("connections.toolTips.qrcode.step1")}
            </Typography>
            <Typography variant="body1" color="textPrimary" gutterBottom>
            {i18n.t("connections.toolTips.qrcode.step2")} <MoreVert fontSize="small" /> {i18n.t("connections.toolTips.qrcode.or")} <Settings fontSize="small" />
            </Typography>
            <Typography variant="body1" color="textPrimary" gutterBottom>
            {i18n.t("connections.toolTips.qrcode.step3")}
            </Typography>
            <Typography variant="body1" color="textPrimary" gutterBottom>
            {i18n.t("connections.toolTips.qrcode.step4")}
            </Typography>
          </div>
          <div style={styles.qrcodeContainer}>
            {qrCode ? (
              <QRCode value={qrCode} size={256} />
            ) : (
              <CircularProgress />
            )}
          </div>
        </Paper>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(QrcodeModal);
