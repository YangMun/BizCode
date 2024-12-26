// PDF.js를 ES 모듈로 import
import * as pdfjsLib from '../lib/pdf.mjs';

class FileManager {
  constructor() {
    this.fileInput = document.getElementById('fileInput');
    this.fileInfo = document.querySelector('.file-info');
    this.selectedWords = document.querySelector('.selected-words');
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.words = [];
    this.terms = []; // terms.json의 데이터를 저장할 배열
    this.searchInput = null;
    this.filteredWords = [];
    
    // PDF.js 워커 설정
    pdfjsLib.GlobalWorkerOptions.workerSrc = '../lib/pdf.worker.mjs';
    
    this.loadTerms(); // terms.json 파일 로드
    this.initializeFileUpload();
    this.initializeSearchBar();
  }

  // terms.json 파일 로드
  async loadTerms() {
    try {
      const response = await fetch('data/terms.json');
      const data = await response.json();
      this.terms = data.terms;
    } catch (error) {
      console.error('용어 데이터 로드 실패:', error);
    }
  }

  // 단어가 terms.json에 있는지 확인하는 함수
  isTermMatch(word) {
    return this.terms.some(term => {
      const termWords = term.term.split(/[\/()]/); // 슬래시, 괄호로 구분된 단어들 리
      return termWords.some(termWord => {
        // 한글 단어 비교
        if (/[가-힣]/.test(word)) {
          return termWord.trim() === word;
        }
        // 영어 단어 비교 (대소문자 무시)
        return termWord.trim().toLowerCase() === word.toLowerCase();
      });
    });
  }

  initializeFileUpload() {
    this.fileInput.addEventListener('change', async (event) => {
      const file = event.target.files[0];
      if (file) {
        this.displayFileName(file);
        await this.readFileContent(file);
      }
    });
  }

  displayFileName(file) {
    const iconMap = {
      'txt': 'description',
      'doc': 'description',
      'docx': 'description',
      'pdf': 'picture_as_pdf'
    };
    
    const extension = file.name.split('.').pop().toLowerCase();
    const icon = iconMap[extension] || 'insert_drive_file';
    
    this.fileInfo.innerHTML = `
      <span class="material-icons">${icon}</span>
      <span>${file.name}</span>
    `;
  }

  async readFileContent(file) {
    try {
      const content = await this.getFileContent(file);
      this.displayContent(content);
    } catch (error) {
      console.error('파일 읽기 오류:', error);
      this.selectedWords.innerHTML = `
        <div class="error-message">
          <span class="material-icons">error</span>
          파일을 읽는 중 오류가 발생했습니다.
        </div>
      `;
    }
  }

  async getFileContent(file) {
    if (file.type === 'application/pdf') {
      return await this.readPdfContent(file);
    } else {
      return await this.readTextContent(file);
    }
  }

  readTextContent(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  }

  async readPdfContent(file) {
    try {
      const arrayBuffer = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsArrayBuffer(file);
      });

      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        let lastItem = null;
        let currentWord = '';
        
        for (const item of textContent.items) {
          // 현재 아이템의 위치와 크기 정보
          const itemX = item.transform[4];
          const itemY = item.transform[5];
          const itemWidth = item.width;
          
          if (lastItem) {
            const lastX = lastItem.transform[4];
            const lastY = lastItem.transform[5];
            const lastWidth = lastItem.width;
            
            // 같은 줄에 있는지 확인 (Y좌표 차이가 작은 경우)
            const isSameLine = Math.abs(itemY - lastY) < 2;
            
            // 글자 간격 계산
            const charSpacing = itemX - (lastX + lastWidth);
            
            if (isSameLine && charSpacing < 5) {
              // 같은 줄이고 글자 간격이 좁으면 이어붙임
              currentWord += item.str;
            } else {
              // 새로운 단어 시작
              if (currentWord) {
                fullText += currentWord + ' ';
                currentWord = '';
              }
              currentWord = item.str;
            }
          } else {
            currentWord = item.str;
          }
          
          lastItem = item;
        }
        
