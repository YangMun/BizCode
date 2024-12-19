document.addEventListener('DOMContentLoaded', () => {
  const buttons = {
    cleanButton: document.getElementById('cleanButton'),
    highlightButton: document.getElementById('highlightButton'),
    noteButton: document.getElementById('noteButton')
  };

  const areas = {
    cleanArea: document.getElementById('cleanArea'),
    highlightArea: document.getElementById('highlightArea'),
    noteArea: document.getElementById('noteArea')
  };

  // 모든 영역 숨기기
  function hideAllAreas() {
    Object.values(areas).forEach(area => {
      area.classList.remove('active');
    });
    // 모든 버튼 비활성화
    Object.values(buttons).forEach(button => {
      button.classList.remove('gray');
    });
  }

  // 버튼 클릭 이벤트 처리
  Object.entries(buttons).forEach(([key, button]) => {
    button.addEventListener('click', () => {
      hideAllAreas();
      const areaKey = key.replace('Button', 'Area');
      areas[areaKey].classList.add('active');
      button.classList.add('gray');  // 클릭된 버튼 활성화
    });
  });

  // 초기 상태 설정
  hideAllAreas();
  areas.cleanArea.classList.add('active');
  buttons.cleanButton.classList.add('gray');
  
  // TermManager 초기화 및 용어 로드
  const termManager = new TermManager();
  termManager.loadTerms();

  // 선택된 단어 처리를 위한 메시지 리스너 추가
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'updateSelectedWords') {
      addSelectedWord(request.word);
    }
  });

  function addSelectedWord(word) {
    // 선택된 단어가 표시될 영역을 명확히 지정
    const selectedWordsArea = document.querySelector('#highlightArea .selected-words');
    
    // 이미 존재하는 단어인지 확인
    if (selectedWordsArea.querySelector(`[data-word="${word}"]`)) {
      return;
    }

    const wordElement = document.createElement('div');
    wordElement.className = 'selected-word';
    wordElement.dataset.word = word;
    wordElement.innerHTML = `
      ${word}
      <span class="delete-word material-icons">close</span>
    `;

    wordElement.querySelector('.delete-word').addEventListener('click', () => {
      wordElement.remove();
    });

    selectedWordsArea.appendChild(wordElement);
  }
}); 