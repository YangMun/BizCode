import { TermManager } from './termManager.js';

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
}); 