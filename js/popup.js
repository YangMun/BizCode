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
  }

  // 버튼 클릭 이벤트 처리
  Object.entries(buttons).forEach(([key, button]) => {
    button.addEventListener('click', () => {
      hideAllAreas();
      const areaKey = key.replace('Button', 'Area');
      areas[areaKey].classList.add('active');
    });
  });

  // TermManager 초기화 및 용어 로드
  const termManager = new TermManager();

  // 초기에는 용어 정리 영역 표시 및 데이터 로드
  hideAllAreas();
  areas.cleanArea.classList.add('active');
  termManager.loadTerms(); // 초기 데이터 로드
});