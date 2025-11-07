import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Player {
  id: string;
  name: string;
  chips: number;
  isHost: boolean;
  currentBet: number;
  folded: boolean;
}

export interface Game {
  code: string;
  players: Player[];
  startingChips: number;
  started: boolean;
  pot: number;
  currentRound: string;
  dealerIndex: number;
  smallBlind: number;
  bigBlind: number;
  highestBet: number;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private readonly API_URL = environment.apiUrl;
  private currentGameSubject = new BehaviorSubject<Game | null>(null);
  private currentPlayerSubject = new BehaviorSubject<Player | null>(null);
  private pollingInterval: any;

  currentGame$: Observable<Game | null> = this.currentGameSubject.asObservable();
  currentPlayer$: Observable<Player | null> = this.currentPlayerSubject.asObservable();

  constructor(private http: HttpClient) {
    // Try to restore game state from localStorage
    this.restoreGameState();
  }

  // Generate a random 6-character game code
  private generateGameCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // Create a new game
  createGame(playerName: string, startingChips: number = 1000): Promise<string> {
    const code = this.generateGameCode();
    const player: Player = {
      id: this.generatePlayerId(),
      name: playerName,
      chips: startingChips,
      isHost: true,
      currentBet: 0,
      folded: false
    };

    return this.http.post<Game>(`${this.API_URL}/games`, {
      code,
      player,
      startingChips
    }).pipe(
      tap(game => {
        this.currentGameSubject.next(game);
        this.currentPlayerSubject.next(player);
        this.saveToLocalStorage(game, player);
        this.startPolling(code);
      })
    ).toPromise().then(() => code);
  }

  // Join an existing game
  joinGame(code: string, playerName: string): Promise<boolean> {
    // First check if game exists
    return this.http.get<Game>(`${this.API_URL}/games/${code}`)
      .pipe(
        catchError(() => {
          return Promise.reject(false);
        })
      )
      .toPromise()
      .then(game => {
        if (!game) return false;

        // Check if player already exists
        let player = game.players.find(p => p.name === playerName);
        
        if (!player) {
          player = {
            id: this.generatePlayerId(),
            name: playerName,
            chips: game.startingChips,
            isHost: false,
            currentBet: 0,
            folded: false
          };
        }

        return this.http.post<Game>(`${this.API_URL}/games/${code}/join`, { player })
          .pipe(
            tap(updatedGame => {
              this.currentGameSubject.next(updatedGame);
              this.currentPlayerSubject.next(player!);
              this.saveToLocalStorage(updatedGame, player!);
              this.startPolling(code);
            })
          )
          .toPromise()
          .then(() => true);
      })
      .catch(() => false);
  }

  // Start the game
  startGame(): Promise<void> {
    const game = this.currentGameSubject.value;
    if (!game) return Promise.resolve();

    return this.http.post<Game>(`${this.API_URL}/games/${game.code}/start`, {})
      .pipe(
        tap(updatedGame => {
          this.currentGameSubject.next(updatedGame);
          this.saveToLocalStorage(updatedGame, this.currentPlayerSubject.value!);
        })
      )
      .toPromise()
      .then(() => {});
  }

  // Update player chips
  updateChips(playerId: string, newChipCount: number): Promise<void> {
    const game = this.currentGameSubject.value;
    if (!game) return Promise.resolve();

    return this.http.put<Game>(
      `${this.API_URL}/games/${game.code}/players/${playerId}`,
      { chips: Math.max(0, newChipCount) }
    ).pipe(
      tap(updatedGame => {
        this.currentGameSubject.next(updatedGame);
        
        // Update current player if it's them
        const currentPlayer = this.currentPlayerSubject.value;
        if (currentPlayer && currentPlayer.id === playerId) {
          const updatedPlayer = updatedGame.players.find(p => p.id === playerId);
          if (updatedPlayer) {
            this.currentPlayerSubject.next(updatedPlayer);
          }
        }
        
        this.saveToLocalStorage(updatedGame, this.currentPlayerSubject.value!);
      })
    ).toPromise().then(() => {});
  }

  // Add chips (for betting/winning)
  addChips(playerId: string, amount: number): Promise<void> {
    const game = this.currentGameSubject.value;
    if (!game) return Promise.resolve();

    const player = game.players.find(p => p.id === playerId);
    if (player) {
      return this.updateChips(playerId, player.chips + amount);
    }
    return Promise.resolve();
  }

