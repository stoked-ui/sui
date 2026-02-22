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
import DescriptionIcon from '@mui/icons-material/DescriptionOutlined';
import { alpha } from '@mui/material/styles';

interface ProductCardProps {
  product: {
    _id: string;
    productId: string;
    name: string;
    description: string;
    live: boolean;
    icon: string;
  };
  pageCount: number;
  onClick: () => void;
  onToggleLive: (id: string, live: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ProductCard({ product, pageCount, onClick, onToggleLive, onEdit, onDelete }: ProductCardProps) {
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
            {product.name}
          </Typography>
          <Chip
            label={product.live ? 'Live' : 'Hidden'}
            color={product.live ? 'success' : 'default'}
            size="small"
            variant="outlined"
          />
        </Stack>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {product.description}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
          ID: {product.productId}
        </Typography>
        <Stack direction="row" alignItems="center" spacing={0.5} mt={1}>
          <DescriptionIcon fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            {pageCount} page{pageCount !== 1 ? 's' : ''}
          </Typography>
        </Stack>
      </CardContent>
      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 1.5 }}>
        <Box>
          <Switch
            size="small"
            checked={product.live}
            onChange={(e) => {
              e.stopPropagation();
              onToggleLive(product._id, e.target.checked);
            }}
          />
        </Box>
        <Stack direction="row" spacing={0.5}>
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); onEdit(product._id); }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={(e) => { e.stopPropagation(); onDelete(product._id); }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      </CardActions>
    </Card>
  );
}
