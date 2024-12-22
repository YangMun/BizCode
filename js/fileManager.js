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
    
    // PDF.js 워커 설정
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'lib/pdf.worker.mjs';
    
    this.initializeFileUpload();
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
      // 파일을 ArrayBuffer로 읽기
      const arrayBuffer = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsArrayBuffer(file);
      });

      // PDF 문서 로드
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      // 모든 페이지의 텍스트 추출
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
      }

      return fullText;
    } catch (error) {
      throw new Error('PDF 파일 읽기 실패: ' + error.message);
    }
  }

  displayContent(content) {
    // 내용을 줄바꿈과 공백을 기준으로 단어 단위로 분리
    this.words = content.split(/[\s\n]+/).filter(word => word.length > 0);
    this.renderPage();
    this.renderPagination();
  }

  renderPage() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const pageWords = this.words.slice(startIndex, endIndex);
    
    this.selectedWords.innerHTML = pageWords.map(word => `
      <div class="selected-word">
        ${word}
        <span class="material-icons delete-word" title="삭제">close</span>
      </div>
    `).join('');

    // 삭제 버튼 이벤트 리스너 추가
    this.selectedWords.querySelectorAll('.delete-word').forEach((button, index) => {
      button.addEventListener('click', (e) => {
        const globalIndex = startIndex + index;
        this.words.splice(globalIndex, 1);
        this.renderPage();
        this.renderPagination();
      });
    });
  }

  renderPagination() {
    const totalPages = Math.ceil(this.words.length / this.itemsPerPage);
    
    // 페재 페이지가 범위를 벗어나지 않도록 조정
    if (this.currentPage > totalPages) {
      this.currentPage = totalPages;
    }
    if (this.currentPage < 1) {
      this.currentPage = 1;
    }
    
    // 페이지네이션 컨테이너가 없으면 생성
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
}

// 인스턴스 생성
const fileManager = new FileManager(); 