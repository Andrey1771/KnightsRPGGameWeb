import * as Phaser from 'phaser';

export class UserNameInputText extends Phaser.GameObjects.Container {
  private textObj: Phaser.GameObjects.Text;
  private placeholderObj: Phaser.GameObjects.Text;
  private rect: Phaser.GameObjects.Rectangle;
  private cursorObj: Phaser.GameObjects.Text;

  private currentText = '';
  private cursorIndex = 0;
  private isFocused = false;
  private maxLength: number;
  private blinkTween!: Phaser.Tweens.Tween;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    placeholder: string,
    maxLength = 12
  ) {
    super(scene, x, y);
    this.maxLength = maxLength;

    // Фон поля
    this.rect = scene.add.rectangle(0, 0, width, height, 0x000000, 0.5);
    this.rect.setStrokeStyle(2, 0xffffff);
    this.add(this.rect);

    // Текст пользователя
    this.textObj = scene.add.text(-width / 2 + 5, -height / 2 + 5, '', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0, 0);
    this.add(this.textObj);

    // Плейсхолдер
    this.placeholderObj = scene.add.text(-width / 2 + 5, -height / 2 + 5, placeholder, {
      fontSize: '20px',
      color: '#aaaaaa',
      fontFamily: 'Arial'
    }).setOrigin(0, 0);
    this.add(this.placeholderObj);

    // Курсор
    this.cursorObj = scene.add.text(-width / 2 + 5, -height / 2 + 5, '|', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0, 0);
    this.add(this.cursorObj);

    this.cursorObj.setVisible(false);

    // Сделать поле интерактивным
    this.rect.setInteractive({ useHandCursor: true });
    this.rect.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.isFocused = true;
      this.cursorObj.setVisible(true);
      this.startCursorBlink();

      // Вычисляем позицию курсора по клику
      const clickX = pointer.x - (this.x - width / 2 + 5);
      this.cursorIndex = this.getCursorIndexFromX(clickX);
      this.updateCursorPosition();
    });

    // Снятие фокуса при клике вне поля
    scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.rect.getBounds().contains(pointer.x, pointer.y)) {
        this.isFocused = false;
        this.cursorObj.setVisible(false);
        this.stopCursorBlink();
      }
    });

    // Обработка клавиатуры
    scene.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (!this.isFocused) return;

      if (event.key === 'Backspace') {
        if (this.cursorIndex > 0) {
          this.currentText =
            this.currentText.slice(0, this.cursorIndex - 1) +
            this.currentText.slice(this.cursorIndex);
          this.cursorIndex--;
        }
      } else if (event.key === 'Delete') {
        if (this.cursorIndex < this.currentText.length) {
          this.currentText =
            this.currentText.slice(0, this.cursorIndex) +
            this.currentText.slice(this.cursorIndex + 1);
        }
      } else if (event.key === 'ArrowLeft') {
        this.cursorIndex = Math.max(0, this.cursorIndex - 1);
      } else if (event.key === 'ArrowRight') {
        this.cursorIndex = Math.min(this.currentText.length, this.cursorIndex + 1);
      } else if (event.key.length === 1 && this.currentText.length < this.maxLength) {
        this.currentText =
          this.currentText.slice(0, this.cursorIndex) +
          event.key +
          this.currentText.slice(this.cursorIndex);
        this.cursorIndex++;
      }

      this.textObj.setText(this.currentText);
      this.placeholderObj.setVisible(this.currentText.length === 0);
      this.updateCursorPosition();
    });

    scene.add.existing(this);
  }

  private startCursorBlink() {
    if (this.blinkTween) this.blinkTween.stop();
    this.blinkTween = this.scene.tweens.add({
      targets: this.cursorObj,
      alpha: 0,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
  }

  private stopCursorBlink() {
    if (this.blinkTween) this.blinkTween.stop();
    this.cursorObj.setAlpha(1);
  }

  private updateCursorPosition() {
    const textBeforeCursor = this.currentText.slice(0, this.cursorIndex);

    // Используем CanvasContext для измерения ширины
    const ctx = this.scene.game.canvas.getContext('2d');
    if (ctx) {
      ctx.font = `${this.textObj.style.fontSize} ${this.textObj.style.fontFamily}`;
      const widthBeforeCursor = ctx.measureText(textBeforeCursor).width;
      this.cursorObj.setX(this.textObj.x + widthBeforeCursor);
    }
  }

  private getCursorIndexFromX(x: number) {
    const ctx = this.scene.game.canvas.getContext('2d');
    if (!ctx) return 0;
    ctx.font = `${this.textObj.style.fontSize} ${this.textObj.style.fontFamily}`;

    let widthAcc = 0;
    for (let i = 0; i < this.currentText.length; i++) {
      const charWidth = ctx.measureText(this.currentText[i]).width;
      if (x < widthAcc + charWidth / 2) {
        return i;
      }
      widthAcc += charWidth;
    }
    return this.currentText.length;
  }

  public getValue(): string {
    return this.currentText;
  }

  public setValue(value: string) {
    this.currentText = value.slice(0, this.maxLength);
    this.cursorIndex = this.currentText.length;
    this.textObj.setText(this.currentText);
    this.placeholderObj.setVisible(this.currentText.length === 0);
    this.updateCursorPosition();
  }
}
