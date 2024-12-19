// 상태 관리
let activeTabId = null;

// 확장 프로그램 설치/업데이트
chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setOptions({ enabled: true });
});

// 아이콘 클릭
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({tabId: tab.id});
});
