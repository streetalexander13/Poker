import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  playerName: string = '';
  gameCode: string = '';
  startingChips: number = 1000;
  isCreating: boolean = true;
  error: string = '';

  constructor(
    private gameService: GameService,
    private router: Router
  ) {}

  toggleMode(): void {
    this.isCreating = !this.isCreating;
    this.error = '';
  }

  async createGame(): Promise<void> {
    if (!this.playerName.trim()) {
      this.error = 'Please enter your name';
      return;
    }

    if (this.startingChips < 100 || this.startingChips > 100000) {
      this.error = 'Starting chips must be between 100 and 100,000';
      return;
    }

    try {
      await this.gameService.createGame(this.playerName.trim(), this.startingChips);
      this.router.navigate(['/lobby']);
    } catch (err) {
      this.error = 'Failed to create game. Please make sure the server is running.';
      console.error(err);
    }
  }

  async joinGame(): Promise<void> {
    if (!this.playerName.trim()) {
      this.error = 'Please enter your name';
      return;
    }

    if (!this.gameCode.trim()) {
      this.error = 'Please enter a game code';
      return;
    }

    try {
      const success = await this.gameService.joinGame(this.gameCode.trim().toUpperCase(), this.playerName.trim());
      
      if (success) {
        const game = this.gameService.getCurrentGame();
        if (game?.started) {
          this.router.navigate(['/game']);
        } else {
          this.router.navigate(['/lobby']);
        }
      } else {
        this.error = 'Game not found. Please check the code.';
      }
    } catch (err) {
      this.error = 'Game not found. Please check the code.';
      console.error(err);
    }
  }
}
