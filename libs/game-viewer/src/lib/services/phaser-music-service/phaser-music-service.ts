import { Injectable } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
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
  private volume = 1.0;
  private isInit = false;

  private currentTrack: Phaser.Sound.BaseSound | null = null;

  constructor(private storage: LocalStorageService) {
    this.loadSettings();
  }

  public init(scene: Phaser.Scene) {
    if (this.isInit) {
      return;
    }
    this.isInit = true;
    this.soundManager = scene.sound;
    this.soundManager.volume = this.volume;

    // Музыка
    this.music.set(
      MusicTrack.MainTheme,
      this.soundManager.add(MusicTrack.MainTheme, { loop: true })
    );
    this.music.set(
      MusicTrack.BattleTheme,
      this.soundManager.add(MusicTrack.BattleTheme, { loop: true })
    );

    // Эффекты
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
    const newTrack = this.music.get(track);
    if (!newTrack) return;

    // Если музыка выключена, ничего не делаем
    if (this.isMusicMuted) {
      if (this.currentTrack !== newTrack) {
        this.currentTrack = newTrack;
      }
      return;
    }

    // Если текущий трек уже играет, и это тот же трек, ничего не делаем
    if (this.currentTrack === newTrack) return;

    // Останавливаем предыдущий трек
    this.stopCurrentTrack();

    // Устанавливаем новый трек и запускаем
    this.currentTrack = newTrack;
    this.currentTrack.play();
  }

  public stopCurrentTrack() {
    this.currentTrack?.stop();
  }

  public playCurrentTrack() {
    this.currentTrack?.play();
  }

  public playSound(track: SoundsTrack) {
    const sound = this.sounds.get(track);
    if (!sound || this.isSoundsMuted) return;
    
    sound.play();
  }


  public setVolume(volume: number) {
    this.volume = volume;
    if (this.soundManager) {
      this.soundManager.volume = volume;
    }
    this.saveSettings();
  }

  public toggleMusic() {
    this.isMusicMuted = !this.isMusicMuted;
    if (this.isMusicMuted) {
      this.stopCurrentTrack();
    } else {
      this.playCurrentTrack();
    }

    this.saveSettings();
  }

  public toggleSounds() {
    this.isSoundsMuted = !this.isSoundsMuted;
    this.saveSettings();
  }

  private saveSettings() {
    this.storage.store('musicMuted', this.isMusicMuted);
    this.storage.store('soundsMuted', this.isSoundsMuted);
    this.storage.store('volume', this.volume);
  }

  private loadSettings() {
    this.isMusicMuted = this.storage.retrieve('musicMuted') ?? false;
    this.isSoundsMuted = this.storage.retrieve('soundsMuted') ?? false;
    this.volume = this.storage.retrieve('volume') ?? 1.0;
  }

  public getSettings() {
    return {
      musicMuted: this.isMusicMuted,
      soundsMuted: this.isSoundsMuted,
      volume: this.volume,
    };
  }
}
