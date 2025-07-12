# Arena.sol

## READ functions
### Basic contract info
**bettingToken()**  -> Returns betting token address
**fanTokenForBonus()** ->  fan token address
**plateformFeePercent()** ->  plateform fee
**nextArenaId()** ->  next arena ID to be created
**owner()** ->  contract owner address

## Arena data
**arenas(uint 256 arenaId)** -> Returns arena details(title, potTotal, deadline..)
**outcomePots(uint256 arenaId, uint256 outcomeId)** -> pot amount for specific outcome
 
## WRITE functions

### ADMIN function
**createArena(string title, string[] outcomeNames, uint256 deadline)**
**resolveArena(uint256 arenaId, uint256 winningOutcomeId)**
**trasnferOwnership(address newOwner)**

### USER function
**placeBet(uint256 arenaId, uint256 outcomeId, uint256 amount)**
**claimGains(uint256 arenaId)**

# ArenaNft.sol

## READ functions
### ERC721 standard
**name()**  -> Returns NFT collection name
**symbol()** ->  NFT collection symbol
**balanceOf()** ->  number of specific NFT
**ownerOf()** ->  owner of specific NFT
**getApprved()** ->  approved address fot NFT
**isAprovedForAll()** ->  approval status
**tokenURI()** ->  metadata URI for NFT
**supportsInterface()** ->  interface support

### Contract specific
**signerAddress()** -> Authorized backend signer address 
**nextRaffleId()** -> next raffle ID
**owner()** -> contract owner
**raffles(uint256 raffleID)** -> raffle details(decription, requiredPOints, winner..) 

### EIC712 Domain
**eip712Domain()** -> EIP712 domain info for signature verifcation



## WRITE functions

### OWNER function
**createRaffle(string description, uint256 requiredPoints, uint256 deadline)**
**resolveRaffleAndMint(uint256, address winner)**
**trasnferOwnership(address newOwner)**
**renounceOwnerShip()**

### USER function
**EnterRaffle(uint256 raffleId, bytes signature)**

`ERC721 Transfer function`
**approve(address to, uint256 tokenId)**
**setApprovalForAll(address operator, uint256 tokenId)**
**TransferFrom(address from, address to, uint256 tokenId)**
**safeTransferFrom(address from, address to, uint256 tokenId)**
**safeTransferFrom(address from, address to, uint256 tokenId,bytes data)**
