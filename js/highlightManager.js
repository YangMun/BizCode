class HighlightManager {
  constructor() {
    this.cursorButton = document.getElementById('cursorButton');
    this.termHighlightButton = document.getElementById('termHighlightButton');
    this.selectedWordsArea = document.querySelector('.selected-words');
    
    this.initializeButtons();
  }

  initializeButtons() {
    this.cursorButton.addEventListener('click', () => this.handleCursorClick());
    this.termHighlightButton.addEventListener('click', () => this.handleTermHighlightClick());
  }

  handleCursorClick() {
    const isActive = this.cursorButton.classList.toggle('active');
    this.termHighlightButton.classList.remove('active');
  }

  handleTermHighlightClick() {
    this.termHighlightButton.classList.add('active');
    this.cursorButton.classList.remove('active');
  }
}

const highlightManager = new HighlightManager(); 