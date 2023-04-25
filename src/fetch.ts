import fetch from 'node-fetch';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { NomicLabsHardhatPluginError } from 'hardhat/plugins';
import '@nomiclabs/hardhat-ethers';
import type { ActionType, TaskArguments } from 'hardhat/types';

const SOURCIFY_SERVER = 'https://sourcify.dev/server';

type SourcifyResponse = {
  status: 'partial' | 'full';
  files: SourcifyFile[];
  error?: string;
}

type SourcifyFile = {
  name: string;
  path: string;
  content: string;
}

const action: ActionType<TaskArguments> = async ({ address, name }: { address: string, name?: string}, { ethers }) => {
  if (!ethers.utils.isAddress(address)) {
    throw new NomicLabsHardhatPluginError(
      'Retrieve',
      `${address} is an invalid address.`
    );
  }

  const { chainId } = await ethers.provider.getNetwork();
  const { status, files, error } = await fetch(`${SOURCIFY_SERVER}/files/any/${chainId}/${address}`)
    .then((res) => res.json() as Promise<SourcifyResponse>);

  if (error) {
    throw new NomicLabsHardhatPluginError('Retrieve', error);
  }

  if (status === 'partial') {
    console.warn('Contract is available as a partial match in the repository.');
  }

  const metadata = files.find(file => file.name === 'metadata.json');
  if (!metadata) {
    throw new NomicLabsHardhatPluginError('Retrieve', 'No metadata file found.');
  }

  const packageName = name || Object.values(JSON.parse(metadata.content).settings.compilationTarget)[0];
  const targetDir = `./contracts/${packageName}`;
  await mkdir(targetDir, { recursive: true }); // Unreliable way

  const writes = files.map(async (file) => {
    const filepath = file.path.split(address)[1];
    const content = file === metadata ? JSON.stringify(JSON.parse(file.content), null, 2) : file.content;
    const fileDir = path.dirname(filepath);

    return mkdir(`${targetDir}${fileDir}`, { recursive: true })
      .then(() => writeFile(`${targetDir}${filepath}`, content));
  });

  await Promise.all(writes);
};

export default action;