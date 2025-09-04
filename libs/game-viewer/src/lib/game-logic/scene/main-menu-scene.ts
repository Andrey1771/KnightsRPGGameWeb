import { MusicTrack, PhaserMusicService } from '../../services/phaser-music-service/phaser-music-service';
import { generateFunnyNick } from '../../utils/nick-generator';

const targetWidth = 640;
const targetHeight = 960;

export class MainMenuScene extends Phaser.Scene {
  private _phaserMusicService!: PhaserMusicService;
  private playerNameInput!: any; // rexUI InputText

  constructor(phaserMusicService: PhaserMusicService) {
    super({ key: 'MainMenuScene' });
    this._phaserMusicService = phaserMusicService;
  }

  create() {
    this._phaserMusicService.init(this);
    this._phaserMusicService.playMusic(MusicTrack.MainTheme);

    const { width, height } = this.scale;
    const canvas = this.sys.game.canvas;

    // Фон
    this.add.image(canvas.width / 2, canvas.height / 2, 'menuBg')
      .setDisplaySize(canvas.width, canvas.height)
      .setScrollFactor(0)
      .setDepth(-1);

    // Заголовок
    this.add.text(width / 2, height * 0.15, 'Knights Game', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Ник + кнопка генерации (слева сверху)
    this.playerNameInput = this.rexUI.add.inputText({
      x: 20,
      y: 40,
      width: 250,
      height: 40,
      type: 'text',
      text: '',
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      placeholder: 'Введите имя игрока',
      maxLength: 20,
      selectAll: false,
    }).setOrigin(0, 0.5);

    const generateButton = this.add.text(290, 40, '🎲', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0, 0.5).setInteractive();

    generateButton.on('pointerover', () => generateButton.setStyle({ backgroundColor: '#333333' }));
    generateButton.on('pointerout', () => generateButton.setStyle({ backgroundColor: '#000000' }));
    generateButton.on('pointerdown', () => {
      const funnyNick = generateFunnyNick();
      this.playerNameInput.text = funnyNick;
    });

    // Кнопки меню (по центру, вертикально)
    const buttonSpacing = 80; // расстояние между кнопками
    const startY = height * 0.4; // первая кнопка чуть ниже центра
    const centerX = width / 2;

    this.createButton(centerX, startY, 'Начать игру', () => {
      const playerName = this.playerNameInput.text || 'Игрок';
      console.log('Игрок:', playerName);
      this.scene.start('main', { playerName });
    });

    this.createButton(centerX, startY + buttonSpacing, 'Создать игру', () =>
      this.scene.start('CreateLobbyScene')
    );
    this.createButton(centerX, startY + buttonSpacing * 2, 'Присоединиться', () =>
      this.scene.start('JoinLobbyScene')
    );
    this.createButton(centerX, startY + buttonSpacing * 3, 'Настройки', () =>
      this.scene.start('SettingsScene')
    );
  }

  createButton(x: number, y: number, text: string, callback: () => void) {
    const button = this.add.text(x, y, text, {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();

    button.on('pointerover', () => button.setStyle({ backgroundColor: '#333333' }));
    button.on('pointerout', () => button.setStyle({ backgroundColor: '#000000' }));
    button.on('pointerdown', callback);

    return button;
  }
}
