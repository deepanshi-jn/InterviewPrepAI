export const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    GET_PROFILE: "/api/auth/profile",
    UPDATE_PROFILE_PHOTO: "/api/auth/profile/photo",
  },
  TWO_FACTOR: {
    ENABLE: "/api/2fa/enable",
    VERIFY: "/api/2fa/verify",
    DISABLE: "/api/2fa/disable",
    STATUS: "/api/2fa/status",
    VALIDATE: "/api/2fa/validate",
  },
  IMAGE: {
    UPLOAD_IMAGE: "/api/auth/upload-image",
  },
  AI: {
    GENERATE_QUESTIONS: "/api/ai/generate-questions",
    GENERATE_EXPLANATION: "/api/ai/generate-explanation",
    SUGGEST_TOPICS: "/api/ai/suggest-topics",
  },
  SESSION: {
    CREATE: "/api/sessions/create",
    GET_ALL: "/api/sessions/my-sessions",
    GET_ONE: (id) => `/api/sessions/${id}`,
    DELETE: (id) => `/api/sessions/${id}`,
  },
  QUESTION: {
    ADD_TO_SESSION: "/api/questions/add",
    PIN: (id) => `/api/questions/${id}/pin`,
    UPDATE_NOTES: (id) => `/api/questions/${id}/note`,
    CHECK: (id) => `/api/questions/${id}/check`,
  },
  MODULE: {
    CREATE: "/api/modules/create",
    GET_BY_SESSION: (sessionId) => `/api/modules/session/${sessionId}`,
    UPDATE: (id) => `/api/modules/${id}`,
    DELETE: (id) => `/api/modules/${id}`,
    ADD_QUESTIONS: (id) => `/api/modules/${id}/questions`,
    TOGGLE_COMPLETE: (id) => `/api/modules/${id}/toggle-complete`,
    GET_PROGRESS: (id) => `/api/modules/${id}/progress`,
  },
  INTERVIEW: {
    START: "/api/interviews/start",
    CONTINUE: "/api/interviews/continue",
    COMPLETE: (id) => `/api/interviews/${id}/complete`,
    GET_ONE: (id) => `/api/interviews/${id}`,
    GET_ALL: "/api/interviews/user/all",
    GET_SESSION_INTERVIEWS: (sessionId) =>
      `/api/interviews/session/${sessionId}`,
  },
  TECHNICAL_ROUND: {
    START: "/api/technical-round/start",
    SUBMIT_MCQ: "/api/technical-round/submit-mcq",
    SUBMIT_CODE: "/api/technical-round/submit-code",
    LOG_VIOLATION: "/api/technical-round/log-violation",
    COMPLETE: "/api/technical-round/complete",
    GET_ONE: (id) => `/api/technical-round/${id}`,
    GET_ALL: "/api/technical-round/user/all",
  },
};
