import * as React from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { Link } from '@stoked-ui/docs';

function LatestVersions() {
  return (
    <Box sx={{ width: '100%' }}>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>
              <Typography variant="body2">main branch</Typography>
            </TableCell>
            <TableCell>
              <Link
                variant="body2"
                rel="nofollow"
                href="https://stoked-ui.com/docs"
              >
                Documentation
              </Link>
            </TableCell>
            <TableCell>
              <Link
                variant="body2"
                href="https://github.com/stoked-ui/sui/tree/main"
              >
                Source code
              </Link>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Typography variant="body2">next branch</Typography>
            </TableCell>
            <TableCell>
              <Link
                variant="body2"
                rel="nofollow"
                href="https://next.stoked-ui.com/docs"
              >
                Documentation
              </Link>
            </TableCell>
            <TableCell>
              <Link
                variant="body2"
                href="https://github.com/stoked-ui/sui/tree/next"
              >
                Source code
              </Link>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Box>
  );
}

export default LatestVersions;

