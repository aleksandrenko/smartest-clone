import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

interface ConfirmSubmitDialogProps {
  open: boolean;
  unansweredCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmSubmitDialog: React.FC<ConfirmSubmitDialogProps> = ({
  open,
  unansweredCount,
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          p: 1,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          fontWeight: 700,
          color: '#36363f',
        }}
      >
        <WarningAmberRoundedIcon sx={{ color: '#ffb921', fontSize: 28 }} />
        Внимание
      </DialogTitle>
      <DialogContent>
        {unansweredCount > 0 ? (
          <Typography variant="body1" sx={{ color: '#36363f' }}>
            Имаш <strong>{unansweredCount}</strong> въпрос(а) без отговор.
            Сигурен/а ли си, че искаш да изпратиш теста?
          </Typography>
        ) : (
          <Typography variant="body1" sx={{ color: '#36363f' }}>
            Сигурен/а ли си, че искаш да изпратиш теста?
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button
          onClick={onCancel}
          variant="outlined"
          sx={{
            borderColor: '#cedaf3',
            color: '#464555',
            fontWeight: 600,
            borderRadius: '6px',
            '&:hover': {
              backgroundColor: 'rgba(29, 193, 152, 0.05)',
              borderColor: '#cedaf3',
            },
          }}
        >
          Отказ
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          sx={{
            backgroundColor: '#1dc198',
            fontWeight: 700,
            borderRadius: '6px',
            '&:hover': {
              backgroundColor: '#17a583',
            },
          }}
        >
          Изпрати теста
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmSubmitDialog;
