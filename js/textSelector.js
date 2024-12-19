class TextSelector {
  constructor() {
    this.isActive = false;
    this.selectedWords = new Set();
    this.originalListeners = new Map();
    this.currentUrl = window.location.href;
    
    // PDF 뷰어 확인
    this.isPdfViewer = document.body.classList.contains('loadingInProgress') || 
                       document.querySelector('embed[type="application/pdf"]') !== null;
    
    this.init();
    
    // 바인딩된 메서드를 인스턴스 속성으로 저장
    this.boundHandleClick = this.handleClick.bind(this);
    this.boundPreventSelection = this.preventSelection.bind(this);
    this.boundPreventLinkClick = this.preventLinkClick.bind(this);
  }

  init() {
    // 메시지 리스너 설정
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'toggleTextSelection') {
        this.toggleSelectionMode(request.isActive);
      }
    });

    // URL 변경 감지를 위한 옵저버 설정
    this.setupUrlChangeDetection();
  }

  setupUrlChangeDetection() {
    // URL 변경 감지를 위한 히스토리 API 감시
    window.addEventListener('popstate', () => this.handleUrlChange());

    // pushState와 replaceState 메소드 오버라이드
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    const self = this;

    history.pushState = function() {
      originalPushState.apply(this, arguments);
      self.handleUrlChange();
    };

    history.replaceState = function() {
      originalReplaceState.apply(this, arguments);
      self.handleUrlChange();
    };

    // URL 변경 감지를 위한 주기적 체크
    setInterval(() => {
      if (this.currentUrl !== window.location.href) {
        this.handleUrlChange();
      }
    }, 500);
  }

  handleUrlChange() {
    const newUrl = window.location.href;
    if (this.currentUrl !== newUrl) {
      this.currentUrl = newUrl;
      // URL이 변경되면 사이드패널 닫기
      chrome.runtime.sendMessage({
        action: 'closePanel'
      }).catch(error => {
        console.log('Close panel error:', error);
      });
    }
  }

  toggleSelectionMode(isActive) {
    this.isActive = isActive;
    
    if (isActive) {
      this.enableSelectionMode();
    } else {
      this.disableSelectionMode();
    }
  }

  enableSelectionMode() {
    this.isActive = true;
    this.storeAndRemoveEventListeners();
    
    document.body.style.cursor = 'pointer';
    
    // 바인딩된 메서드 사용
    document.addEventListener('click', this.boundHandleClick, true);
    document.addEventListener('selectstart', this.boundPreventSelection, true);
    document.addEventListener('click', this.boundPreventLinkClick, true);
  }

  disableSelectionMode() {
    this.isActive = false;
    this.restoreEventListeners();
    
    document.body.style.cursor = 'auto';
    
    // 바인딩된 메서드 사용
    document.removeEventListener('click', this.boundHandleClick, true);
    document.removeEventListener('selectstart', this.boundPreventSelection, true);
    document.removeEventListener('click', this.boundPreventLinkClick, true);
  }

  handleClick(e) {
    e.preventDefault();
    e.stopPropagation();

    // 예외 처리
    if (this.shouldIgnoreElement(e.target)) {
      return;
    }

    const word = this.getClickedWord(e.target, e.clientX);
    if (word) {
      // sidepanel로 선택된 단어 전송
      chrome.runtime.sendMessage({
        action: 'updateSelectedWords',
        word: word
      }).catch(error => {
        // 확장 프로그램 컨텍스트가 무효화된 경우
        if (error.message.includes('Extension context invalidated')) {
          this.disableSelectionMode();
        }
        console.log('Message sending error:', error);
      });
    }
  }

  shouldIgnoreElement(element) {
    // PDF 뷰어에서는 다른 예외 조건 적용
    if (this.isPdfViewer) {
      return (
        element.tagName === 'BUTTON' ||
        element.closest('.toolbar') !== null ||
        element.closest('#bizcode-selected-words-container')
      );
    }
    
    return (
      element.tagName === 'INPUT' ||
      element.tagName === 'TEXTAREA' ||
      element.isContentEditable ||
      element.closest('img') ||
      element.closest('#bizcode-selected-words-container')
    );
  }

  getClickedWord(element, x) {
    // PDF 뷰어인 경우 다른 방식으로 텍스트 선택
    if (this.isPdfViewer) {
      const selection = window.getSelection();
      const range = document.caretRangeFromPoint(x, element.getBoundingClientRect().top);
      
      if (!range) return null;
      
      // PDF 뷰어의 텍스트 레이어에서 단어 선택
      const textLayer = element.closest('.textLayer');
      if (textLayer) {
        const textElements = textLayer.getElementsByClassName('span');
        for (let textElement of textElements) {
          const rect = textElement.getBoundingClientRect();
          if (x >= rect.left && x <= rect.right) {
            return textElement.textContent.trim();
          }
        }
      }
      
      // 일반적인 방식으로 시도
      range.expand('word');
      const word = range.toString().trim();
      return word.length > 0 && !/^[!@#$%^&*(),.?":{}|<>]$/.test(word) ? word : null;
    } else {
      // 기존 웹페이지용 로직
      const range = document.caretRangeFromPoint(x, element.getBoundingClientRect().top);
      if (!range) return null;

      range.expand('word');
      const word = range.toString().trim();
      return word.length > 0 && !/^[!@#$%^&*(),.?":{}|<>]$/.test(word) ? word : null;
    }
  }

  storeAndRemoveEventListeners() {
    this.originalListeners = new Map();
    const elements = document.querySelectorAll('a, button, [onclick]');
    
    elements.forEach(element => {
      const clone = element.cloneNode(true);
      this.originalListeners.set(element, clone);
      element.replaceWith(clone);
    });
  }

  restoreEventListeners() {
    this.originalListeners.forEach((clone, original) => {
      if (clone.parentNode) {
        clone.parentNode.replaceChild(original, clone);
      }
    });
    this.originalListeners.clear();
  }

  preventSelection(e) {
    e.preventDefault();
  }

  preventLinkClick(e) {
    const link = e.target.closest('a');
    if (link) {
      e.preventDefault();
      e.stopPropagation();
    }
  }
}

// 인스턴스 생성
new TextSelector(); 