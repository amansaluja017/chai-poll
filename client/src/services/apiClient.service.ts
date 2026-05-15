import api from "./api.service.ts";

interface LoginResponse {
  accessToken: string;
  user: {
    _id: string;
    sub: string;
    email: string;
    given_name: string;
    family_name: string;
    name: string;
  }
};

export interface PollResponse {
  _id: string;
  title: string;
  description: string;
  createdBy: string;
  totalVotes: number;
  expiry: number;
  isCompleted: boolean;
  isAuthenticationRequired: boolean;
  questions: {
    _id: string;
    question: string;
    questionType: string;
    isRequired: boolean;
    options: {
      _id: string;
      option: string;
      votes: number;
    }[];
    textResponses: string[];
  }[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const apiClient = {
  authenticate: async (data: { code: string, redirect_url: string, nonce: string }) => {
    const response = await api.post(`${import.meta.env.VITE_API_URL}/api/v1/auth/authenticate`, data);

    return response.data.data as LoginResponse;
  },

  createPoll: async (data: any) => {
    const response = await api.post(`${import.meta.env.VITE_API_URL}/api/v1/poll/create`, data);
    return { response: response.data.data as PollResponse, status: response.status };
  },

  refresh: async () => {
    const response = await api.get(`${import.meta.env.VITE_API_URL}/api/v1/auth/refresh`);
    return response;
  },

  profile: async () => {
    const response = await api.get(`${import.meta.env.VITE_API_URL}/api/v1/auth/profile`);
    return response;
  },

  logout: async () => {
    const response = await api.get(`${import.meta.env.VITE_API_URL}/api/v1/auth/logout`);
    return response;
  },

  getMyPolls: async () => {
    const response = await api.get(`${import.meta.env.VITE_API_URL}/api/v1/poll/my-polls`);
    return { response: response.data.data as PollResponse[], status: response.status };
  },

  getPollById: async (id: string) => {
    const response = await api.get(`${import.meta.env.VITE_API_URL}/api/v1/poll/${id}`);
    return { response: response.data.data as PollResponse, status: response.status };
  },

  responsePoll: async (id: string, responseData: any) => {
    const response = await api.post(`${import.meta.env.VITE_API_URL}/api/v1/poll/response/${id}`, responseData);
    return { response: response.data.data as PollResponse, status: response.status };
  },

  getResponders: async (id: string) => {
    const response = await api.get(`${import.meta.env.VITE_API_URL}/api/v1/poll/responders/${id}`);
    return { response: response.data.data, status: response.status };
  },

  publishPoll: async (id: string) => {
    const response = await api.patch(`${import.meta.env.VITE_API_URL}/api/v1/poll/publish/${id}`);

    return {status: response.status};
  }
};

export default apiClient;