  // Remove chips (for betting/losing)
  removeChips(playerId: string, amount: number): Promise<void> {
    const game = this.currentGameSubject.value;
    if (!game) return Promise.resolve();

    const player = game.players.find(p => p.id === playerId);
    if (player) {
      return this.updateChips(playerId, player.chips - amount);
    }
    return Promise.resolve();
  }

  // Leave game
  leaveGame(): void {
    const game = this.currentGameSubject.value;
    const player = this.currentPlayerSubject.value;

    if (game && player) {
      this.http.delete(`${this.API_URL}/games/${game.code}/players/${player.id}`)
        .subscribe();
    }

    this.stopPolling();
    this.currentGameSubject.next(null);
    this.currentPlayerSubject.next(null);
    localStorage.removeItem('currentGame');
    localStorage.removeItem('currentPlayer');
  }

  // Get current game
  getCurrentGame(): Game | null {
    return this.currentGameSubject.value;
  }

  // Get current player
  getCurrentPlayer(): Player | null {
    return this.currentPlayerSubject.value;
  }

  // Add to pot
  addToPot(amount: number): Promise<void> {
    const game = this.currentGameSubject.value;
    if (!game) {
      console.error('No game found');
      return Promise.reject('No game found');
    }

    console.log(`Adding ${amount} to pot in game ${game.code}`);
    
    return new Promise((resolve, reject) => {
      this.http.post<Game>(`${this.API_URL}/games/${game.code}/pot/add`, { amount })
        .subscribe({
          next: (updatedGame) => {
            console.log('Pot updated successfully:', updatedGame.pot);
            this.currentGameSubject.next(updatedGame);
            this.saveToLocalStorage(updatedGame, this.currentPlayerSubject.value!);
            resolve();
          },
          error: (error) => {
            console.error('Error adding to pot:', error);
            reject(error);
          }
        });
    });
  }

  // Collect from pot (winner takes pot)
  collectPot(playerId: string): Promise<void> {
    const game = this.currentGameSubject.value;
    if (!game) return Promise.resolve();

    const potAmount = game.pot;
    
    // First add pot to winner's chips
    return this.updateChips(playerId, 
      game.players.find(p => p.id === playerId)!.chips + potAmount
    ).then(() => {
      // Then reset the pot
      return this.http.post<Game>(`${this.API_URL}/games/${game.code}/pot/reset`, {})
        .pipe(
          tap(updatedGame => {
            this.currentGameSubject.next(updatedGame);
            this.saveToLocalStorage(updatedGame, this.currentPlayerSubject.value!);
          })
        )
        .toPromise()
        .then(() => {});
    });
  }

  // Reset pot
  resetPot(): Promise<void> {
    const game = this.currentGameSubject.value;
    if (!game) return Promise.resolve();

    return this.http.post<Game>(`${this.API_URL}/games/${game.code}/pot/reset`, {})
      .pipe(
        tap(updatedGame => {
          this.currentGameSubject.next(updatedGame);
          this.saveToLocalStorage(updatedGame, this.currentPlayerSubject.value!);
        })
      )
      .toPromise()
      .then(() => {});
  }

  // Change round
  changeRound(round: string): Promise<void> {
    const game = this.currentGameSubject.value;
    if (!game) return Promise.resolve();

    return this.http.put<Game>(`${this.API_URL}/games/${game.code}/round`, { round })
      .pipe(
        tap(updatedGame => {
          this.currentGameSubject.next(updatedGame);
          this.saveToLocalStorage(updatedGame, this.currentPlayerSubject.value!);
        })
      )
      .toPromise()
      .then(() => {});
  }

  // Next dealer
  nextDealer(): Promise<void> {
    const game = this.currentGameSubject.value;
    if (!game) return Promise.resolve();

    return this.http.post<Game>(`${this.API_URL}/games/${game.code}/next-dealer`, {})
      .pipe(
        tap(updatedGame => {
          this.currentGameSubject.next(updatedGame);
          this.saveToLocalStorage(updatedGame, this.currentPlayerSubject.value!);
        })
      )
      .toPromise()
      .then(() => {});
  }

  // Post blinds
  postBlinds(): Promise<void> {
    const game = this.currentGameSubject.value;
    if (!game) return Promise.resolve();

    return this.http.post<Game>(`${this.API_URL}/games/${game.code}/post-blinds`, {})
      .pipe(
        tap(updatedGame => {
          this.currentGameSubject.next(updatedGame);
          this.saveToLocalStorage(updatedGame, this.currentPlayerSubject.value!);
        })
      )
      .toPromise()
      .then(() => {});
  }

