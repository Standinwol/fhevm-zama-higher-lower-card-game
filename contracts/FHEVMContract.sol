// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title FHEVMContract
 * @dev Single contract combining FHEVM demo and Higher/Lower game functionality
 * @author Standinwol
 * 
 * This unified contract provides:
 * - Complete FHEVM SDK demonstration
 * - Privacy-preserving Higher/Lower card game
 * - All FHEVM operations in one place
 * - Production-ready SepoliaConfig integration
 */
contract FHEVMContract is SepoliaConfig {
    
    // ===========================================
    // SHARED ENCRYPTED DATA & MAPPINGS
    // ===========================================
    
    mapping(address => euint32) private encryptedBalances;
    mapping(address => euint32) private encryptedScores;
    mapping(address => ebool) private encryptedFlags;
    mapping(address => bool) public hasDeposit;
    mapping(address => uint256) public lastActivity;
    
    // Simple balances for testing fallback
    mapping(address => uint256) private simpleBalances;
    
    // ===========================================
    // GAME-SPECIFIC DATA
    // ===========================================
    
    mapping(address => Game) private games;
    mapping(address => SimpleGame) private simpleGames;
    
    struct Game {
        address player;
        euint32 wager;
        uint8 currentCard;
        euint32 score;
        bool isActive;
        uint256 timestamp;
        bytes32 gameSecret;
    }
    
    struct SimpleGame {
        address player;
        uint256 wager;
        uint8 currentCard;
        uint256 score;
        bool isActive;
        uint256 timestamp;
        bytes32 gameSecret;
    }
    
    // ===========================================
    // EVENTS
    // ===========================================
    
    event EncryptedDeposit(address indexed user, uint256 timestamp);
    event EncryptedOperation(address indexed user, string operation, uint256 timestamp);
    event PermissionGranted(address indexed user, string dataType, uint256 timestamp);
    event GameStarted(address indexed player, uint8 startingCard, uint256 timestamp);
    event GameResult(address indexed player, uint8 newCard, bool won, uint256 score, uint256 timestamp);
    event GameEnded(address indexed player, uint256 timestamp);
    event DepositMade(address indexed player, uint256 timestamp);
    event WithdrawalMade(address indexed player, uint256 timestamp);
    
    constructor() {}
    
    // ===========================================
    // CORE FHEVM DEMO FUNCTIONS
    // ===========================================
    
    /**
     * @dev Deposit encrypted amount with zero-knowledge proof validation
     */
    function depositEncrypted(externalEuint32 _encryptedAmount, bytes calldata inputProof) external payable {
        require(msg.value > 0, "Must send ETH with deposit");
        
        euint32 amount = FHE.fromExternal(_encryptedAmount, inputProof);
        encryptedBalances[msg.sender] = FHE.add(encryptedBalances[msg.sender], amount);
        
        FHE.allowThis(encryptedBalances[msg.sender]);
        FHE.allow(encryptedBalances[msg.sender], msg.sender);
        
        hasDeposit[msg.sender] = true;
        lastActivity[msg.sender] = block.timestamp;
        
        emit EncryptedDeposit(msg.sender, block.timestamp);
        emit PermissionGranted(msg.sender, "balance", block.timestamp);
    }
    
    /**
     * @dev Simple deposit function for testing (no encryption)
     */
    function simpleDeposit() external payable {
        require(msg.value > 0, "Must send ETH with deposit");
        
        simpleBalances[msg.sender] += msg.value;
        hasDeposit[msg.sender] = true;
        lastActivity[msg.sender] = block.timestamp;
        
        emit DepositMade(msg.sender, block.timestamp);
    }
    
    /**
     * @dev FHEVM deposit with ETH conversion (simplified)
     */
    function fhevmDeposit() external payable {
        require(msg.value > 0, "Must send ETH with deposit");
        
        uint256 amountWei = msg.value;
        euint32 encryptedAmount = FHE.asEuint32(uint32(amountWei / 1e14));
        
        encryptedBalances[msg.sender] = FHE.add(encryptedBalances[msg.sender], encryptedAmount);
        hasDeposit[msg.sender] = true;
        
        FHE.allowThis(encryptedBalances[msg.sender]);
        FHE.allow(encryptedBalances[msg.sender], msg.sender);
        
        emit DepositMade(msg.sender, block.timestamp);
    }
    
    /**
     * @dev Perform encrypted arithmetic operations
     */
    function performArithmetic(
        externalEuint32 _encryptedA, 
        externalEuint32 _encryptedB, 
        bytes calldata proofA,
        bytes calldata proofB
    ) external {
        euint32 a = FHE.fromExternal(_encryptedA, proofA);
        euint32 b = FHE.fromExternal(_encryptedB, proofB);
        
        euint32 sum = FHE.add(a, b);
        euint32 difference = FHE.sub(a, b);
        euint32 product = FHE.mul(a, b);
        
        encryptedScores[msg.sender] = FHE.add(sum, FHE.add(difference, product));
        
        FHE.allowThis(encryptedScores[msg.sender]);
        FHE.allow(encryptedScores[msg.sender], msg.sender);
        
        lastActivity[msg.sender] = block.timestamp;
        emit EncryptedOperation(msg.sender, "arithmetic", block.timestamp);
    }
    
    /**
     * @dev Transfer encrypted amount between users
     */
    function transferEncrypted(
        address to, 
        externalEuint32 _encryptedAmount, 
        bytes calldata inputProof
    ) external {
        require(to != msg.sender, "Cannot transfer to self");
        require(hasDeposit[msg.sender], "No balance available");
        
        euint32 amount = FHE.fromExternal(_encryptedAmount, inputProof);
        
        encryptedBalances[msg.sender] = FHE.sub(encryptedBalances[msg.sender], amount);
        encryptedBalances[to] = FHE.add(encryptedBalances[to], amount);
        
        FHE.allowThis(encryptedBalances[msg.sender]);
        FHE.allow(encryptedBalances[msg.sender], msg.sender);
        FHE.allowThis(encryptedBalances[to]);
        FHE.allow(encryptedBalances[to], to);
        
        hasDeposit[to] = true;
        lastActivity[msg.sender] = block.timestamp;
        lastActivity[to] = block.timestamp;
        
        emit EncryptedOperation(msg.sender, "transfer", block.timestamp);
    }
    
    /**
     * @dev Set encrypted boolean flag
     */
    function setEncryptedFlag(bool flag) external {
        encryptedFlags[msg.sender] = FHE.asEbool(flag);
        
        FHE.allowThis(encryptedFlags[msg.sender]);
        FHE.allow(encryptedFlags[msg.sender], msg.sender);
        
        lastActivity[msg.sender] = block.timestamp;
        emit EncryptedOperation(msg.sender, "set_flag", block.timestamp);
    }
    
    /**
     * @dev Increment encrypted score
     */
    function incrementScore() external {
        require(hasDeposit[msg.sender], "Must have deposit first");
        
        euint32 increment = FHE.asEuint32(1);
        encryptedScores[msg.sender] = FHE.add(encryptedScores[msg.sender], increment);
        
        FHE.allowThis(encryptedScores[msg.sender]);
        FHE.allow(encryptedScores[msg.sender], msg.sender);
        
        lastActivity[msg.sender] = block.timestamp;
        emit EncryptedOperation(msg.sender, "increment", block.timestamp);
    }
    
    // ===========================================
    // HIGHER/LOWER GAME FUNCTIONS (FHEVM)
    // ===========================================
    
    /**
     * @dev Start encrypted Higher/Lower game
     */
    function startGame(externalEuint32 _encryptedWager, bytes calldata inputProof) external {
        require(!games[msg.sender].isActive, "Game already in progress");
        require(hasDeposit[msg.sender], "No balance available");
        
        euint32 wager = FHE.fromExternal(_encryptedWager, inputProof);
        encryptedBalances[msg.sender] = FHE.sub(encryptedBalances[msg.sender], wager);
        
        uint8 currentCard = uint8((uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            block.number
        ))) % 13) + 1);
        
        games[msg.sender] = Game({
            player: msg.sender,
            wager: wager,
            currentCard: currentCard,
            score: FHE.asEuint32(0),
            isActive: true,
            timestamp: block.timestamp,
            gameSecret: keccak256(abi.encodePacked(block.timestamp, msg.sender, currentCard))
        });
        
        FHE.allowThis(games[msg.sender].wager);
        FHE.allow(games[msg.sender].wager, msg.sender);
        FHE.allowThis(games[msg.sender].score);
        FHE.allow(games[msg.sender].score, msg.sender);
        FHE.allowThis(encryptedBalances[msg.sender]);
        FHE.allow(encryptedBalances[msg.sender], msg.sender);
        
        emit GameStarted(msg.sender, currentCard, block.timestamp);
    }
    
    /**
     * @dev Make guess in encrypted game
     */
    function makeGuess(bool isHigher) external returns (bool correct, uint8 newCard) {
        Game storage game = games[msg.sender];
        require(game.isActive, "No active game");
        
        newCard = uint8((uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender, 
            game.gameSecret,
            block.number
        ))) % 13) + 1);
        
        if (isHigher) {
            correct = newCard > game.currentCard;
        } else {
            correct = newCard < game.currentCard;
        }
        
        if (correct) {
            game.score = FHE.add(game.score, FHE.asEuint32(1));
            game.currentCard = newCard;
            
            euint32 multiplier = FHE.asEuint32(2);
            euint32 winnings = FHE.mul(game.wager, multiplier);
            
            encryptedBalances[msg.sender] = FHE.add(encryptedBalances[msg.sender], winnings);
            
            FHE.allowThis(encryptedBalances[msg.sender]);
            FHE.allow(encryptedBalances[msg.sender], msg.sender);
            FHE.allowThis(game.score);
            FHE.allow(game.score, msg.sender);
            
            emit GameResult(msg.sender, newCard, true, 0, block.timestamp);
        } else {
            game.isActive = false;
            emit GameResult(msg.sender, newCard, false, 0, block.timestamp);
        }
    }
    
    /**
     * @dev Cash out current game
     */
    function cashOut() external {
        Game storage game = games[msg.sender];
        require(game.isActive, "No active game");
        
        game.isActive = false;
        emit GameEnded(msg.sender, block.timestamp);
    }
    
    // ===========================================
    // SIMPLE GAME FUNCTIONS (NON-ENCRYPTED)
    // ===========================================
    
    /**
     * @dev Start simple Higher/Lower game (for testing)
     */
    function simpleStartGame(uint256 _wager) external {
        require(!simpleGames[msg.sender].isActive, "Game already in progress");
        require(simpleBalances[msg.sender] >= _wager, "Insufficient balance");
        
        uint8 currentCard = uint8((uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender))) % 13) + 1);
        
        simpleGames[msg.sender] = SimpleGame({
            player: msg.sender,
            wager: _wager,
            currentCard: currentCard,
            score: 0,
            isActive: true,
            timestamp: block.timestamp,
            gameSecret: keccak256(abi.encodePacked(block.timestamp, msg.sender, currentCard))
        });
        
        simpleBalances[msg.sender] -= _wager;
        
        emit GameStarted(msg.sender, currentCard, block.timestamp);
    }
    
    /**
     * @dev Make guess in simple game
     */
    function simpleMakeGuess(bool isHigher) external returns (bool correct, uint8 newCard) {
        SimpleGame storage game = simpleGames[msg.sender];
        require(game.isActive, "No active game");
        
        newCard = uint8((uint256(keccak256(abi.encodePacked(
            block.timestamp, block.prevrandao, msg.sender, game.gameSecret
        ))) % 13) + 1);
        
        if (isHigher) {
            correct = newCard > game.currentCard;
        } else {
            correct = newCard < game.currentCard;
        }
        
        if (correct) {
            game.score += 1;
            game.currentCard = newCard;
            
            uint256 winnings = (game.wager * 15) / 10; // 1.5x multiplier
            simpleBalances[msg.sender] += winnings;
            
            emit GameResult(msg.sender, newCard, true, game.score, block.timestamp);
        } else {
            game.isActive = false;
            emit GameResult(msg.sender, newCard, false, game.score, block.timestamp);
        }
    }
    
    /**
     * @dev Cash out simple game
     */
    function simpleCashOut() external {
        SimpleGame storage game = simpleGames[msg.sender];
        require(game.isActive, "No active game");
        
        simpleBalances[msg.sender] += game.wager;
        game.isActive = false;
        
        emit GameEnded(msg.sender, block.timestamp);
    }
    
    // ===========================================
    // VIEW FUNCTIONS
    // ===========================================
    
    /**
     * @dev Get encrypted balance for off-chain decryption
     */
    function getEncryptedBalance() external view returns (euint32) {
        return encryptedBalances[msg.sender];
    }
    
    /**
     * @dev Get encrypted score
     */
    function getEncryptedScore() external view returns (euint32) {
        return encryptedScores[msg.sender];
    }
    
    /**
     * @dev Get encrypted flag
     */
    function getEncryptedFlag() external view returns (ebool) {
        return encryptedFlags[msg.sender];
    }
    
    /**
     * @dev Get simple balance
     */
    function getSimpleBalance() external view returns (uint256) {
        return simpleBalances[msg.sender];
    }
    
    /**
     * @dev Check if address has balance
     */
    function hasBalanceDeposited() external view returns (bool) {
        return hasDeposit[msg.sender];
    }
    
    /**
     * @dev Get user status
     */
    function getUserStatus() external view returns (
        bool hasBalance,
        uint256 lastActivityTime,
        bool isActive
    ) {
        hasBalance = hasDeposit[msg.sender];
        lastActivityTime = lastActivity[msg.sender];
        isActive = (block.timestamp - lastActivityTime) < 1 hours;
    }
    
    /**
     * @dev Get current simple game details
     */
    function getCurrentSimpleGame() external view returns (
        uint8 currentCard,
        bool isActive,
        uint256 timestamp,
        uint256 score,
        uint256 wager
    ) {
        SimpleGame memory game = simpleGames[msg.sender];
        return (game.currentCard, game.isActive, game.timestamp, game.score, game.wager);
    }
    
    /**
     * @dev Get encrypted game wager
     */
    function getEncryptedWager() external view returns (euint32) {
        return games[msg.sender].wager;
    }
    
    // ===========================================
    // UTILITY FUNCTIONS
    // ===========================================
    
    /**
     * @dev Grant all permissions for user's encrypted data
     */
    function grantAllPermissions() external {
        if (hasDeposit[msg.sender]) {
            FHE.allowThis(encryptedBalances[msg.sender]);
            FHE.allow(encryptedBalances[msg.sender], msg.sender);
        }
        
        FHE.allowThis(encryptedScores[msg.sender]);
        FHE.allow(encryptedScores[msg.sender], msg.sender);
        
        FHE.allowThis(encryptedFlags[msg.sender]);
        FHE.allow(encryptedFlags[msg.sender], msg.sender);
        
        lastActivity[msg.sender] = block.timestamp;
        emit PermissionGranted(msg.sender, "all", block.timestamp);
    }
    
    /**
     * @dev Reset user's encrypted data
     */
    function resetUserData() external {
        encryptedBalances[msg.sender] = FHE.asEuint32(0);
        encryptedScores[msg.sender] = FHE.asEuint32(0);
        encryptedFlags[msg.sender] = FHE.asEbool(false);
        
        FHE.allowThis(encryptedBalances[msg.sender]);
        FHE.allow(encryptedBalances[msg.sender], msg.sender);
        FHE.allowThis(encryptedScores[msg.sender]);
        FHE.allow(encryptedScores[msg.sender], msg.sender);
        FHE.allowThis(encryptedFlags[msg.sender]);
        FHE.allow(encryptedFlags[msg.sender], msg.sender);
        
        hasDeposit[msg.sender] = false;
        lastActivity[msg.sender] = block.timestamp;
        
        emit EncryptedOperation(msg.sender, "reset", block.timestamp);
    }
}