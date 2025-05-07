import * as Phaser from 'phaser';

export class PhaserInputText {
  private scene: Phaser.Scene;
  private placeholder: string;
  private maxLength: number;

  private textObject: Phaser.GameObjects.Text;
  private focusRect: Phaser.GameObjects.Rectangle;
  private value: string = '';
  private isActive: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, placeholder = '', maxLength = 20) {
    this.scene = scene;
    this.placeholder = placeholder;
    this.maxLength = maxLength;

    this.textObject = scene.add.text(x, y, placeholder, {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#cccccc',
      backgroundColor: '#000000',
      padding: { x: 10, y: 6 },
      fixedWidth: 400
    }).setOrigin(0.5).setInteractive();

    const bounds = this.textObject.getBounds();
    this.focusRect = scene.add.rectangle(bounds.centerX, bounds.centerY, bounds.width + 10, bounds.height + 10)
      .setStrokeStyle(2, 0x00ff00)
      .setOrigin(0.5)
      .setVisible(false);

    this.textObject.on('pointerdown', () => {
      this.isActive = true;
      this.focusRect.setVisible(true);
      if (!this.value) {
        this.textObject.setText('');
      }
    });

    scene.input.keyboard?.on('keydown', this.handleKeyDown.bind(this));
    scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer, gameObjects: any[]) => {
      if (!gameObjects.includes(this.textObject)) {
        this.isActive = false;
        this.focusRect.setVisible(false);
        if (!this.value) {
          this.textObject.setText(this.placeholder);
        }
      }
    });
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (!this.isActive) return;

    if (event.key === 'Backspace') {
      this.value = this.value.slice(0, -1);
    } else if (event.key.length === 1 && this.value.length < this.maxLength) {
      this.value += event.key;
    } else if (event.key === 'Enter') {
      this.isActive = false;
      this.focusRect.setVisible(false);
    }

    this.textObject.setText(this.value || this.placeholder);
    this.updateFocusRect();
  }

  private updateFocusRect() {
    const bounds = this.textObject.getBounds();
    this.focusRect.setPosition(bounds.centerX, bounds.centerY);
    this.focusRect.setSize(bounds.width + 10, bounds.height + 10);
  }

  getValue(): string {
    return this.value.trim();
  }

  destroy() {
    this.textObject.destroy();
    this.focusRect.destroy();
  }
}
