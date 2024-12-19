// 상태 관리
let activeTabId = null;
let currentUrl = null;

// 확장 프로그램 설치/업데이트
chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setOptions({ enabled: true });
});

// 아이콘 클릭
chrome.action.onClicked.addListener((tab) => {
  activeTabId = tab.id;
  currentUrl = tab.url;
  chrome.sidePanel.open({tabId: tab.id});
});

// 탭 변경 감지
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (activeTabId && tab.url !== currentUrl) {
    chrome.runtime.reload();
  }
  activeTabId = activeInfo.tabId;
  currentUrl = tab.url;
});

// URL 변경 감지
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (activeTabId === tabId && changeInfo.url && changeInfo.url !== currentUrl) {
    chrome.runtime.reload();
    currentUrl = changeInfo.url;
  }
});

// 탭 닫힘 감지
chrome.tabs.onRemoved.addListener((tabId) => {
  if (activeTabId === tabId) {
    activeTabId = null;
    currentUrl = null;
  }
});

// 현재 활성 탭 ID 가져오기
async function getCurrentTabId() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0]?.id;
}

// 메시지 리스너 설정
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleTextSelection') {
    getCurrentTabId().then(tabId => {
      if (tabId) {
        chrome.tabs.sendMessage(tabId, {
          action: 'toggleTextSelection',
          isActive: request.isActive
        }).catch(error => {
          console.log('Tab communication error:', error);
        });
      }
    });
  }
  return true;
});