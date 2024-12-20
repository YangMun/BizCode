# 비즈니스 용어 도우미 (Business Terms Assistant) 🚀

## 📌 소개
업무 시 자주 사용되는 비즈니스 용어들을 쉽게 찾아보고 이해할 수 있는 크롬 확장 프로그램입니다.
현재는 용어 검색 기능을 제공하며, 추후 하이라이트 기능과 메모 기능이 추가될 예정입니다.

## ✨ 주요 기능
- 📚 **비즈니스 용어 검색**: 200개 이상의 비즈니스 용어 데이터베이스
- 🔍 **실시간 검색**: 타이핑과 동시에 검색 결과 표시
- 📑 **페이지네이션**: 깔끔한 UI로 용어 목록 제공
- 🎯 **직관적인 인터페이스**: 사용자 친화적인 디자인

## 🔜 개발 예정 기능
- 🖍 웹페이지 내 비즈니스 용어 하이라이트
- 📝 용어별 개인 메모 기능
- 🔄 용어 데이터 주기적 업데이트
- ⭐ 자주 사용하는 용어 즐겨찾기

## 🗂 프로젝트 구조
```
비즈코드/
├── data/
│   ├── images/           # 이미지 리소스
│   └── terms.json        # 200개 이상의 비즈니스 용어 데이터
├── js/
│   ├── background.js     # 크롬 확장 프로그램 백그라운드 스크립트
│   ├── fileManager.js    # 파일 업로드 관리
│   ├── highlightManager.js # 하이라이트 기능 관리
│   ├── sidepanel.js     # 사이드패널 UI 컨트롤
│   └── termManager.js    # 용어 검색 및 표시 관리
├── lib/
│   └── manifest.json     # 크롬 확장 프로그램 설정 파일
├── README.md            # 프로젝트 설명서
├── sidepanel.html       # 사이드패널 메인 HTML
└── styles.css           # 전체 스타일시트
```

## 💻 주요 파일 설명
- **manifest.json**: 크롬 확장 프로그램의 기본 설정 파일
- **background.js**: 확장 프로그램의 백그라운드 작업 처리
- **termManager.js**: 비즈니스 용어 검색 및 페이지네이션 처리
- **fileManager.js**: 파일 업로드 기능 관리
- **sidepanel.js**: 사이드패널 UI 이벤트 처리
- **terms.json**: 비즈니스 용어 데이터베이스 (200+ 용어)
- **styles.css**: UI 스타일 정의
- **sidepanel.html**: 사이드패널 메인 화면 구조

## 🛠 기술 스택
- HTML/CSS/JavaScript
- Chrome Extension APIs
- JSON

## 📋 설치 방법
1. 프로젝트를 다운로드 또는 클론합니다
2. Chrome 브라우저에서 `chrome://extensions`로 이동합니다
3. 우측 상단의 "개발자 모드"를 활성화합니다
4. "압축해제된 확장 프로그램을 로드합니다" 버튼을 클릭합니다
5. 다운로드한 프로젝트 폴더를 선택합니다

## 🤝 기여하기
프로젝트에 기여하고 싶으시다면:
1. 이 저장소를 포크합니다
2. 새로운 브랜치를 생성합니다
3. 변경사항을 커밋합니다
4. 브랜치에 푸시합니다
5. Pull Request를 생성합니다

## 👥 문의하기
문의사항이나 제안사항이 있으시다면 이슈를 생성해주세요.