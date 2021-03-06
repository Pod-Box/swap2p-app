import React from 'react';
import { useRouter } from 'next/router';
import { Avatar, Button as IconButton, Link, Menu, MenuItem, TableCell, TableRow } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import { useMetaMask } from 'metamask-react';

import etherscanLink from '@metamask/etherscan-link';
import { BigNumber, utils } from 'ethers';

export interface AssetData {
  shortName: string;
  displayName: string;
  price: number;
  count: BigNumber;

  address: string;
  decimals: number;
}

export const AssetRow = (({ data }: { data: AssetData }) => {
  const router = useRouter();
  const { status, connect, account, chainId, ethereum } = useMetaMask();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  }
  const handleCreateTrade = () => {
    router.push(`/trade/create?XAssetAddress=${data.address}`);
    setAnchorEl(null);
  };
  const handleViewAbout = () => {
    setAnchorEl(null);
  }

  return (
    <TableRow>
      <TableCell align='right'>
        <Link href={etherscanLink.createAccountLinkForChain(data.address, chainId!)}><Avatar>{data.shortName}</Avatar></Link>
      </TableCell>
      <TableCell align='right'>{data.displayName}</TableCell>
      <TableCell align='right'>{data.price}</TableCell>
      <TableCell align='right'>{utils.formatUnits(data.count, data.decimals)}</TableCell>
      <TableCell align='right'>
        <IconButton
          aria-controls={open ? 'basic-menu' : undefined}
          aria-haspopup='true'
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleViewAbout}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
          <MenuItem onClick={handleCreateTrade}>Create trade</MenuItem>
        </Menu>
      </TableCell>
    </TableRow>
  )
});
