# Release Notes: 0.15.1

DF Sheet 세션의 Figma 이미지 등록에서 큰 파일이 Vercel 요청 본문 한도를
넘어 413으로 거부되던 문제를 해결합니다.

## 이미지 업로드

- 등록 JSON이 4,000,000바이트 이하이면 기존 DF Sheet API 경로를 사용합니다.
- 더 큰 PNG, JPEG, WebP 이미지는 DF Sheet에서 짧게 유효한 서명 URL을 받아
  R2에 직접 업로드한 뒤 이미지 정보를 등록합니다.
- 최종 이미지는 기존과 같이 DF Sheet가 WebP로 변환해 R2에 저장합니다.
- 원본 이미지의 최대 크기는 20MiB로 유지합니다.
- R2 요청에는 DF Sheet 로그인 토큰을 보내지 않습니다.

## 적용 순서

DF Sheet의 `/api/review/figma-images/presign` API와 R2 버킷 CORS를 먼저
적용한 뒤 이 패키지를 배포해야 합니다. 각 호스트는 새 패키지 버전으로
업데이트해야 큰 이미지 경로를 사용합니다.
