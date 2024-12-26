class HighlightManager {
  constructor() {
    this.cursorButton = document.getElementById('cursorButton');
    this.selectedWordsArea = document.querySelector('.selected-words');
    
    this.initializeButtons();
    this.initializeMessageListener();
  }

  initializeButtons() {
    this.cursorButton.addEventListener('click', () => this.handleCursorClick());
  }

  initializeMessageListener() {
    chrome.runtime.onMessage.addListener((request) => {
      if (request.action === 'pageRefreshed') {
        this.resetButtons();
      }
    });
  }

  handleCursorClick() {
    this.cursorButton.classList.toggle('active');
  }

  resetButtons() {
    this.cursorButton.classList.remove('active');
  }
}

// 인스턴스 생성
const highlightManager = new HighlightManager(); 