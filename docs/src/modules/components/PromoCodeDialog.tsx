import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

interface PromoCodeFormData {
  code: string;
  discountType: 'percentage' | 'fixed_amount' | 'free_trial_days';
  discountValue: number;
  expiresAt?: string;
  maxUses?: number;
  active: boolean;
  applicableProductIds: string[];
}

interface PromoCodeDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: PromoCodeFormData) => void;
  initialData?: Partial<PromoCodeFormData>;
  mode: 'create' | 'edit';
}

const defaultFormData: PromoCodeFormData = {
  code: '',
  discountType: 'percentage',
  discountValue: 0,
  expiresAt: undefined,
  maxUses: undefined,
  active: true,
  applicableProductIds: [],
};

function getDiscountValueLabel(discountType: PromoCodeFormData['discountType']): string {
  switch (discountType) {
    case 'percentage':
      return 'Percentage (%)';
    case 'fixed_amount':
      return 'Amount (cents)';
    case 'free_trial_days':
      return 'Trial Days';
    default:
      return 'Discount Value';
  }
}

function PromoCodeDialog({ open, onClose, onSave, initialData, mode }: PromoCodeDialogProps) {
  const [formData, setFormData] = useState<PromoCodeFormData>({
    ...defaultFormData,
    ...initialData,
  });

  useEffect(() => {
    if (open) {
      setFormData({
        ...defaultFormData,
        ...initialData,
      });
    }
  }, [open, initialData]);

  const isSaveDisabled = formData.code.trim() === '' || formData.discountValue <= 0;

  function handleCodeChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFormData((prev) => ({ ...prev, code: event.target.value.toUpperCase() }));
  }

  function handleDiscountTypeChange(event: React.ChangeEvent<{ value: unknown }>) {
    setFormData((prev) => ({
      ...prev,
      discountType: event.target.value as PromoCodeFormData['discountType'],
    }));
  }

  function handleDiscountValueChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFormData((prev) => ({ ...prev, discountValue: Number(event.target.value) }));
  }

  function handleExpiresAtChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFormData((prev) => ({
      ...prev,
      expiresAt: event.target.value !== '' ? event.target.value : undefined,
    }));
  }

  function handleMaxUsesChange(event: React.ChangeEvent<HTMLInputElement>) {
    const val = event.target.value;
    setFormData((prev) => ({
      ...prev,
      maxUses: val !== '' ? Number(val) : undefined,
    }));
  }

  function handleActiveChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFormData((prev) => ({ ...prev, active: event.target.checked }));
  }

  function handleSave() {
    onSave(formData);
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{mode === 'create' ? 'Create Promo Code' : 'Edit Promo Code'}</DialogTitle>
      <DialogContent>
        <TextField
          label="Code"
          value={formData.code}
          onChange={handleCodeChange}
          disabled={mode === 'edit'}
          fullWidth
          margin="normal"
          inputProps={{ style: { textTransform: 'uppercase' } }}
        />
        <FormControl fullWidth margin="normal">
          <InputLabel id="discount-type-label">Discount Type</InputLabel>
          <Select
            labelId="discount-type-label"
            label="Discount Type"
            value={formData.discountType}
            onChange={handleDiscountTypeChange as any}
          >
            <MenuItem value="percentage">Percentage</MenuItem>
            <MenuItem value="fixed_amount">Fixed Amount</MenuItem>
            <MenuItem value="free_trial_days">Free Trial Days</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label={getDiscountValueLabel(formData.discountType)}
          type="number"
          value={formData.discountValue}
          onChange={handleDiscountValueChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Expires At"
          type="datetime-local"
          value={formData.expiresAt ?? ''}
          onChange={handleExpiresAtChange}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Max Uses"
          type="number"
          value={formData.maxUses ?? ''}
          onChange={handleMaxUsesChange}
          placeholder="Unlimited"
          fullWidth
          margin="normal"
        />
        <FormControlLabel
          control={<Switch checked={formData.active} onChange={handleActiveChange} />}
          label="Active"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={isSaveDisabled}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export type { PromoCodeFormData };
export default PromoCodeDialog;
