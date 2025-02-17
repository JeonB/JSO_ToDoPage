# 📌 Kanban Board 프로젝트

Drag & Drop 기반의 Kanban Board로, 작업(Task) 관리 및 실시간 저장이 가능한 프로젝트입니다. MongoDB를 백엔드로 활용하며, Vercel을 통한 배포 및 Dark Mode 지원을 포함합니다.

## 📸 배포 사이트

https://jso-to-do-page.vercel.app/

## 🚀 기술 스택

### 🔹 프론트엔드

- **Next.js 15** - 최신 App Router 기반으로 개발
- **TypeScript** - 안정적인 타입 검사
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
