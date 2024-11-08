import { ethers } from 'ethers';
import fs from 'fs/promises';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// ABI for an ERC721Enumerable contract
const ERC721EnumerableABI = [
  'function totalSupply() view returns (uint256)',
  'function tokenByIndex(uint256 index) view returns (uint256)',
  'function tokenURI(uint256 tokenId) view returns (string)',
];

// IPFS gateway URL
const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';

async function fetchMetadata(uri: string): Promise<any> {
  let url = uri;
  if (uri.startsWith('ipfs://')) {
    const cid = uri.replace('ipfs://', '');
    url = `${IPFS_GATEWAY}${cid}`;
  }
  const response = await fetch(url);
  return await response.json();
}

async function prepareMetadata(contractAddress: string, project: string, collection: string) {
  // Get RPC URL from environment variable
  const rpcUrl = process.env.ETHEREUM_RPC_URL;
  if (!rpcUrl) {
    throw new Error('ETHEREUM_RPC_URL environment variable is not set');
  }

  // Connect to Ethereum network
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  
  // Create contract instance
  const contract = new ethers.Contract(contractAddress, ERC721EnumerableABI, provider);

  // Get total supply
  const totalSupply = await contract.totalSupply();
  console.log(`Total supply: ${totalSupply}`);

  const metadata: Record<string, any> = {};

  // Fetch metadata for each token
  for (let i = 0n; i < totalSupply; i++) {
    const tokenId = i;
    console.log(`Token ID: ${tokenId}`);
    
    // Fetch metadata from tokenURI
    try {
      const tokenURI = await contract.tokenURI(tokenId);
      console.log(`Token URI: ${tokenURI}`);
      const tokenMetadata = await fetchMetadata(tokenURI);
      console.log(`Token metadata: ${JSON.stringify(tokenMetadata)}`);
      metadata[tokenId.toString()] = tokenMetadata;

      // Log progress
      console.log(`Processed token ${tokenId} (${i + 1n}/${totalSupply})`);
    } catch (error) {
      console.error(`Error fetching metadata for token ${tokenId}: ${error}`);
      metadata[tokenId.toString()] = { name: `<BURNED> #${tokenId}` };
    }
  }

  // Prepare output directory
  const outputDir = path.join(__dirname, '..', '..', 'metadata', project);
  await fs.mkdir(outputDir, { recursive: true });

  // Write metadata to file
  const outputPath = path.join(outputDir, `${collection}.json`);
  await fs.writeFile(outputPath, JSON.stringify(metadata, null, 2));

  console.log(`Metadata saved to ${outputPath}`);
}

if (require.main === module) {
  const argv = yargs(hideBin(process.argv))
    .option('contract', {
      alias: 'c',
      description: 'Ethereum contract address',
      type: 'string',
      demandOption: true
    })
    .option('project', {
      alias: 'p',
      description: 'Project name',
      type: 'string',
      demandOption: true
    })
    .option('collection', {
      alias: 'l',
      description: 'Collection name',
      type: 'string',
      demandOption: true
    })
    .help()
    .alias('help', 'h')
    .argv;

  prepareMetadata(argv.contract as string, argv.project as string, argv.collection as string)
    .then(() => console.log('Metadata preparation complete'))
    .catch((error) => console.error('Error preparing metadata:', error));
}

export { prepareMetadata };
