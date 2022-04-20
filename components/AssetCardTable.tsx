import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { AssetCardData } from './AssetCard';
import { AssetRow } from './AssetRow';

export const AssetCardTable = ({ assets }: { assets: AssetCardData[] }) => (
  <TableContainer>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell align='right' style={{ padding: '16px 16px 0px', width: '0px' }}></TableCell>
          <TableCell align='right' style={{ padding: '16px 16px 0px' }} sx={{ fontSize: '0.75rem', color: '#999' }}>Name</TableCell>
          <TableCell align='right' style={{ padding: '16px 16px 0px' }} sx={{ fontSize: '0.75rem', color: '#999' }}>Network</TableCell>
          <TableCell align='right' style={{ padding: '16px 16px 0px' }} sx={{ fontSize: '0.75rem', color: '#999' }}>Price</TableCell>
          <TableCell align='right' style={{ padding: '16px 16px 0px' }} sx={{ fontSize: '0.75rem', color: '#999' }}>Count</TableCell>
          <TableCell align='right' style={{ padding: '16px 16px 0px', width: '0px' }}></TableCell>
        </TableRow>
      </TableHead>
      
      <TableBody>
        {assets.map(item => <AssetRow data={item} />)}
      </TableBody>
    </Table>
  </TableContainer>
)