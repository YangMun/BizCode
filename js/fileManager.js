class FileManager {
  constructor() {
    this.fileInput = document.getElementById('fileInput');
    this.fileInfo = document.querySelector('.file-info');
    
    this.initializeFileUpload();
  }

  initializeFileUpload() {
    this.fileInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        this.displayFileName(file);
      }
    });
  }

  displayFileName(file) {
    // 파일 확장자에 따른 아이콘 선택
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
}

// 인스턴스 생성
const fileManager = new FileManager(); 