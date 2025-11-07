import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GameService, Game, Player } from '../../services/game.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})
export class GameComponent implements OnInit, OnDestroy {
  game: Game | null = null;
  currentPlayer: Player | null = null;
  betAmount: number = 0;
  customAmount: string = '';
  showCustomInput: boolean = false;
  showHandRankings: boolean = false;
  private gameSubscription?: Subscription;
  private playerSubscription?: Subscription;

  quickBets = [10, 25, 50, 100, 250, 500];

  constructor(
    private gameService: GameService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.gameSubscription = this.gameService.currentGame$.subscribe(game => {
      this.game = game;
      if (!game) {
        this.router.navigate(['/']);
      } else if (!game.started) {
        this.router.navigate(['/lobby']);
      }
    });

    this.playerSubscription = this.gameService.currentPlayer$.subscribe(player => {
      this.currentPlayer = player;
    });
  }

  ngOnDestroy(): void {
    this.gameSubscription?.unsubscribe();
    this.playerSubscription?.unsubscribe();
  }

  selectQuickBet(amount: number): void {
    this.betAmount = amount;
    this.showCustomInput = false;
    this.customAmount = '';
  }

  toggleCustomInput(): void {
    this.showCustomInput = !this.showCustomInput;
    if (this.showCustomInput) {
      this.betAmount = 0;
    }
  }

  setCustomAmount(): void {
    const amount = parseInt(this.customAmount);
    if (!isNaN(amount) && amount > 0) {
      this.betAmount = amount;
      this.showCustomInput = false;
    }
  }

  async placeBet(): Promise<void> {
    if (this.currentPlayer && this.betAmount > 0 && this.betAmount <= this.currentPlayer.chips) {
      const amount = this.betAmount;
      console.log(`Placing bet of ${amount} chips`);
      
      try {
        await this.gameService.placeBet(this.currentPlayer.id, amount);
        this.betAmount = 0;
        this.customAmount = '';
        console.log('✓ Bet placed successfully!');
      } catch (error: any) {
        console.error('❌ Error placing bet:', error);
        const errorMsg = error?.error?.error || error?.message || 'Unknown error';
        alert(`Oops! ${errorMsg}\n\nCheck the console for details.`);
      }
    }
  }

  async callBet(): Promise<void> {
    if (!this.currentPlayer || !this.game) return;
    
    const callAmount = this.getCallAmount();
    if (callAmount > 0) {
      try {
        await this.gameService.placeBet(this.currentPlayer.id, callAmount);
        console.log(`✓ Called with ${callAmount} chips`);
      } catch (error: any) {
        console.error('❌ Error calling bet:', error);
        const errorMsg = error?.error?.error || error?.message || 'Unknown error';
        alert(`Oops! ${errorMsg}`);
      }
    }
  }

  async foldHand(): Promise<void> {
    if (!this.currentPlayer) return;
    
    if (confirm('Are you sure you want to fold? You\'ll be out of this round.')) {
      try {
        await this.gameService.fold(this.currentPlayer.id);
        console.log('✓ Folded');
      } catch (error: any) {
        console.error('❌ Error folding:', error);
      }
    }
  }

  getCallAmount(): number {
    if (!this.game || !this.currentPlayer) return 0;
    const currentBet = this.currentPlayer.currentBet || 0;
    return Math.max(0, this.game.highestBet - currentBet);
  }

  needsToCall(): boolean {
    return this.getCallAmount() > 0;
  }

  async collectPot(): Promise<void> {
    if (this.currentPlayer && this.game && this.game.pot > 0) {
      await this.gameService.collectPot(this.currentPlayer.id);
    }
  }

  async resetPot(): Promise<void> {
    if (confirm('Reset the pot to 0?')) {
      await this.gameService.resetPot();
    }
  }

  async addChips(amount: number): Promise<void> {
    if (this.currentPlayer) {
      await this.gameService.addChips(this.currentPlayer.id, amount);
    }
  }

  allIn(): void {
    if (this.currentPlayer) {
      this.betAmount = this.currentPlayer.chips;
      this.showCustomInput = false;
      this.customAmount = '';
    }
  }

  resetBet(): void {
    this.betAmount = 0;
    this.customAmount = '';
    this.showCustomInput = false;
  }

  leaveGame(): void {
    if (confirm('Are you sure you want to leave the game?')) {
      this.gameService.leaveGame();
      this.router.navigate(['/']);
    }
  }

  get otherPlayers(): Player[] {
    if (!this.game || !this.currentPlayer) return [];
    return this.game.players.filter(p => p.id !== this.currentPlayer?.id);
  }

  getChipStackVisual(): number[] {
    const pot = this.game?.pot || 0;
    let chipCount = 1; // Always show at least one chip
    
    if (pot > 0) chipCount = 1;
    if (pot >= 100) chipCount = 2;
    if (pot >= 500) chipCount = 3;
    if (pot >= 1000) chipCount = 4;
    if (pot >= 2500) chipCount = 5;
    
    return Array(chipCount).fill(0);
  }

  toggleHandRankings(): void {
    this.showHandRankings = !this.showHandRankings;
  }

  async simpleNewHand(): Promise<void> {
    if (confirm('Clear all bets and start a new round? The pot will stay as is.')) {
      await this.gameService.clearBets();
    }
  }

  getChipPercentage(player: Player): number {
    if (!this.game || !this.game.players || this.game.players.length === 0) {
      return 0;
    }
    
    // Find the maximum chips among all players
    const maxChips = Math.max(...this.game.players.map(p => p.chips));
    
    if (maxChips === 0) {
      return 0;
    }
    
    // Calculate percentage (minimum 5% for visibility)
    const percentage = (player.chips / maxChips) * 100;
    return Math.max(percentage, 5);
  }
}
