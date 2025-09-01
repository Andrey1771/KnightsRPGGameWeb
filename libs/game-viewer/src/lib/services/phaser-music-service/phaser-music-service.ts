import { Injectable } from '@angular/core';
import * as Phaser from 'phaser';

export enum MusicTrack {
  MainTheme = "menu_theme",
  BattleTheme = "main_battle_theme",
}

export enum SoundsTrack {
  EnemyLaser = "enemy_laser",
  PlayerLaser = "player_laser",
  EnemyShipExplosion = "enemy_ship_explosion",
  PlayerShipExplosion = "player_ship_explosion",
}

@Injectable({
  providedIn: 'root'
})
export class PhaserMusicService {
  private soundManager!: Phaser.Sound.BaseSoundManager;

  private music: Map<MusicTrack, Phaser.Sound.BaseSound> = new Map();
  private sounds: Map<SoundsTrack, Phaser.Sound.BaseSound> = new Map();
  private isSoundsMuted = false;
  private isMusicMuted = false;

  private currentTrack: Phaser.Sound.BaseSound | null = null;

  public init(scene: Phaser.Scene) {
    this.soundManager = scene.sound;

    // Создаём музыку
    this.music.set(
      MusicTrack.MainTheme,
      this.soundManager.add(MusicTrack.MainTheme, { loop: true })
    );
    this.music.set(
      MusicTrack.BattleTheme,
      this.soundManager.add(MusicTrack.BattleTheme, { loop: true })
    );

    // Создаём эффекты
    this.sounds.set(
      SoundsTrack.EnemyLaser,
      this.soundManager.add(SoundsTrack.EnemyLaser)
    );
    this.sounds.set(
      SoundsTrack.PlayerLaser,
      this.soundManager.add(SoundsTrack.PlayerLaser)
    );
    this.sounds.set(
      SoundsTrack.EnemyShipExplosion,
      this.soundManager.add(SoundsTrack.EnemyShipExplosion)
    );
    this.sounds.set(
      SoundsTrack.PlayerShipExplosion,
      this.soundManager.add(SoundsTrack.PlayerShipExplosion)
    );
  }

  public playMusic(track: MusicTrack) {
    if (this.isMusicMuted) {
      return;
    }

    this.stopCurrentTrack();

    this.currentTrack = this.music.get(track) || null;
    this.currentTrack?.play();
  }

  public stopCurrentTrack() {
    this.currentTrack?.stop();
    this.currentTrack = null;
  }

  public playSound(track: SoundsTrack) {
    if (this.isSoundsMuted) {
      return;
    }
    this.sounds.get(track)?.play();
  }

  /**
   * Установить громкость (0.0 – 1.0)
   */
  public setVolume(volume: number) {
    this.soundManager.volume = volume;
  }

  public toggleMusic(enabled: boolean) {
    this.isMusicMuted = !enabled;
    this.stopCurrentTrack();
  }

  public toggleSounds(enabled: boolean) {
    this.isSoundsMuted = !enabled;
  }
}
