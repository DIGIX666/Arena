# ArenaNFT.sol

## READ functions

**name()** -> Returns NFT collection name
**symbol()** -> Returns NFT collection symbol
**signerAddress()** -> Returns authorized backend signer address
**nextRaffleId()** -> Returns next raffle ID counter
**raffles(uint256 _raffleId)** -> Returns raffle data (description, requiredPoints, deadline, isResolved, winner)
**balanceOf(address _owner)** -> Returns number of NFTs owned by address
**ownerOf(uint256 _tokenId)** -> Returns owner of specific NFT token
**tokenURI(uint256 _tokenId)** -> Returns metadata URI for NFT token
**getApproved(uint256 _tokenId)** -> Returns approved address for specific token
**isApprovedForAll(address _owner, address _operator)** -> Returns if operator is approved for all tokens
**supportsInterface(bytes4 _interfaceId)** -> Returns if interface is supported

## WRITE functions

**createRaffle(string _description, uint256 _requiredPoints, uint256 _deadline)** -> Create new raffle for NFT
**enterRaffle(uint256 _raffleId, bytes _signature)** -> Enter raffle with backend signature verification
**resolveRaffleAndMint(uint256 _raffleId, address _winner)** -> Resolve raffle and mint NFT to winner
**approve(address _to, uint256 _tokenId)** -> Approve address to transfer specific token
**setApprovalForAll(address _operator, bool _approved)** -> Set approval for all tokens
**transferFrom(address _from, address _to, uint256 _tokenId)** -> Transfer token between addresses
**safeTransferFrom(address _from, address _to, uint256 _tokenId)** -> Safe transfer with receiver check
**safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes _data)** -> Safe transfer with data

## Events

**RaffleCreated(uint256 indexed raffleId, string description, uint256 requiredPoints)** -> New raffle created
**UserEntered(uint256 indexed raffleId, address indexed user)** -> User entered raffle
**RaffleResolved(uint256 indexed raffleId, address indexed winner, uint256 nftId)** -> Raffle resolved with winner
**Transfer(address indexed from, address indexed to, uint256 indexed tokenId)** -> NFT transferred
**Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)** -> Token approved
**ApprovalForAll(address indexed owner, address indexed operator, bool approved)** -> Operator approved

## Signature Verification

**PARTICIPATION_VOUCHER_TYPEHASH** -> EIP712 type hash for participation vouchers
**_verifySignature(uint256 _raffleId, address _user, bytes _signature)** -> Internal signature verification

### USER functions
**enterRaffle()** -> Enter raffle with valid signature from backend
**approve()** -> Approve NFT transfers
**setApprovalForAll()** -> Set operator approvals
**transferFrom()** -> Transfer NFTs
**safeTransferFrom()** -> Safe NFT transfers

### OWNER functions
#### Manage Raffles
**createRaffle()** -> Create new NFT raffle
**resolveRaffleAndMint()** -> Resolve raffle and mint NFT to winner

#### Manage System
**transferOwnership()** -> Transfer contract ownership
**renounceOwnership()** -> Renounce contract ownership

## Key Features
- **EIP712 Signatures**: Secure backend signature verification for raffle entry
- **Point-based Entry**: Raffles require minimum points to participate
- **Unique NFT IDs**: Each raffle creates NFT with same ID as raffle
- **Time-limited Raffles**: Raffles have deadlines for participation
- **Winner Verification**: Only actual participants can win raffles
- **Standard ERC721**: Full NFT functionality with transfers and approvals

## Raffle Flow
1. Owner creates raffle with description, required points, and deadline
2. Users request participation from backend (off-chain points verification)
3. Backend provides EIP712 signature for eligible users
4. Users enter raffle with signature
5. Owner resolves raffle and mints NFT to winner