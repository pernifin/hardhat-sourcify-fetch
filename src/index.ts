import { task, types } from 'hardhat/config';
import fetchAction from './fetch';

task('fetch', 'Fetches smart contract code by address using Sourcify')
  .addParam('address', 'Contract address', undefined, types.string)
  .addOptionalParam('name', 'Contract name', undefined, types.string)
  .setAction(fetchAction);