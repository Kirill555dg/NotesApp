import type { User, Note, LoginResponse } from "./types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:12345"

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token")

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    window.location.href = "/"
    throw new ApiError(401, "Unauthorized")
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: "Unknown error" }))
    throw new ApiError(response.status, errorData.detail || "Request failed")
  }

  return response.json()
}

export const api = {
  // Auth
  async register(username: string, password: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Registration failed" }))
      throw new ApiError(response.status, errorData.detail || "Registration failed")
    }

    return response.json()
  },

  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Login failed" }))
      throw new ApiError(response.status, errorData.detail || "Invalid credentials")
    }

    return response.json()
  },

  // Notes
  async getNotes(): Promise<Note[]> {
    return fetchWithAuth("/notes")
  },

  async getNote(id: number): Promise<Note> {
    return fetchWithAuth(`/notes/${id}`)
  },

  async createNote(data: { title: string; content: string; tags: string[] }): Promise<Note> {
    return fetchWithAuth("/notes", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  async updateNote(id: number, data: { title: string; content: string; tags: string[] }): Promise<Note> {
    return fetchWithAuth(`/notes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },

  async deleteNote(id: number): Promise<{ message: string }> {
    return fetchWithAuth(`/notes/${id}`, {
      method: "DELETE",
    })
  },
}
