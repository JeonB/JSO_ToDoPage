# 📌 Kanban Board 프로젝트

Drag & Drop 기반의 Kanban Board로, 작업(Task) 관리 및 실시간 저장이 가능한 프로젝트입니다. MongoDB를 백엔드로 활용하며, Vercel을 통한 배포 및 Dark Mode 지원을 포함합니다.

## 📸 배포 사이트

https://jso-to-do-page.vercel.app/

## 🚀 기술 스택

### 🔹 프론트엔드

- **Next.js 15** - 최신 App Router 기반으로 개발
- **TypeScript** - 안정적인 타입 검사
- **Zod** - 데이터 스키마, 유효성 검사
- **TailwindCSS** - 유틸리티 기반 스타일링
- **dnd-kit** - Drag & Drop 기능 구현

### 🔹 백엔드

- **MongoDB + Mongoose** - 데이터 저장 및 관리
- **Vercel Serverless Functions** - API 엔드포인트 처리

### 🔹 배포 및 기타

- **Vercel** - 서버리스 배포 및 자동 CI/CD
- **ESLint / Prettier** - 코드 스타일 통일

## ✨ 주요 기능

- ✔ Drag & Drop을 활용한 Task 이동
- ✔ Task 추가, 수정, 삭제 및 자동 저장
- ✔ Dark Mode 지원 (LocalStorage 유지)
- ✔ MongoDB 기반 실시간 데이터 업데이트
- ✔ 서버리스 API 활용 (Vercel Functions)

## 📂 프로젝트 구조
```
📦 kanban-board
┣ 📂 app
┃ ┣ 📂 lib
┃ ┃ ┣ 📜 actions.ts                  # 데이터 처리 API
┃ ┃ ┣ 📜 data.ts                     # 데이터 호출 API
┃ ┃ ┣ 📜 models.ts                   # MongoDB 데이터 스키마
┃ ┃ ┣ 📜 mongodb.ts                  # MongoDB 연결 설정
┃ ┃ ┣ 📜 type.ts                     # 타입 설정
┃ ┣ 📂 components
┃ ┃ ┣ 📂 kanbanboard
┃ ┃ ┃ ┣ 📜 Board.tsx                 # Kanban Board UI
┃ ┃ ┃ ┣ 📜 Task.tsx                  # 개별 Task 컴포넌트
┃ ┃ ┃ ┣ 📜 BoardList.tsx             # Board 리스트 관리
┃ ┃ ┃ ┗ 📜 DetailsMenu.tsx           # 세부 메뉴 UI
┃ ┃ ┣ 📂 layout
┃ ┃ ┃ ┗ 📜 Header.tsx                # 헤더 UI
┃ ┃ ┗ 📂 ui
┃ ┃ ┣ 📜 AddBoardButton.tsx          # Task 컴포넌트 추가버튼
┃ ┃ ┗ 📜 AddTaskButton.tsx           # Board 컴포넌트 추가버튼
┃ ┣ 📜 page.tsx                      # 메인 페이지
┃ ┣ 📜 layout.tsx                    # 전체 레이아웃
┃ ┗ 📜 globals.css                   # 글로벌 스타일링
```
## 🚀 실행 방법

### 1️⃣ 프로젝트 클론

    #클론
    git clone https://github.com/JeonB/JSO_ToDoPage.git

### 2️⃣ 환경 변수 설정

    #.env.local
    MONGODB_URI=your_mongodb_connection_string

### 3️⃣ 패키지 설치 및 실행

    #설치
    npm install 또는 pnpm install
    #설치
    npm run dev 또는 pnpm dev