  // Place a bet (tracks current bet and highest bet)
  placeBet(playerId: string, amount: number): Promise<void> {
    const game = this.currentGameSubject.value;
    if (!game) return Promise.reject('No game found');

    console.log(`Placing bet of ${amount} for player ${playerId}`);

    return new Promise((resolve, reject) => {
      this.http.post<Game>(`${this.API_URL}/games/${game.code}/place-bet`, { playerId, amount })
        .subscribe({
          next: (updatedGame) => {
            console.log('Bet placed successfully');
            this.currentGameSubject.next(updatedGame);
            
            // Update current player if it's them
            const currentPlayer = this.currentPlayerSubject.value;
            if (currentPlayer && currentPlayer.id === playerId) {
              const updatedPlayer = updatedGame.players.find(p => p.id === playerId);
              if (updatedPlayer) {
                this.currentPlayerSubject.next(updatedPlayer);
              }
            }
            
            this.saveToLocalStorage(updatedGame, this.currentPlayerSubject.value!);
            resolve();
          },
          error: (error) => {
            console.error('Error placing bet:', error);
            reject(error);
          }
        });
    });
  }

  // Fold
  fold(playerId: string): Promise<void> {
    const game = this.currentGameSubject.value;
    if (!game) return Promise.resolve();

    return this.http.post<Game>(`${this.API_URL}/games/${game.code}/fold`, { playerId })
      .pipe(
        tap(updatedGame => {
          this.currentGameSubject.next(updatedGame);
          
          // Update current player if it's them
          const currentPlayer = this.currentPlayerSubject.value;
          if (currentPlayer && currentPlayer.id === playerId) {
            const updatedPlayer = updatedGame.players.find(p => p.id === playerId);
            if (updatedPlayer) {
              this.currentPlayerSubject.next(updatedPlayer);
            }
          }
          
          this.saveToLocalStorage(updatedGame, this.currentPlayerSubject.value!);
        })
      )
      .toPromise()
      .then(() => {});
  }

  // Clear all bets (start new betting round)
  clearBets(): Promise<void> {
    const game = this.currentGameSubject.value;
    if (!game) return Promise.resolve();

    return this.http.post<Game>(`${this.API_URL}/games/${game.code}/clear-bets`, {})
      .pipe(
        tap(updatedGame => {
          this.currentGameSubject.next(updatedGame);
          this.saveToLocalStorage(updatedGame, this.currentPlayerSubject.value!);
        })
      )
      .toPromise()
      .then(() => {});
  }

  // Start polling for game updates
  private startPolling(code: string): void {
    this.stopPolling(); // Clear any existing polling
    
    this.pollingInterval = setInterval(() => {
      this.http.get<Game>(`${this.API_URL}/games/${code}`)
        .subscribe(
          game => {
            const currentPlayer = this.currentPlayerSubject.value;
            this.currentGameSubject.next(game);
            
            // Update current player with latest data
            if (currentPlayer) {
              const updatedPlayer = game.players.find(p => p.id === currentPlayer.id);
              if (updatedPlayer) {
                this.currentPlayerSubject.next(updatedPlayer);
              }
            }
            
            this.saveToLocalStorage(game, this.currentPlayerSubject.value!);
          },
          error => {
            console.error('Error polling game:', error);
          }
        );
    }, 2000); // Poll every 2 seconds
  }

  // Stop polling
  private stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  // Private helper methods
  private generatePlayerId(): string {
    return 'player_' + Math.random().toString(36).substr(2, 9);
  }

  private saveToLocalStorage(game: Game, player: Player): void {
    localStorage.setItem('currentGame', JSON.stringify(game));
    localStorage.setItem('currentPlayer', JSON.stringify(player));
  }

  private restoreGameState(): void {
    const gameJson = localStorage.getItem('currentGame');
    const playerJson = localStorage.getItem('currentPlayer');
    
    if (gameJson && playerJson) {
      const game = JSON.parse(gameJson);
      const player = JSON.parse(playerJson);
      
      // Verify the game still exists on the server
      this.http.get<Game>(`${this.API_URL}/games/${game.code}`)
        .subscribe(
          serverGame => {
            this.currentGameSubject.next(serverGame);
            this.currentPlayerSubject.next(player);
            this.startPolling(game.code);
          },
          error => {
            // Game doesn't exist anymore, clear local storage
            localStorage.removeItem('currentGame');
            localStorage.removeItem('currentPlayer');
          }
        );
    }
  }
}
