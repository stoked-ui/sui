import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Switch from '@mui/material/Switch';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import FolderIcon from '@mui/icons-material/FolderOutlined';
import ReceiptIcon from '@mui/icons-material/ReceiptOutlined';
import { alpha } from '@mui/material/styles';

interface ClientCardProps {
  client: {
    _id: string;
    name: string;
    contactEmail: string;
    active: boolean;
    slug: string;
  };
  deliverableCount: number;
  invoiceCount?: number;
  onClick: () => void;
  onToggleActive: (id: string, active: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ClientCard({ client, deliverableCount, invoiceCount, onClick, onToggleActive, onEdit, onDelete }: ClientCardProps) {
  return (
    <Card
      variant="outlined"
      sx={(theme) => ({
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: theme.palette.primary.main,
          boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.main, 0.3)}`,
        },
      })}
    >
      <CardContent onClick={onClick}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Typography variant="h6" component="div" noWrap sx={{ flex: 1, mr: 1 }}>
            {client.name}
          </Typography>
          <Chip
            label={client.active ? 'Active' : 'Inactive'}
            color={client.active ? 'success' : 'default'}
            size="small"
            variant="outlined"
          />
        </Stack>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {client.contactEmail}
        </Typography>
        <Stack direction="row" alignItems="center" spacing={2} mt={1}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <FolderIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {deliverableCount} deliverable{deliverableCount !== 1 ? 's' : ''}
            </Typography>
          </Stack>
          {invoiceCount !== undefined && invoiceCount > 0 && (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <ReceiptIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {invoiceCount} invoice{invoiceCount !== 1 ? 's' : ''}
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>
      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 1.5 }}>
        <Box>
          <Switch
            size="small"
            checked={client.active}
            onChange={(e) => {
              e.stopPropagation();
              onToggleActive(client._id, e.target.checked);
            }}
          />
        </Box>
        <Stack direction="row" spacing={0.5}>
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); onEdit(client._id); }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={(e) => { e.stopPropagation(); onDelete(client._id); }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      </CardActions>
    </Card>
  );
}
