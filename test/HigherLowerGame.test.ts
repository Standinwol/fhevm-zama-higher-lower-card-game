import { expect } from "chai";
import { ethers } from "hardhat";
import { HigherLowerGame } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("HigherLowerGame", function () {
  let higherLowerGame: HigherLowerGame;
  let owner: SignerWithAddress;
  let player1: SignerWithAddress;
  let player2: SignerWithAddress;

  // Mock Chainlink VRF values for testing
  const VRF_COORDINATOR = "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625";
  const SUBSCRIPTION_ID = 123;
  const KEY_HASH = "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c";

  beforeEach(async function () {
    [owner, player1, player2] = await ethers.getSigners();

    const HigherLowerGameFactory = await ethers.getContractFactory("HigherLowerGame");
    higherLowerGame = await HigherLowerGameFactory.deploy(
      VRF_COORDINATOR,
      SUBSCRIPTION_ID,
      KEY_HASH
    );
    await higherLowerGame.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(await higherLowerGame.getAddress()).to.be.properAddress;
    });

    it("Should set the correct owner", async function () {
      // We can test this by trying owner-only functions
      await expect(higherLowerGame.connect(player1).withdrawHouseEdge())
        .to.be.revertedWithCustomError(higherLowerGame, "OnlyOwner");
    });
  });

  describe("Deposits and Withdrawals", function () {
    it("Should allow players to deposit ETH", async function () {
      const depositAmount = ethers.parseEther("1.0");
      
      await expect(higherLowerGame.connect(player1).deposit({ value: depositAmount }))
        .to.emit(higherLowerGame, "Deposit")
        .withArgs(player1.address, depositAmount);

      expect(await higherLowerGame.getBalance(player1.address)).to.equal(depositAmount);
    });

    it("Should allow players to withdraw ETH", async function () {
      const depositAmount = ethers.parseEther("1.0");
      const withdrawAmount = ethers.parseEther("0.5");

      // First deposit
      await higherLowerGame.connect(player1).deposit({ value: depositAmount });

      // Then withdraw
      await expect(higherLowerGame.connect(player1).withdraw(withdrawAmount))
        .to.emit(higherLowerGame, "Withdrawal")
        .withArgs(player1.address, withdrawAmount);

      expect(await higherLowerGame.getBalance(player1.address)).to.equal(
        depositAmount - withdrawAmount
      );
    });

    it("Should revert if withdrawal amount exceeds balance", async function () {
      const withdrawAmount = ethers.parseEther("1.0");

      await expect(higherLowerGame.connect(player1).withdraw(withdrawAmount))
        .to.be.revertedWithCustomError(higherLowerGame, "InsufficientBalance");
    });

    it("Should accept ETH through receive function", async function () {
      const sendAmount = ethers.parseEther("0.5");

      await expect(
        player1.sendTransaction({
          to: await higherLowerGame.getAddress(),
          value: sendAmount,
        })
      )
        .to.emit(higherLowerGame, "Deposit")
        .withArgs(player1.address, sendAmount);

      expect(await higherLowerGame.getBalance(player1.address)).to.equal(sendAmount);
    });
  });

  describe("Game Logic", function () {
    beforeEach(async function () {
      // Deposit some ETH for testing
      await higherLowerGame.connect(player1).deposit({ value: ethers.parseEther("10.0") });
    });

    it("Should start a new game", async function () {
      const wager = ethers.parseEther("1.0");
      const initialBalance = await higherLowerGame.getBalance(player1.address);

      const tx = await higherLowerGame.connect(player1).startGame(wager);
      const receipt = await tx.wait();

      // Check that wager was deducted from balance
      expect(await higherLowerGame.getBalance(player1.address)).to.equal(
        initialBalance - wager
      );

      // Check that RandomnessRequested event was emitted
      const events = receipt?.logs;
      const randomnessEvent = events?.find(
        (event: any) => event.topics[0] === ethers.id("RandomnessRequested(uint256,uint256)")
      );
      expect(randomnessEvent).to.not.be.undefined;
    });

    it("Should revert if wager is zero", async function () {
      await expect(higherLowerGame.connect(player1).startGame(0))
        .to.be.revertedWithCustomError(higherLowerGame, "InvalidWager");
    });

    it("Should revert if insufficient balance for wager", async function () {
      const wager = ethers.parseEther("20.0"); // More than deposited

      await expect(higherLowerGame.connect(player1).startGame(wager))
        .to.be.revertedWithCustomError(higherLowerGame, "InsufficientBalance");
    });

    it("Should calculate payout correctly", async function () {
      const wager = ethers.parseEther("1.0");
      
      // Test various scores
      expect(await higherLowerGame.calculatePotentialPayout(wager, 0)).to.equal(0);
      expect(await higherLowerGame.calculatePotentialPayout(wager, 1)).to.equal(
        ethers.parseEther("1.425") // 1.0 * 1.5 * 0.95
      );
      expect(await higherLowerGame.calculatePotentialPayout(wager, 2)).to.equal(
        ethers.parseEther("2.1375") // 1.0 * 1.5^2 * 0.95
      );
    });
  });

  describe("Leaderboard", function () {
    it("Should return empty leaderboard initially", async function () {
      const [players, scores] = await higherLowerGame.getLeaderboard();
      expect(players).to.have.length(0);
      expect(scores).to.have.length(0);
    });

    // Note: Testing leaderboard updates would require mocking VRF responses
    // which is complex in unit tests. Integration tests would be better for this.
  });

  describe("View Functions", function () {
    it("Should return correct game information", async function () {
      // Deposit and start a game
      await higherLowerGame.connect(player1).deposit({ value: ethers.parseEther("5.0") });
      const wager = ethers.parseEther("1.0");
      await higherLowerGame.connect(player1).startGame(wager);

      const [player, gameWager, currentCard, score, isActive] = await higherLowerGame.getGame(0);
      
      expect(player).to.equal(player1.address);
      expect(gameWager).to.equal(wager);
      expect(currentCard).to.equal(0); // Card not set until VRF response
      expect(score).to.equal(0);
      expect(isActive).to.be.true;
    });

    it("Should return correct player balance", async function () {
      const depositAmount = ethers.parseEther("2.5");
      await higherLowerGame.connect(player1).deposit({ value: depositAmount });
      
      expect(await higherLowerGame.getBalance(player1.address)).to.equal(depositAmount);
    });
  });

  describe("Owner Functions", function () {
    it("Should allow owner to withdraw house edge", async function () {
      // This function is complex to test without actual game play
      // Just test that it doesn't revert for owner
      await expect(higherLowerGame.connect(owner).withdrawHouseEdge()).to.not.be.reverted;
    });

    it("Should revert if non-owner tries to withdraw house edge", async function () {
      await expect(higherLowerGame.connect(player1).withdrawHouseEdge())
        .to.be.revertedWithCustomError(higherLowerGame, "OnlyOwner");
    });
  });
});