        // 마지막 단어 처리
        if (currentWord) {
          fullText += currentWord + '\n';
        }
      }

      // 후처리: 불필요한 공백 제거 및 한글 단어 결합
      return fullText
        .replace(/\s+/g, ' ')
        .trim()
        .split(' ')
        .map(word => word.trim())
        .filter(word => word.length > 0)
        .join('\n');

    } catch (error) {
      throw new Error('PDF 파일 읽기 실패: ' + error.message);
    }
  }

  displayContent(content) {
    // 기존 단어 추출 로직은 유지
    const extractedWords = content
      .split(/\n/)
      .map(word => word.trim())
      .map(word => {
        const bracketMatch = word.match(/([가-힣0-9a-zA-Z&]+)\(([가-힣0-9a-zA-Z&]+)\)/);
        if (bracketMatch) {
          return [bracketMatch[1], bracketMatch[2]];
        }
        const acronymMatch = word.match(/[A-Z](&[A-Z])+/);
        if (acronymMatch) {
          return [acronymMatch[0]];
        }
        const wordMatch = word.match(/[가-힣0-9a-zA-Z]+|[A-Z](&[A-Z])+/g);
        return wordMatch ? wordMatch : [];
      })
      .flat()
      .filter(word => {
        const hasOnlyJamo = /^[\u1100-\u11FF\u3130-\u318F]+$/g.test(word);
        if (word.length === 1) {
          return /^[가-힣]$/g.test(word);
        }
        if (word.includes('&')) {
          return /^[A-Z](&[A-Z])+$/.test(word);
        }
        return word.length > 0 && !hasOnlyJamo;
      });

    // terms.json에 있는 단어만 필터링하고 중복 제거
    this.words = [...new Set(
      extractedWords.filter(word => this.isTermMatch(word))
    )];
    
    this.filteredWords = this.words; // 초기 필터링된 단어 목록 설정
    this.renderPage();
    this.renderPagination();
  }

  renderPage() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const pageWords = this.filteredWords.slice(startIndex, endIndex);
    
    this.selectedWords.innerHTML = pageWords.map(word => {
      const termData = this.terms.find(term => {
        const termWords = term.term.split(/[\/()]/);
        return termWords.some(termWord => 
          termWord.trim().toLowerCase() === word.toLowerCase()
        );
      });

      return `
        <div class="selected-word">
          <div class="term-header">${word}</div>
          <div class="term-description">${termData ? termData.description : '설명이 없습니다.'}</div>
        </div>
      `;
    }).join('');
  }

  renderPagination() {
    const totalPages = Math.ceil(this.filteredWords.length / this.itemsPerPage);
    
    // 페재 페이지가 범위를 벗어나지 않도록 조정
    if (this.currentPage > totalPages) {
      this.currentPage = totalPages;
    }
    if (this.currentPage < 1) {
      this.currentPage = 1;
    }
    
    // 페이지이션 컨테이너가 없으면 생성
    let paginationContainer = document.querySelector('.file-pagination');
    if (!paginationContainer) {
      paginationContainer = document.createElement('div');
      paginationContainer.className = 'file-pagination';
      this.selectedWords.parentNode.appendChild(paginationContainer);
    }
    
    // 이전/다음 버튼과 페이지 정보 렌더링
    paginationContainer.innerHTML = `
      <button id="prevPage" ${this.currentPage <= 1 ? 'disabled' : ''}>이전</button>
      <span>${this.currentPage} / ${totalPages || 1}</span>
      <button id="nextPage" ${this.currentPage >= totalPages ? 'disabled' : ''}>다음</button>
    `;

    // 기존 이벤트 리스너 제거를 위해 새로운 요소로 교체
    const oldPagination = paginationContainer;
    const newPagination = oldPagination.cloneNode(true);
    oldPagination.parentNode.replaceChild(newPagination, oldPagination);

    // 이전 버튼 이벤트 리스너
    const prevButton = newPagination.querySelector('#prevPage');
    prevButton.addEventListener('click', () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.renderPage();
        this.renderPagination();
      }
    });

    // 다음 버튼 이벤트 리스너
    const nextButton = newPagination.querySelector('#nextPage');
    nextButton.addEventListener('click', () => {
      if (this.currentPage < totalPages) {
        this.currentPage++;
        this.renderPage();
        this.renderPagination();
      }
    });
  }

  initializeSearchBar() {
    // 기존 헤더 대신 검색창을 포함한 새로운 헤더 추가
    const searchHeader = document.createElement('div');
    searchHeader.className = 'search-header';
    searchHeader.innerHTML = `
      <div class="search-container">
        <span class="material-icons">search</span>
        <input type="text" id="wordSearchInput" placeholder="용어 검색...">
      </div>
    `;
    
    // 기존 selected-words-header를 새로운 검색 헤더로 교체
    const oldHeader = document.querySelector('.selected-words-header');
    if (oldHeader) {
      oldHeader.parentNode.replaceChild(searchHeader, oldHeader);
    }

    // 검색 입력 이벤트 리스너 설정
    this.searchInput = document.getElementById('wordSearchInput');
    this.searchInput.addEventListener('input', () => this.handleSearch());
  }

  handleSearch() {
    const searchTerm = this.searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
      this.filteredWords = this.words;
    } else {
      this.filteredWords = this.words.filter(word => 
        word.toLowerCase().includes(searchTerm)
      );
    }
    
    this.currentPage = 1; // 검색 시 첫 페이지로 리셋
    this.renderPage();
    this.renderPagination();
  }
}

// 인스턴스 생성
const fileManager = new FileManager(); 