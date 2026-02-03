# Ganache Blockchain Voting System Setup

This document explains how to set up and deploy the VotingSystem smart contract to Ganache.

## Prerequisites

1. **Install Ganache**: Download from [trufflesuite.com/ganache](https://trufflesuite.com/ganache/)
2. **Install MetaMask**: Browser extension from [metamask.io](https://metamask.io)
3. **Install Truffle** (optional, for compilation): `npm install -g truffle`

## Quick Setup

### 1. Start Ganache

1. Open Ganache and create a new workspace
2. Note the RPC Server URL (usually `http://127.0.0.1:7545`)
3. Note the Chain ID (usually `1337` or `5777`)

### 2. Deploy the Smart Contract

#### Option A: Using Remix IDE (Easiest)

1. Go to [remix.ethereum.org](https://remix.ethereum.org)
2. Create a new file `VotingSystem.sol`
3. Copy the contents from `contracts/VotingSystem.sol`
4. Compile with Solidity 0.8.19+
5. In "Deploy & Run Transactions":
   - Select "Injected Provider - MetaMask"
   - Make sure MetaMask is connected to Ganache
   - Click "Deploy"
6. Copy the deployed contract address

#### Option B: Using Truffle

```bash
# In project root
npx truffle compile
npx truffle migrate --network ganache
```

### 3. Configure MetaMask

1. Open MetaMask
2. Add a new network:
   - Network Name: `Ganache Local`
   - RPC URL: `http://127.0.0.1:7545`
   - Chain ID: `1337`
   - Currency Symbol: `ETH`
3. Import a Ganache account using its private key (click the key icon in Ganache)

### 4. Update Contract Address

Edit `src/config/contract.ts` and set the `CONTRACT_ADDRESS`:

```typescript
export const CONTRACT_CONFIG = {
  GANACHE_RPC_URL: "http://127.0.0.1:7545",
  GANACHE_CHAIN_ID: 1337,
  CONTRACT_ADDRESS: "0xYourDeployedContractAddress", // <-- Add your address here
  NETWORK_NAME: "Ganache Local",
};
```

### 5. Test the System

1. Navigate to `/blockchain-vote` to access the blockchain voting page
2. Connect your MetaMask wallet
3. The deploying account is automatically the admin

## Admin Functions

The wallet that deploys the contract becomes the admin. Admin capabilities:

- **Create Elections**: Set title, description, type, start/end dates
- **Add Candidates**: Assign candidates to elections
- **Verify Voters**: Authorize wallet addresses to vote
- **Transfer Admin**: Hand over admin rights to another wallet

## Voter Verification Flow

1. User connects their MetaMask wallet
2. Admin verifies the wallet address with a Voter ID
3. User can now vote in active elections

## Smart Contract Functions

### Read Functions
- `getElection(id)` - Get election details
- `getCandidate(id)` - Get candidate details with vote count
- `getElectionCandidateIds(electionId)` - Get all candidate IDs for an election
- `hasVotedInElection(electionId, voter)` - Check if a voter has voted
- `getVoterStatus(voter)` - Check verification status
- `getElectionStatus(id)` - Get election status (upcoming/active/completed)

### Write Functions (Admin Only)
- `createElection(...)` - Create a new election
- `addCandidate(...)` - Add a candidate to an election
- `updateElection(...)` - Update election details
- `updateCandidate(...)` - Update candidate details
- `verifyVoter(address, voterId)` - Verify a voter's wallet
- `revokeVoter(address)` - Remove voter verification

### Write Functions (Verified Voters)
- `castVote(electionId, candidateId)` - Cast a vote

## Troubleshooting

### "Contract not configured"
Update `CONTRACT_ADDRESS` in `src/config/contract.ts`

### "Voter not verified"
Admin must call `verifyVoter` with the user's wallet address

### "Wrong network"
MetaMask must be connected to Ganache (Chain ID 1337)

### "Transaction failed"
- Check you have enough ETH in your Ganache account
- Ensure election is active (current time between start and end dates)
- Verify you haven't already voted in this election

## Security Notes

- This is a **development setup** using Ganache
- For production, deploy to a testnet (Sepolia, Goerli) or mainnet
- The contract uses simple admin authorization - consider multi-sig for production
- All votes are publicly visible on-chain (voter address + candidate choice)
