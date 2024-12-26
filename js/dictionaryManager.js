import { CONFIG } from './config.js';

class DictionaryManager {
  constructor() {
    this.searchInput = document.getElementById('dictionarySearchInput');
    this.searchButton = document.getElementById('dictionarySearchButton');
    this.resultContainer = document.querySelector('.dictionary-result');
    this.placeholder = document.querySelector('.dictionary-placeholder');
    this.resultContent = document.querySelector('.dictionary-result-content');
    
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // 검색 버튼 클릭 이벤트
    this.searchButton.addEventListener('click', () => this.handleSearch());
    
    // Enter 키 입력 이벤트
    this.searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleSearch();
      }
    });
  }

  async handleSearch() {
    const searchTerm = this.searchInput.value.trim();
    if (!searchTerm) return;

    try {
      this.showLoading();
      const result = await this.searchDictionary(searchTerm);
      this.displayResult(result);
    } catch (error) {
      this.showError(error.message);
    }
  }

  async searchDictionary(query) {
    const params = new URLSearchParams({
      key: CONFIG.DICTIONARY_API_KEY,
      q: query,
      req_type: 'json',
      type1: 'word',
      pos: 1
    });

    try {
      const response = await fetch(`${CONFIG.DICTIONARY_API_URL}?${params}`);
      if (!response.ok) {
        throw new Error('API 요청에 실패했습니다.');
      }
      
      const data = await response.json();
      return this.parseApiResponse(data);
    } catch (error) {
      throw new Error('검색 중 오류가 발생했습니다.');
    }
  }

  parseApiResponse(data) {
    // API 응답 구조에 맞게 파싱
    if (!data.channel || !data.channel.item) {
      throw new Error('검색 결과가 없습니다.');
    }

    return data.channel.item.map(item => ({
      word: item.word,
      pronunciation: item.pronunciation || '',
      pos: item.pos || '',
      definition: item.sense.definition.replace(/^\d+\.\s*/, '')
    }));
  }

  displayResult(results) {
    this.placeholder.style.display = 'none';
    this.resultContent.style.display = 'block';

    const firstResult = results[0];
    this.resultContent.innerHTML = `
      <div class="word-header">
        <h3 class="word-title">${firstResult.word}</h3>
        ${firstResult.pronunciation ? `<span class="word-pronunciation">[${firstResult.pronunciation}]</span>` : ''}
      </div>
      
      <div class="word-meanings">
        ${firstResult.pos ? `<div class="word-type">${firstResult.pos}</div>` : ''}
        <ol class="meaning-list">
          ${results.map(result => `
            <li class="meaning-item">
              <span class="meaning-text">${result.definition}</span>
            </li>
          `).join('')}
        </ol>
      </div>
    `;
  }

  showLoading() {
    this.resultContent.style.display = 'none';
    this.placeholder.innerHTML = `
      <span class="material-icons loading">sync</span>
      <p>검색 중입니다...</p>
    `;
    this.placeholder.style.display = 'flex';
  }

  showError(message) {
    this.resultContent.style.display = 'none';
    this.placeholder.innerHTML = `
      <span class="material-icons">error_outline</span>
      <p>${message}</p>
    `;
    this.placeholder.style.display = 'flex';
  }
}

// 인스턴스 생성
const dictionaryManager = new DictionaryManager(); 