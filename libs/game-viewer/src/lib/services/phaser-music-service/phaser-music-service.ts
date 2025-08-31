import { Injectable } from '@angular/core';
import * as Phaser from 'phaser';
import WebAudioSound = Phaser.Sound.WebAudioSound;
import NoAudioSound = Phaser.Sound.NoAudioSound;
import HTML5AudioSound = Phaser.Sound.HTML5AudioSound;

export enum MusicTrack {
  MainTheme = "menu_theme",
  BattleTheme = "main_battle_theme",
}

export enum SoundsTrack {
  EnemyLaser = "enemy_laser",
  PlayerLaser = "player_laser",
}

@Injectable({
  providedIn: 'root'
})
export class PhaserMusicService {
  private _scene: Phaser.Scene | null = null;

  private _menuTheme!: WebAudioSound | NoAudioSound | HTML5AudioSound;
  private _mainBattleTheme!: WebAudioSound | NoAudioSound | HTML5AudioSound;
  private _enemyLaser!: WebAudioSound | NoAudioSound | HTML5AudioSound;
  private _playerLaser!: WebAudioSound | NoAudioSound | HTML5AudioSound;

  private _currentTrack: (WebAudioSound | NoAudioSound | HTML5AudioSound) | null = null;

  public loadAll(scene: Phaser.Scene) {
    if (this._scene) {
      throw new Error("Сцена уже загружена");
    }
    this._scene = scene;

    this._scene.load.audio(MusicTrack.MainTheme, 'assets/music/menu_theme.mp3');
    this._scene.load.audio(MusicTrack.BattleTheme, 'assets/music/main_battle_theme.mp3');

    this._scene.load.audio(SoundsTrack.EnemyLaser, 'assets/sounds/enemy_laser.wav');
    this._scene.load.audio(SoundsTrack.PlayerLaser, 'assets/sounds/player_laser.wav');
  }

  public createAllMusicAndSounds() {
    if (!this._scene) {
      throw new Error("Необходимо загрузить музыку для сцены");
    }

    this._menuTheme = this._scene.sound.add(MusicTrack.MainTheme, { loop: true });
    this._mainBattleTheme = this._scene.sound.add(MusicTrack.BattleTheme, { loop: true });

    this._enemyLaser = this._scene.sound.add(SoundsTrack.EnemyLaser, { loop: false });
    this._playerLaser = this._scene.sound.add(SoundsTrack.PlayerLaser, { loop: false });
  }

  public playMusic(music: MusicTrack) {
    switch (music) {
      case MusicTrack.MainTheme:
        this._currentTrack = this._menuTheme;
        break;
      case MusicTrack.BattleTheme:
        this._currentTrack = this._mainBattleTheme;
        break;
    }
    this._currentTrack.play();
  }

  public playSound(sound: SoundsTrack) {
    switch (sound) {
      case SoundsTrack.EnemyLaser:
        this._enemyLaser.play();
        break;
      case SoundsTrack.PlayerLaser:
        this._playerLaser.play();
        break;
    }
  }
}
