class HighlightManager {
  constructor() {
    this.cursorButton = document.getElementById('cursorButton');
    this.termHighlightButton = document.getElementById('termHighlightButton');
    this.selectedWordsArea = document.querySelector('.selected-words');
    
    this.initializeButtons();
    this.initializeMessageListener();
  }

  initializeButtons() {
    this.cursorButton.addEventListener('click', () => this.handleCursorClick());
    this.termHighlightButton.addEventListener('click', () => this.handleTermHighlightClick());
  }

  initializeMessageListener() {
    // 페이지 새로고침 메시지 수신
    chrome.runtime.onMessage.addListener((request) => {
      if (request.action === 'pageRefreshed') {
        this.resetButtons();
      }
    });
  }

  handleCursorClick() {
    this.cursorButton.classList.toggle('active');
    this.termHighlightButton.classList.remove('active');
  }

  handleTermHighlightClick() {
    this.termHighlightButton.classList.add('active');
    this.cursorButton.classList.remove('active');
  }

  resetButtons() {
    this.cursorButton.classList.remove('active');
    this.termHighlightButton.classList.remove('active');
  }
}

// 인스턴스 생성
const highlightManager = new HighlightManager(); 