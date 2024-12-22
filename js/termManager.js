export class TermManager {
  constructor() {
    this.terms = [];
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.filteredTerms = [];
  }

  async loadTerms() {
    try {
      const response = await fetch('data/terms.json');
      const data = await response.json();
      this.terms = data.terms;
      this.filteredTerms = this.terms;
      this.renderTerms();
      this.setupSearch();
    } catch (error) {
      console.error('용어를 불러오는데 실패했습니다:', error);
    }
  }

  setupSearch() {
    const searchInput = document.getElementById('searchInput');

    // 실시간 검색을 위한 이벤트 리스너
    searchInput.addEventListener('input', (e) => {
      this.searchTerms(e.target.value);
    });
  }

  searchTerms(query) {
    if (!query.trim()) {
      this.filteredTerms = this.terms;
    } else {
      query = query.toLowerCase();
      this.filteredTerms = this.terms.filter(term => 
        term.term.toLowerCase().includes(query)
      );
    }
    this.currentPage = 1;
    this.renderTerms();
  }

  renderTerms() {
    const tbody = document.querySelector('.terms-table tbody');
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const pageTerms = this.filteredTerms.slice(startIndex, endIndex);

    tbody.innerHTML = pageTerms.map(term => `
      <tr>
        <td>${term.term}</td>
        <td>${term.description}</td>
      </tr>
    `).join('');

    this.renderPagination();
  }

  renderPagination() {
    const totalPages = Math.ceil(this.filteredTerms.length / this.itemsPerPage);
    const paginationDiv = document.querySelector('.pagination');
    
    // 페이지가 없으면 페이지네이션을 표시하지 않음
    if (totalPages === 0) {
      paginationDiv.innerHTML = '';
      return;
    }

    let paginationHTML = `
      <button id="prevPage" ${this.currentPage === 1 ? 'disabled' : ''}>이전</button>
      <span>${this.currentPage} / ${totalPages}</span>
      <button id="nextPage" ${this.currentPage === totalPages ? 'disabled' : ''}>다음</button>
    `;

    paginationDiv.innerHTML = paginationHTML;

    // 이벤트 리스너 추가
    document.getElementById('prevPage')?.addEventListener('click', () => {
      if (this.currentPage > 1) {
        this.goToPage(this.currentPage - 1);
      }
    });

    document.getElementById('nextPage')?.addEventListener('click', () => {
      if (this.currentPage < totalPages) {
        this.goToPage(this.currentPage + 1);
      }
    });
  }

  goToPage(page) {
    const totalPages = Math.ceil(this.filteredTerms.length / this.itemsPerPage);
    if (page >= 1 && page <= totalPages) {
      this.currentPage = page;
      this.renderTerms();
    }
  }
} 