import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GameService, Game, Player } from '../../services/game.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lobby.component.html',
  styleUrl: './lobby.component.css'
})
export class LobbyComponent implements OnInit, OnDestroy {
  game: Game | null = null;
  currentPlayer: Player | null = null;
  copied: boolean = false;
  private gameSubscription?: Subscription;
  private playerSubscription?: Subscription;

  constructor(
    private gameService: GameService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.gameSubscription = this.gameService.currentGame$.subscribe(game => {
      this.game = game;
      if (!game) {
        this.router.navigate(['/']);
      } else if (game.started) {
        this.router.navigate(['/game']);
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

  get isHost(): boolean {
    return this.currentPlayer?.isHost || false;
  }

  copyGameCode(): void {
    if (this.game) {
      navigator.clipboard.writeText(this.game.code).then(() => {
        this.copied = true;
        setTimeout(() => this.copied = false, 2000);
      });
    }
  }

  shareGame(): void {
    if (this.game && navigator.share) {
      navigator.share({
        title: 'Join my Poker Game',
        text: `Join my poker game with code: ${this.game.code}`,
      }).catch(() => {
        // Fallback to copy if share fails
        this.copyGameCode();
      });
    } else {
      this.copyGameCode();
    }
  }

  async startGame(): Promise<void> {
    if (this.isHost && this.game && this.game.players.length >= 2) {
      await this.gameService.startGame();
      this.router.navigate(['/game']);
    }
  }

  leaveGame(): void {
    if (confirm('Are you sure you want to leave the game?')) {
      this.gameService.leaveGame();
      this.router.navigate(['/']);
    }
  }
}
