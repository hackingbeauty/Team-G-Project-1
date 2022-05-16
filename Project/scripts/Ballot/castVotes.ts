import { Contract, ethers } from "ethers";
import "dotenv/config";
import * as ballotJson from "../../artifacts/contracts/Ballot.sol/Ballot.json";
// eslint-disable-next-line node/no-missing-import
import { Ballot } from "../../typechain";

// This key is already public on Herong's Tutorial Examples - v1.03, by Dr. Herong Yang
// Do never expose your keys like this
const EXPOSED_KEY =
  "8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f";

async function main() {
  const wallet = 
    process.env.MNEMONIC && process.env.MNEMONIC.length > 0
    ? ethers.Wallet.fromMnemonic(process.env.MNEMONIC)
    : new ethers.Wallet(process.env.PRIVATE_KEY ?? EXPOSED_KEY);

  console.log(`Wallet address ${wallet.address}`);
  const provider = ethers.providers.getDefaultProvider("ropsten");
  const signer = wallet.connect(provider);
  const balanceBN = await signer.getBalance();
  const signerAddress = await signer.address;
  const balance = Number(ethers.utils.formatEther(balanceBN));
  console.log(`Wallet balance ${balance}`);

  if (balance < 0.01) {
    throw new Error("Not enough ether");
  }

  if (process.argv.length < 2) throw new Error("Ballot contract's address missing");
  const ballotContractAddress = process.argv[2];

  console.log(`Ballot Contract address is: ${ballotContractAddress}`);
  console.log(`Attaching ballot contract interface to address ${ballotContractAddress}`);

  //A Contract is an abstraction of code that has been deployed to the blockchain.
  const ballotContract: Ballot = new Contract(
    ballotContractAddress,
    ballotJson.abi,
    signer
  ) as Ballot;

  const deployedBallotContract = await ballotContract.deployed();
  const numOfProposals = await deployedBallotContract.getNumProposals();

  await deployedBallotContract.vote(0); //vote for proposal #3

  for (let index = 0; index < Number(numOfProposals); index++) {
    const proposal = await ballotContract.proposals(index);
    console.log('=======================')
    console.log(`Proposal is: ${proposal}`);
    console.log(`Proposal voteCount is: ${proposal.voteCount.toNumber()}`);
  }

  const signerVoted = await ballotContract.voters("0x668417616f1502D13EA1f9528F83072A133e8E01");
  console.log(`Signers address is: ${signerAddress}`);
  console.log(`Signer voted: ${signerVoted.voted}`);
  console.log(`Signer voted: ${signerVoted.vote}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});