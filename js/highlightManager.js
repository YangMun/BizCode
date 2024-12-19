class HighlightManager {
  constructor() {
    this.cursorButton = document.getElementById('cursorButton');
    this.termHighlightButton = document.getElementById('termHighlightButton');
    this.selectedWordsArea = document.querySelector('.selected-words');
    
    this.initializeButtons();

    // 페이지 전환 시 비활성화 처리를 위한 리스너 추가
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'textSelectionDeactivated') {
        this.deactivateTextSelection();
      }
    });
  }

  initializeButtons() {
    this.cursorButton.addEventListener('click', () => this.handleCursorClick());
    this.termHighlightButton.addEventListener('click', () => this.handleTermHighlightClick());
  }

  handleCursorClick() {
    const isActive = this.cursorButton.classList.toggle('active');
    this.termHighlightButton.classList.remove('active');
    
    // background script에 메시지 전송
    chrome.runtime.sendMessage({
      action: 'toggleTextSelection',
      isActive: isActive
    }).catch(error => {
      console.log('Message sending error:', error);
      // 에러 발생 시 버튼 상태 롤백
      if (isActive) {
        this.cursorButton.classList.remove('active');
      }
    });
  }

  handleTermHighlightClick() {
    this.termHighlightButton.classList.add('active');
    this.cursorButton.classList.remove('active');
    
    // background script에 메시지 전송
    chrome.runtime.sendMessage({
      action: 'toggleTextSelection',
      isActive: false
    }).catch(error => {
      console.log('Message sending error:', error);
    });
  }

  deactivateTextSelection() {
    // 버튼 비활성화
    this.cursorButton.classList.remove('active');
    this.termHighlightButton.classList.remove('active');
    
    // 선택된 단어들 초기화 (선택사항)
    if (this.selectedWordsArea) {
      this.selectedWordsArea.innerHTML = '';
    }
  }
}

// 인스턴스 생성
const highlightManager = new HighlightManager(); 