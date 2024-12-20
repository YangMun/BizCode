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
  activeTabId = activeInfo.tabId;
  
  // URL이 변경되었다면 사이드패널 비활성화
  if (currentUrl && currentUrl !== tab.url) {
    chrome.sidePanel.setOptions({ enabled: false });
    // 다시 활성화
    setTimeout(() => {
      chrome.sidePanel.setOptions({ enabled: true });
    }, 100);
  }
  currentUrl = tab.url;
});

// URL 변경 감지
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (activeTabId === tabId) {
    // 페이지 새로고침 감지
    if (changeInfo.status === 'loading') {
      // 사이드패널에 메시지 전송
      chrome.runtime.sendMessage({ action: 'pageRefreshed' });
    }
    
    // URL 변경 감지
    if (changeInfo.url) {
      if (currentUrl && currentUrl !== changeInfo.url) {
        chrome.sidePanel.setOptions({ enabled: false });
        setTimeout(() => {
          chrome.sidePanel.setOptions({ enabled: true });
        }, 100);
      }
      currentUrl = changeInfo.url;
    }
  }
});

// 탭 닫힘 감지
chrome.tabs.onRemoved.addListener((tabId) => {
  if (activeTabId === tabId) {
    activeTabId = null;
    currentUrl = null;
    chrome.sidePanel.setOptions({ enabled: false });
    // 다시 활성화
    setTimeout(() => {
      chrome.sidePanel.setOptions({ enabled: true });
    }, 100);
  }
});